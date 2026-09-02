/**
 * Builds the app after install when the host hasn't built it itself.
 *
 * app.js cannot start without BOTH server/dist (the compiled Express server it
 * imports) and .next (the page build). Some hosts run only `npm install` and no
 * build step, which leaves neither in place: the import fails, app.js exits, the
 * host restarts it, and every URL serves 503 in a loop with no obvious cause.
 *
 * So: if either output is missing after install, build it here. When both are
 * already present -- a host that does run a build command, or a normal local
 * checkout -- this does nothing and costs nothing.
 *
 * Escape hatch: SKIP_POSTINSTALL_BUILD=1 npm install
 */

import { existsSync } from "fs";
import { spawnSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const nextBuild = path.join(root, ".next");
const serverBuild = path.join(root, "server", "dist", "index.js");

if (process.env.SKIP_POSTINSTALL_BUILD === "1") {
    console.log("[build] SKIP_POSTINSTALL_BUILD=1 - skipping.");
    process.exit(0);
}

const missing = [];
if (!existsSync(nextBuild)) missing.push(".next");
if (!existsSync(serverBuild)) missing.push("server/dist");

if (missing.length === 0) {
    console.log("[build] .next and server/dist already present - nothing to do.");
    process.exit(0);
}

console.log(`[build] Missing ${missing.join(" and ")} - building now.`);
console.log("[build] The app cannot start without both, so this runs as part of install.");

const result = spawnSync("npm", ["run", "build"], {
    cwd: root,
    stdio: "inherit",
    shell: true,
});

if (result.status !== 0) {
    console.error("[build] BUILD FAILED - the app will not start until this is fixed.");
    console.error("[build] Check the deploy log above for the compiler error.");
    process.exit(result.status ?? 1);
}

console.log("[build] Build complete.");
