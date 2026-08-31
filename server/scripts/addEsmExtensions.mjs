/**
 * Adds explicit .js extensions to relative imports under server/src.
 *
 * server/package.json declares "type": "module", so the compiled dist/ runs as
 * Node ESM — where extensionless relative specifiers are NOT resolved. The source
 * was written for a bundler ("moduleResolution": "bundler"), so `node dist/index.js`
 * has always failed with ERR_MODULE_NOT_FOUND on the very first import. That is why
 * the unified Express server has never started in production.
 *
 * Rewrites, resolving each specifier against the filesystem:
 *   ./config/env      -> ./config/env.js        (file)
 *   ../db/schema      -> ../db/schema/index.js  (directory)
 *
 * Package specifiers are left alone. Idempotent: anything already ending .js is
 * skipped. Run from the repo root or server/.
 *
 *   node server/scripts/addEsmExtensions.mjs          report only
 *   node server/scripts/addEsmExtensions.mjs --write  apply
 */
import { readdirSync, readFileSync, statSync, writeFileSync, existsSync } from "fs";
import { dirname, join, resolve } from "path";
import { fileURLToPath } from "url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");
const write = process.argv.includes("--write");

function walk(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
        const full = join(dir, e.name);
        if (e.isDirectory()) return walk(full);
        return /\.tsx?$/.test(e.name) ? [full] : [];
    });
}

/** Works out what a relative specifier should become, or null to leave it alone. */
function resolveSpecifier(fileDir, spec) {
    if (!spec.startsWith(".")) return null;          // package import
    if (/\.(js|json|css)$/.test(spec)) return null;  // already explicit

    const base = resolve(fileDir, spec);

    // A concrete source file: ./config/env -> ./config/env.js
    for (const ext of [".ts", ".tsx"]) {
        if (existsSync(base + ext)) return `${spec}.js`;
    }
    // A directory with an index: ../db/schema -> ../db/schema/index.js
    if (existsSync(base) && statSync(base).isDirectory()) {
        for (const ext of [".ts", ".tsx"]) {
            if (existsSync(join(base, `index${ext}`))) return `${spec}/index.js`;
        }
    }
    return null;
}

const files = walk(SRC);
let changedFiles = 0, changedImports = 0;
const unresolved = [];

for (const file of files) {
    const source = readFileSync(file, "utf8");
    let touched = 0;

    // Covers: import x from "..."; export { x } from "..."; import type ... from "..."
    const next = source.replace(
        /(\bfrom\s+)(["'])(\.[^"']*)\2/g,
        (match, prefix, quote, spec) => {
            const replacement = resolveSpecifier(dirname(file), spec);
            if (!replacement) {
                if (spec.startsWith(".") && !/\.(js|json|css)$/.test(spec)) unresolved.push(`${file}: ${spec}`);
                return match;
            }
            touched++;
            return `${prefix}${quote}${replacement}${quote}`;
        },
    );

    if (touched) {
        changedFiles++;
        changedImports += touched;
        if (write) writeFileSync(file, next);
    }
}

console.log(`${write ? "Rewrote" : "Would rewrite"} ${changedImports} imports across ${changedFiles} files (${files.length} scanned).`);
if (unresolved.length) {
    console.log(`\n${unresolved.length} relative specifiers could not be resolved — check manually:`);
    for (const u of unresolved.slice(0, 20)) console.log(`  ${u}`);
}
if (!write) console.log("\nReport only. Re-run with --write to apply.");
