const express = require("express");
const { existsSync } = require("fs");
const path = require("path");
const { spawn } = require("child_process");

// Hostinger starts this file directly and supplies PORT at runtime.
process.env.NODE_ENV ||= "production";
process.env.PORT ||= "3000";

const app = express();
const port = Number.parseInt(process.env.PORT, 10);
const root = __dirname;

/**
 * Startup state, reported by /health.
 *
 * The app binds the port immediately and loads the real server afterwards, so
 * there is a window where it is listening but cannot serve pages. Reporting only
 * "starting" through that window made a hang indistinguishable from a slow boot:
 * the site returned 503 for an hour with no way to tell which step was stuck
 * without shell access. /health now names the phase, how long it has been in it,
 * and the error if one was thrown -- so a failed deploy can be diagnosed from a
 * browser.
 */
const state = {
    phase: "checking",   // checking -> building -> importing -> preparing -> ready | failed
    since: Date.now(),
    error: null,
    // Tail of the build's own output. A build that fails only on this host is
    // undiagnosable from an exit code alone, and the log file needs shell access
    // that whoever is deploying may not have -- so the reason is served instead.
    buildLog: [],
};

const BUILD_LOG_LINES = 60;

function recordBuildOutput(chunk) {
    for (const raw of chunk.toString().split(String.fromCharCode(10))) {
        const line = raw.trim();
        if (!line) continue;
        state.buildLog.push(line);
        if (state.buildLog.length > BUILD_LOG_LINES) state.buildLog.shift();
    }
}

/**
 * The memory this process is actually allowed, in MB, or null if unknown.
 *
 * os.totalmem() reports the whole machine on shared hosting -- 15 GB on a
 * container that may be allowed 512 MB -- and Node sizes its heap from that. It
 * then happily grows past the container limit and is killed by the OOM killer,
 * which surfaces as a bare exit 1 with no error text. cgroup is the only source
 * that knows the real ceiling.
 */
function detectMemoryLimitMb() {
    const sources = [
        "/sys/fs/cgroup/memory.max",                     // cgroup v2
        "/sys/fs/cgroup/memory/memory.limit_in_bytes",   // cgroup v1
    ];
    for (const file of sources) {
        try {
            const raw = require("fs").readFileSync(file, "utf8").trim();
            if (raw === "max") continue;
            const bytes = Number.parseInt(raw, 10);
            // v1 reports an absurd sentinel when unlimited.
            if (Number.isFinite(bytes) && bytes > 0 && bytes < 64 * 1024 * 1024 * 1024) {
                return Math.round(bytes / 1048576);
            }
        } catch { /* not linux, or not readable */ }
    }
    return null;
}

/** Heap cap for the build: most of the container, not most of the machine. */
function buildHeapMb() {
    const limit = detectMemoryLimitMb();
    if (!limit) return 1024;
    return Math.max(384, Math.min(3072, Math.round(limit * 0.75)));
}

function setPhase(phase) {
    state.phase = phase;
    state.since = Date.now();
    console.log(`[startup] ${phase}`);
}

function fail(message) {
    state.phase = "failed";
    state.since = Date.now();
    state.error = message;
    console.error(`[startup] failed: ${message}`);
}

app.get("/health", (req, res) => {
    res.status(state.phase === "failed" ? 500 : 200).json({
        status: state.phase === "ready" ? "ok" : state.phase,
        secondsInPhase: Math.round((Date.now() - state.since) / 1000),
        ...(state.error ? { error: state.error } : {}),
        ...(state.phase === "failed" && state.buildLog.length ? { buildLog: state.buildLog } : {}),
        nodeEnv: process.env.NODE_ENV,
        nodeVersion: process.version,
        machineMemoryMb: Math.round(require("os").totalmem() / 1048576),
        containerMemoryMb: detectMemoryLimitMb(),
        buildHeapMb: buildHeapMb(),
        cwd: process.cwd(),
        appDir: root,
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res, next) => {
    if (state.phase === "ready") return next();

    if (req.path === "/") {
        return res.status(200).send("Cloverton Homes is starting");
    }

    res.setHeader("Retry-After", "10");
    res.status(503).json({
        status: state.phase,
        secondsInPhase: Math.round((Date.now() - state.since) / 1000),
        ...(state.error ? { error: state.error } : {}),
    });
});

const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Express server listening on port ${port}; preparing application...`);
});

server.on("error", (error) => {
    console.error("Express server failed:", error);
    process.exit(1);
});

const watchdog = setInterval(() => {
    if (state.phase === "ready" || state.phase === "failed") return clearInterval(watchdog);
    console.warn(`[startup] still "${state.phase}" after ${Math.round((Date.now() - state.since) / 1000)}s`);
}, 30000);

/**
 * Runs a package's CLI with this process's own node binary.
 *
 * Not `npx`, and no shell: the app runs under a process manager whose PATH is
 * minimal, so `npx next build` exited 127 (command not found) even though next
 * was installed right there in node_modules. Resolving the CLI's JS entry point
 * and handing it to process.execPath removes both PATH and the shell from the
 * equation.
 */
function runCli(packageName, relativeEntry, args) {
    return new Promise((resolve, reject) => {
        const entry = path.join(root, "node_modules", packageName, relativeEntry);
        if (!existsSync(entry)) {
            return reject(new Error(
                `${packageName} is not installed in ${root}/node_modules ` +
                `(looked for ${relativeEntry}). Run npm install in this directory.`
            ));
        }
        // Cap the build's heap. Shared hosting gives the container far less memory
        // than the machine reports, and Node sizes its old space from the reported
        // total -- so a default-configured build can be OOM-killed (a bare exit 1,
        // no error message) long before Node would collect. NODE_OPTIONS lets the
        // host raise it if there is genuinely more room.
        const child = spawn(process.execPath, [entry, ...args], {
            cwd: root,
            stdio: ["ignore", "pipe", "pipe"],
            env: {
                ...process.env,
                NODE_OPTIONS: process.env.NODE_OPTIONS || `--max-old-space-size=${buildHeapMb()}`,
                NEXT_TELEMETRY_DISABLED: "1",
            },
        });
        child.stdout.on("data", (d) => { process.stdout.write(d); recordBuildOutput(d); });
        child.stderr.on("data", (d) => { process.stderr.write(d); recordBuildOutput(d); });
        child.on("error", reject);
        child.on("close", (code) => {
            code === 0
                ? resolve()
                : reject(new Error(`${packageName} ${args.join(" ")} exited with code ${code}`));
        });
    });
}

/**
 * Builds in place when the build output isn't next to this file.
 *
 * This host builds in one directory and runs the app from another
 * (hbuilds/source/repository vs hbuilds/versions/<id>/nodejs), and .next does not
 * survive the copy -- so a deploy whose build log says "success" still starts a
 * runtime directory with no pages in it, and every URL 503s. Building here, from
 * the directory the app is actually running in, removes the dependency on what
 * the host copies between the two.
 *
 * server/dist alone is not proof of a good build: tsc emits output even when it
 * reports errors, so a failed `npm run build` can leave server/dist behind while
 * `next build` never ran at all. Both outputs are checked independently.
 */
async function ensureBuild() {
    const needsNext = !existsSync(path.join(root, ".next", "BUILD_ID"));
    const needsServer = !existsSync(path.join(root, "server", "dist", "index.js"));

    if (!needsNext && !needsServer) {
        console.log("[startup] build present");
        return;
    }

    setPhase("building");
    console.log(`[startup] missing ${[needsNext && ".next", needsServer && "server/dist"].filter(Boolean).join(" and ")} in ${root}`);

    if (needsServer) await runCli("typescript", "bin/tsc", ["--project", "server/tsconfig.json"]);
    // --webpack, not the default Turbopack. Turbopack requires next-swc's native
    // bindings, and this host's glibc is too old to load them (GLIBC_2.29 not
    // found), so Next falls back to WASM and Turbopack refuses to run. Webpack
    // works with the WASM bindings. Used on every platform rather than only where
    // it is required, so a local build exercises the same pipeline as production.
    if (needsNext) await runCli("next", "dist/bin/next", ["build", "--webpack"]);

    if (!existsSync(path.join(root, ".next", "BUILD_ID"))) {
        throw new Error("next build finished but .next/BUILD_ID is still missing");
    }
    console.log("[startup] build complete");
}

ensureBuild()
    .then(() => {
        setPhase("importing");
        return import("./server/dist/index.js");
    })
    .then(({ prepareApp }) => {
        setPhase("preparing");
        return prepareApp(app);
    })
    .then(() => {
        clearInterval(watchdog);
        setPhase("ready");
        console.log("Cloverton Homes is ready");
    })
    .catch((error) => {
        clearInterval(watchdog);
        fail(error && error.message ? error.message : String(error));
        console.error(error);
        // Deliberately stays alive instead of exiting. Exiting produced a restart
        // loop in which every response was the host's generic 503 page and the
        // reason was visible only in a log file. Staying up serves the reason at
        // /health, and the host can still restart or redeploy over it.
    });
