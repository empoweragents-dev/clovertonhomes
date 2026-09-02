const express = require("express");

// Hostinger starts this file directly and supplies PORT at runtime.
process.env.NODE_ENV ||= "production";
process.env.PORT ||= "3000";

const app = express();
const port = Number.parseInt(process.env.PORT, 10);
let ready = false;

app.get("/health", (req, res) => {
    res.json({
        status: ready ? "ok" : "starting",
        timestamp: new Date().toISOString(),
    });
});

app.use((req, res, next) => {
    if (ready) return next();

    if (req.path === "/") {
        return res.status(200).send("Cloverton Homes is starting");
    }

    res.setHeader("Retry-After", "5");
    return res.status(503).json({ status: "starting" });
});

const server = app.listen(port, "0.0.0.0", () => {
    console.log(`Express server listening on port ${port}; preparing application...`);
});

server.on("error", (error) => {
    console.error("Express server failed:", error);
    process.exit(1);
});

import("./server/dist/index.js")
    .then(({ prepareApp }) => prepareApp(app))
    .then(() => {
        ready = true;
        console.log("Cloverton Homes is ready");
    })
    .catch((error) => {
        console.error("Failed to prepare Cloverton Homes:", error);
        server.close(() => process.exit(1));
    });
