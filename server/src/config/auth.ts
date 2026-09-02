import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./database.js";
import { env } from "./env.js";

/**
 * Auth is built on FIRST USE, not at import.
 *
 * `betterAuth()` throws on an invalid config — most easily by BETTER_AUTH_SECRET
 * being missing or under 32 characters. This module is imported at the top of
 * server/src/index.ts, so a throw here used to reject the dynamic import in app.js,
 * which exits the process; the host then restarts it and the whole public site
 * serves 503 in a crash loop. A mis-set environment variable must not be able to
 * take the marketing site, the contact page and the listings offline.
 *
 * So the failure is contained to auth: getAuth() returns null, protected routes
 * fail CLOSED (503, never an open door), and everything unauthenticated keeps
 * serving. The cause is logged once, loudly, with the fix.
 */

/**
 * Derived from build(), NOT from `typeof betterAuth`.
 *
 * betterAuth() returns Auth<> parameterised by the exact options object passed
 * in, so `ReturnType<typeof betterAuth>` -- which resolves to the generic
 * default Auth<BetterAuthOptions> -- is a different, incompatible type. It
 * happened to compile against one 1.x release and failed against a later one,
 * breaking the production build while the local build stayed green. Deriving
 * from build() means the type follows whatever the installed version returns.
 */
type AuthInstance = ReturnType<typeof build>;

let instance: AuthInstance | null = null;
let initialised = false;

function build() {
    return betterAuth({
    database: drizzleAdapter(db, {
        provider: "mysql",
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins: env.BETTER_AUTH_TRUSTED_ORIGINS,
    emailAndPassword: {
        enabled: true,
        requireEmailVerification: false, // Set to true in production
    },
    session: {
        expiresIn: 60 * 60 * 24 * 7, // 7 days
        updateAge: 60 * 60 * 24, // Refresh every 24 hours
        cookieCache: {
            enabled: true,
            maxAge: 60 * 5, // 5 minutes
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "user",
            },
        },
        },
    });
}

/** The auth instance, or null when it could not be configured. Never throws. */
export function getAuth(): AuthInstance | null {
    if (initialised) return instance;
    initialised = true;

    // Check the secret ourselves before constructing. better-auth validates it
    // inside an async init, so the failure arrives as an unhandled rejection that
    // no try/catch here can intercept -- and an unhandled rejection at import time
    // kills the process. Checking the precondition up front makes the outcome
    // deterministic: a clean 503 on /api/auth/*, instead of a dropped connection.
    const secret = env.BETTER_AUTH_SECRET ?? "";
    if (secret.length < 32) {
        console.error("!! AUTHENTICATION IS DISABLED - the app runs, but nobody can sign in.");
        console.error("   BETTER_AUTH_SECRET is " + (secret ? secret.length + " characters" : "not set") + "; at least 32 are required.");
        console.error("   Set it in the environment and restart.");
        instance = null;
        return null;
    }

    try {
        instance = build();
    } catch (error) {
        console.error("!! AUTHENTICATION IS DISABLED - the app runs, but nobody can sign in.");
        console.error("   " + (error as Error).message);
        console.error("   Set BETTER_AUTH_SECRET (32+ chars) in the environment and restart.");
        instance = null;
    }
    return instance;
}

export type Auth = AuthInstance;
