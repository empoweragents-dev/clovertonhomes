import { mkdir, writeFile, unlink, access } from "fs/promises";
import path from "path";
import { env } from "./env.js";

/**
 * Local filesystem image storage.
 *
 * Replaces the previous third-party object-storage backend, which was dead: its
 * host stopped resolving, so every upload failed at runtime while still forcing
 * three required credentials into the environment for a service we no longer use.
 *
 * Files are written under UPLOAD_DIR and served back at /uploads by the Express
 * static mount in index.ts. "Buckets" are kept as the top-level folder names so
 * the public API and the stored URLs keep the shape the admin screens already
 * expect -- this is a backend swap, not an interface change.
 *
 * UPLOAD_DIR should point OUTSIDE the git deployment directory on a host that
 * replaces the checkout on every deploy, or uploaded images are lost each time
 * the site ships. It defaults to public/uploads for local development.
 */

export const STORAGE_BUCKETS = {
    DESIGNS: "designs",
    PROPERTIES: "properties",
    TESTIMONIALS: "testimonials",
    AVATARS: "avatars",
    GENERAL: "general",
} as const;

/** Web path these files are served from. Must match the mount in index.ts. */
export const UPLOAD_URL_PREFIX = "/uploads";

/** Absolute directory holding uploaded files. */
export function getUploadDir(): string {
    return env.UPLOAD_DIR;
}

/** Rejects anything that would escape the upload directory. */
function assertSafe(relativePath: string): void {
    if (!relativePath || path.isAbsolute(relativePath)) {
        throw new Error("Invalid file path");
    }
    const resolved = path.resolve(getUploadDir(), relativePath);
    const root = path.resolve(getUploadDir());
    if (resolved !== root && !resolved.startsWith(root + path.sep)) {
        throw new Error("Invalid file path");
    }
}

export function getPublicUrl(bucket: string, relativePath: string): string {
    return `${UPLOAD_URL_PREFIX}/${bucket}/${relativePath}`.replace(/\/+/g, "/");
}

export async function uploadFile(
    bucket: string,
    relativePath: string,
    file: Buffer,
    _contentType: string,
): Promise<{ url: string; error: Error | null }> {
    try {
        const target = path.join(bucket, relativePath);
        assertSafe(target);
        const absolute = path.join(getUploadDir(), target);
        await mkdir(path.dirname(absolute), { recursive: true });
        await writeFile(absolute, file);
        return { url: getPublicUrl(bucket, relativePath), error: null };
    } catch (err) {
        return { url: "", error: err as Error };
    }
}

export async function deleteFile(bucket: string, relativePath: string): Promise<boolean> {
    try {
        const target = path.join(bucket, relativePath);
        assertSafe(target);
        await unlink(path.join(getUploadDir(), target));
        return true;
    } catch {
        return false;
    }
}

export async function fileExists(bucket: string, relativePath: string): Promise<boolean> {
    try {
        const target = path.join(bucket, relativePath);
        assertSafe(target);
        await access(path.join(getUploadDir(), target));
        return true;
    } catch {
        return false;
    }
}
