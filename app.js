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
};

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
        nodeEnv: process.env.NODE_ENV,
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
        const child = spawn(process.execPath, [entry, ...args], { cwd: root, stdio: "inherit" });
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
    if (needsNext) await runCli("next", "dist/bin/next", ["build"]);

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
