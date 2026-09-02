const express = require("express");

// Hostinger starts this file directly and supplies PORT at runtime.
process.env.NODE_ENV ||= "production";
process.env.PORT ||= "3000";

const app = express();
const port = Number.parseInt(process.env.PORT, 10);

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
    phase: "importing",   // importing -> preparing -> ready | failed
    since: Date.now(),
    error: null,
};

function setPhase(phase) {
    state.phase = phase;
    state.since = Date.now();
    console.log(`[startup] ${phase}`);
}

app.get("/health", (req, res) => {
    const seconds = Math.round((Date.now() - state.since) / 1000);
    res.status(state.phase === "failed" ? 500 : 200).json({
        status: state.phase === "ready" ? "ok" : state.phase,
        secondsInPhase: seconds,
        ...(state.error ? { error: state.error } : {}),
        nodeEnv: process.env.NODE_ENV,
        cwd: process.cwd(),
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res, next) => {
    if (state.phase === "ready") return next();

    if (req.path === "/") {
        return res.status(200).send("Cloverton Homes is starting");
    }

    res.setHeader("Retry-After", "5");
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

// A prepare that never settles is the failure mode that is hardest to see from
// outside, so say so in the log rather than waiting silently.
const watchdog = setInterval(() => {
    if (state.phase === "ready" || state.phase === "failed") return clearInterval(watchdog);
    const seconds = Math.round((Date.now() - state.since) / 1000);
    console.warn(`[startup] still "${state.phase}" after ${seconds}s`);
}, 30000);

import("./server/dist/index.js")
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
        state.phase = "failed";
        state.since = Date.now();
        state.error = error && error.message ? error.message : String(error);
        console.error("Failed to prepare Cloverton Homes:", error);
        // Deliberately stays alive instead of exiting. Exiting produced a restart
        // loop in which every response was the host's generic 503 page and the
        // reason was visible only in a log file. Staying up serves the reason at
        // /health, and the host can still restart or redeploy over it.
    });
