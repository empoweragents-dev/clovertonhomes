import "dotenv/config";
export const env = {
    // Server
    PORT: parseInt(process.env.PORT || "3001"),
    NODE_ENV: process.env.NODE_ENV || "development",
    // Database
    DATABASE_URL: process.env.DATABASE_URL,
    // Supabase
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    // Better Auth
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],
    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
// Validate required environment variables
const requiredEnvVars = [
    "DATABASE_URL",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "BETTER_AUTH_SECRET",
];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.warn(`Warning: Missing required environment variable: ${envVar}`);
    }
}
