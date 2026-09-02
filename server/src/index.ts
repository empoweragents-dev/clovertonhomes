import express, { type Express } from "express";
import cors from "cors";
import helmet from "helmet";
import next from "next";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath, parse as parseUrl } from "url";
import { toNodeHandler } from "better-auth/node";
import { env } from "./config/env.js";
import { getAuth } from "./config/auth.js";
import apiRoutes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";
import { UPLOAD_URL_PREFIX, getUploadDir } from "./config/storage.js";

// Initialize Next.js
const dev = env.NODE_ENV !== "production";

/**
 * Locates the directory holding the Next build (.next).
 *
 * The process CWD is set by the host, not by us, and the deployed tree has lived
 * in three different shapes: the repo root, a packaged deploy/app, and Hostinger's
 * git build directory (~/hbuild). Guessing wrong means Next boots against a
 * missing build and every page fails, so search rather than assume -- and when
 * nothing is found, say so in a way that names the actual problem instead of
 * surfacing a confusing path error from deep inside Next.
 */
function resolveNextDir(): string {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const candidates = [
        process.cwd(),                          // host set it correctly
        path.resolve(here, ".."),               // <app>/dist/index.js   -> <app>
        path.resolve(here, "..", ".."),         // <repo>/server/dist    -> <repo>
        path.resolve(here, "..", "..", ".."),   // nested one deeper
        path.resolve(process.cwd(), "hbuild"),  // Hostinger git build output
        path.resolve(process.cwd(), ".."),
    ];

    const seen = new Set<string>();
    for (const dir of candidates) {
        if (seen.has(dir)) continue;
        seen.add(dir);
        if (existsSync(path.join(dir, ".next"))) {
            console.log(`Next build found at ${path.join(dir, ".next")}`);
            return dir;
        }
    }

    console.error("!! NO NEXT BUILD (.next) FOUND - the site cannot render any page.");
    console.error("   Looked in: " + [...seen].join(", "));
    console.error("   Run `npm run build` in the deployed directory, then restart.");
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

    // Cache control.
    //
    // The header has to be set as the response goes out, not on the way in.
    // Next writes its own Cache-Control afterwards, and for a statically
    // prerendered page that is `s-maxage=31536000` -- so the CDN cached the
    // homepage for a year, kept serving it after a redeploy, and the HTML asked
    // for CSS chunk hashes that no longer existed. The page arrived unstyled on
    // first load while client-side navigation, which fetches from the origin,
    // looked fine.
    //
    // Content-hashed assets are safe to cache forever; the documents that
    // reference them are not, because their asset hashes change every build.
    app.use((req, res, next) => {
        const requestPath = req.path;

        const value =
            requestPath.startsWith('/_next/static/') || requestPath.startsWith('/uploads/')
                ? 'public, max-age=31536000, immutable'
                : /\.(jpg|jpeg|png|gif|webp|svg|ico|woff2?|ttf)$/.test(requestPath)
                    ? 'public, max-age=86400'
                    // Documents: let the CDN hold them only briefly, and always
                    // revalidate, so a deploy takes effect within the minute.
                    : 'public, max-age=0, s-maxage=60, must-revalidate';

        const writeHead = res.writeHead.bind(res);
        res.writeHead = function patched(...args: Parameters<typeof writeHead>) {
            res.setHeader('Cache-Control', value);
            return writeHead(...args);
        } as typeof res.writeHead;

        next();
    });

    // Uploaded images, written by /api/upload to a directory that may sit outside
    // the deployment tree. Mounted ahead of the API and Next so a filename can
    // never be shadowed by a route.
    app.use(UPLOAD_URL_PREFIX, express.static(getUploadDir(), {
        maxAge: "7d",
        fallthrough: true,
        index: false,
    }));

    // Better Auth routes - handles /api/auth/*
    const authInstance = getAuth();
    if (authInstance) {
        app.all("/api/auth/*", toNodeHandler(authInstance));
    } else {
        app.all("/api/auth/*", (_req, res) => {
            res.status(503).json({
                success: false,
                message: "Authentication is not configured on this server.",
            });
        });
    }

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
        📂 CWD: ${process.cwd()}
        🖼  Uploads: ${getUploadDir()}
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
