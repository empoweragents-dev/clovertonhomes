import { createHash } from "crypto";
import { createReadStream, existsSync } from "fs";
import { mkdir, readFile, rename, stat, unlink, writeFile } from "fs/promises";
import { dirname, resolve, isAbsolute } from "path";
import { randomUUID } from "crypto";
import type { Readable } from "stream";

/**
 * Document storage behind a narrow interface, so the backend can later move to
 * S3/R2 without touching tender or PDF code.
 *
 * Local filesystem for now: the app runs on Hostinger shared Node hosting where the
 * account's home filesystem is writable and persistent. Files are NEVER web-rooted —
 * they are served only through an authenticated Express route.
 *
 * Production must point DOCUMENT_STORAGE_DIR at a path OUTSIDE the deployed app
 * root: build-unified.bat replaces dist/, .next/ and public/ on every deploy, so
 * anything stored inside them would be destroyed.
 */

export interface StoredObject {
    key: string;
    byteSize: number;
    sha256: string;
    mimeType: string;
}

function storageRoot(): string {
    const configured = process.env.DOCUMENT_STORAGE_DIR;

    if (!configured) {
        if (process.env.NODE_ENV === "production") {
            throw new Error(
                "DOCUMENT_STORAGE_DIR must be set in production, pointing OUTSIDE the app root " +
                "(a deploy overwrites dist/, .next/ and public/, destroying anything stored there).",
            );
        }
        // Dev default: server/storage, which is gitignored.
        return resolve(process.cwd(), "storage");
    }
    return isAbsolute(configured) ? configured : resolve(process.cwd(), configured);
}

/** Rejects traversal and anything outside the storage root. */
function resolveKey(key: string): string {
    if (!/^[A-Za-z0-9/_.\-]+$/.test(key) || key.includes("..")) {
        throw new Error(`Invalid storage key: ${key}`);
    }
    const root = storageRoot();
    const full = resolve(root, key);
    if (!full.startsWith(root)) throw new Error(`Storage key escapes root: ${key}`);
    return full;
}

export const documentStorage = {
    /** Writes atomically: temp file then rename, so a reader never sees a partial file. */
    async put(key: string, buffer: Buffer, mimeType = "application/pdf"): Promise<StoredObject> {
        const full = resolveKey(key);
        await mkdir(dirname(full), { recursive: true });

        const temp = `${full}.tmp-${randomUUID()}`;
        await writeFile(temp, buffer);
        await rename(temp, full);

        return {
            key,
            byteSize: buffer.length,
            sha256: createHash("sha256").update(buffer).digest("hex"),
            mimeType,
        };
    },

    async get(key: string): Promise<Buffer> {
        return readFile(resolveKey(key));
    },

    createReadStream(key: string): Readable {
        return createReadStream(resolveKey(key));
    },

    async exists(key: string): Promise<boolean> {
        try { return existsSync(resolveKey(key)); } catch { return false; }
    },

    async stat(key: string): Promise<{ byteSize: number; mtime: Date } | null> {
        try {
            const s = await stat(resolveKey(key));
            return { byteSize: s.size, mtime: s.mtime };
        } catch { return null; }
    },

    async delete(key: string): Promise<boolean> {
        try { await unlink(resolveKey(key)); return true; } catch { return false; }
    },

    /** Verifies stored bytes still match what was recorded at issue time (§22). */
    async verify(key: string, expectedSha256: string): Promise<boolean> {
        try {
            const buffer = await this.get(key);
            return createHash("sha256").update(buffer).digest("hex") === expectedSha256;
        } catch { return false; }
    },

    /** documents/tender/2026/TND-2026-0001/TND-2026-0001-R0.pdf */
    buildKey(docType: string, year: number, documentNumber: string, revision: number): string {
        return `documents/${docType}/${year}/${documentNumber}/${documentNumber}-R${revision}.pdf`;
    },

    root: storageRoot,
};
