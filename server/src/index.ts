import express from "express";
import cors from "cors";
import helmet from "helmet";
import next from "next";
import path from "path";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env";
import { auth } from "./config/auth";
import apiRoutes from "./routes";
import { errorHandler, notFoundHandler } from "./middleware";

// Initialize Next.js
const dev = env.NODE_ENV !== "production";
const nextApp = next({
    dev,
    // In production, we expect .next to be in the same folder as the running script
    dir: dev ? "../" : process.cwd(),
});
const handle = nextApp.getRequestHandler();

// Create Express app
const app = express();

(async () => {
    try {
        // Prepare Next.js
        // Prepare Next.js
        await nextApp.prepare();
        console.log("✅ Next.js app prepared");

        // Security middleware
        app.use(helmet({
            crossOriginResourcePolicy: { policy: "cross-origin" },
            contentSecurityPolicy: false, // Updated: Disable specific CSP for Next.js compatibility
        }));

        // CORS configuration
        app.use(cors({
            origin: env.BETTER_AUTH_TRUSTED_ORIGINS,
            credentials: true,
        }));

        // Body parsing
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        // Health check
        app.get("/health", (req, res) => {
            res.json({ status: "ok", timestamp: new Date().toISOString() });
        });

        // Better Auth routes - handles /api/auth/*
        app.all("/api/auth/*", toNodeHandler(auth));

        // API routes
        app.use("/api", apiRoutes);

        // Next.js static asset handling (optimized)
        app.get('/_next/*', (req, res) => {
            return handle(req, res);
        });

        // Specific image routes if needed (e.g. from public)
        app.get('/images/*', (req, res) => {
            return handle(req, res);
        });

        // Handle all other routes with Next.js
        // IMPORTANT: Move notFoundHandler to API route catch-all if explicitly needed for API only
        // Otherwise, Next.js handles 404s for pages.

        // Custom API 404 handler
        app.use("/api/*", notFoundHandler);

        // Next.js Handler (All other routes)
        app.all("*", (req, res) => {
            return handle(req, res);
        });

        // Error handler (Global)
        app.use(errorHandler);

        // Start server
        const PORT = env.PORT;

        app.listen(PORT, () => {
            console.log(`
        🏠 Cloverton Homes Unified Server
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        📍 Server running on port ${PORT}
        🌍 Environment: ${env.NODE_ENV}
        🔗 App URL: http://localhost:${PORT}
        🔗 API Base: http://localhost:${PORT}/api
        🔐 Auth: http://localhost:${PORT}/api/auth
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `);
        });

    } catch (e) {
        console.error("Failed to start server:", e);
        process.exit(1);
    }
})();

export default app;
