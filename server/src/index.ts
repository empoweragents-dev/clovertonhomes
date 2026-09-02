import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import next from "next";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath, parse as parseUrl } from "url";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { auth } from "./config/auth.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";

// Initialize Next.js
const dev = env.NODE_ENV !== "production";

/**
 * Locates the directory holding the Next build. The two deploy layouts put it in
 * different places relative to this file, and the process cwd is set by the host
 * rather than by us, so neither assumption is safe on its own:
 *
 *   git build, root "./"   ->  <repo>/server/dist/index.js  with <repo>/.next
 *   packaged deploy/app    ->  <app>/dist/index.js          with <app>/.next
 *
 * Checks cwd first (correct for both when the host sets it as expected), then walks
 * up from this file. Falls back to cwd so the failure is Next's own clear message
 * rather than a confusing path error.
 */
function resolveNextDir(): string {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
        process.cwd(),
        path.resolve(here, ".."),        // <app>/dist/index.js  -> <app>
        path.resolve(here, "..", ".."),  // <repo>/server/dist   -> <repo>
    ];
    for (const dir of candidates) {
        if (existsSync(path.join(dir, ".next"))) return dir;
    }
    console.warn("Could not locate a .next build; falling back to cwd:", process.cwd());
    return process.cwd();
}

const nextApp = next({
    dev,
    dir: dev ? "../" : resolveNextDir(),
});
const handle = nextApp.getRequestHandler();

export async function prepareApp(app: Express): Promise<void> {
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

    // Cache control middleware - Prevents stale HTML cache issues
    app.use((req, res, next) => {
        const path = req.path;

        // Static assets from _next should be cached aggressively (content-hashed, immutable)
        if (path.startsWith('/_next/static/')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
        }
        // Images can be cached for a moderate time
        else if (path.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day
        }
        // HTML pages should not be cached long to prevent stale references to CSS/JS chunks
        else if (path.endsWith('.html') || !path.includes('.')) {
            res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, must-revalidate');
        }

        next();
    });

    // Better Auth routes - handles /api/auth/*
    app.all("/api/auth/*", toNodeHandler(auth));

    // API routes
    app.use("/api", apiRoutes);

    // Next.js static asset handling (optimized)
    app.get('/_next/*', (req, res) => {
        return handle(req, res, parseUrl(req.url, true));
    });

    // Specific image routes if needed (e.g. from public)
    app.get('/images/*', (req, res) => {
        return handle(req, res, parseUrl(req.url, true));
    });

    // Handle all other routes with Next.js
    // IMPORTANT: Move notFoundHandler to API route catch-all if explicitly needed for API only
    // Otherwise, Next.js handles 404s for pages.

    // Custom API 404 handler
    app.use("/api/*", notFoundHandler);

    // Next.js Handler (All other routes)
    app.all("*", (req, res) => {
        return handle(req, res, parseUrl(req.url, true));
    });

    // Error handler (Global)
    app.use(errorHandler);

    console.log(`
        🏠 Cloverton Homes Unified Server
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
        📍 Server running on port ${env.PORT}
        🌍 Environment: ${env.NODE_ENV}
        🔗 App URL: http://localhost:${env.PORT}
        🔗 API Base: http://localhost:${env.PORT}/api
        🔐 Auth: http://localhost:${env.PORT}/api/auth
        ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          `);
}

// Preserve direct server/src and server/dist execution for local backend workflows.
const entryFile = process.argv[1] ? path.resolve(process.argv[1]) : "";
if (entryFile === fileURLToPath(import.meta.url)) {
    const standaloneApp = express();

    prepareApp(standaloneApp)
        .then(() => {
            standaloneApp.listen(env.PORT, "0.0.0.0", () => {
                console.log(`Express server listening on port ${env.PORT}`);
            });
        })
        .catch((error) => {
            console.error("Failed to start server:", error);
            process.exit(1);
        });
}
