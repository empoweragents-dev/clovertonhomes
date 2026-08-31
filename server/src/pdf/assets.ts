import { existsSync, readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

/**
 * Resolves runtime assets (PDF fonts, logo) that live in the repo's `public/` folder.
 *
 * `public/` is chosen deliberately over a folder under `server/src`: tsc only emits
 * .ts/.tsx output into `server/dist`, so any binary asset kept beside the source would
 * be missing in production. `build-unified.bat` already copies `public/` into the
 * deploy package, so assets placed there survive a deploy with no build-script change.
 *
 * Layout differs between dev and production, hence the candidate list:
 *   dev         cwd = server/           -> ../public/...
 *   production  cwd = deploy app root   -> ./public/...
 */
const here = dirname(fileURLToPath(import.meta.url));

function candidates(relativePath: string): string[] {
    return [
        resolve(process.cwd(), "public", relativePath),
        resolve(process.cwd(), "..", "public", relativePath),
        // dist/pdf/assets.js -> ../../../public (repo root) covers unusual cwds.
        resolve(here, "..", "..", "..", "public", relativePath),
        resolve(here, "..", "..", "public", relativePath),
    ];
}

/** Absolute path to an asset under public/. Throws with every path tried. */
export function resolveAssetPath(relativePath: string): string {
    const tried = candidates(relativePath);
    for (const candidate of tried) {
        if (existsSync(candidate)) return candidate;
    }
    throw new Error(
        `Asset not found: public/${relativePath}\nTried:\n  ${tried.join("\n  ")}\n` +
        `If this is production, confirm the deploy copied the public/ folder.`
    );
}

// Binary assets are read once and cached — a 40-page render must not re-read the
// logo per page, and fonts are registered once per process.
const bufferCache = new Map<string, Buffer>();

export function readAsset(relativePath: string): Buffer {
    const cached = bufferCache.get(relativePath);
    if (cached) return cached;
    const buffer = readFileSync(resolveAssetPath(relativePath));
    bufferCache.set(relativePath, buffer);
    return buffer;
}
