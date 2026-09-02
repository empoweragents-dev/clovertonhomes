import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// Load env deterministically from server/.env regardless of the process CWD.
// (src/config and dist/config are both two levels below the server root.)
const __dirnameLocal = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: resolve(__dirnameLocal, "../../.env") });
// Also honour a CWD .env / already-set process env as a fallback.
dotenv.config();

export const env = {
    // Server
    PORT: parseInt(process.env.PORT || "3001"),
    NODE_ENV: process.env.NODE_ENV || "development",

    // Database
    DATABASE_URL: process.env.DATABASE_URL!,

    // Uploaded images. Point this outside the deployment directory in production,
    // or every deploy wipes the uploads with the rest of the checkout.
    UPLOAD_DIR: process.env.UPLOAD_DIR
        ? resolve(process.env.UPLOAD_DIR)
        : resolve(__dirnameLocal, "../../../public/uploads"),

    // Better Auth
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL || "http://localhost:3001",
    BETTER_AUTH_TRUSTED_ORIGINS: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",") || ["http://localhost:3000"],

    // Frontend
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",

    // Brevo Email Service (legacy API key, kept for compatibility)
    BREVO_API_KEY: process.env.BREVO_API_KEY || "",

    // SMTP (Hostinger mailbox: smtp.hostinger.com:465 SSL)
    SMTP_HOST: process.env.SMTP_HOST || "smtp.hostinger.com",
    SMTP_PORT: parseInt(process.env.SMTP_PORT || "465"),
    SMTP_USER: process.env.SMTP_USER || "info@clovertonhomes.com.au",
    SMTP_PASS: process.env.SMTP_PASS || "",
    // Where enquiry notifications are delivered, and the From address used.
    MAIL_TO: process.env.MAIL_TO || "info@clovertonhomes.com.au",
    MAIL_FROM: process.env.MAIL_FROM || "info@clovertonhomes.com.au",
};

// Validate required environment variables
const requiredEnvVars = [
    "DATABASE_URL",
    "BETTER_AUTH_SECRET",
];

for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.warn(`Warning: Missing required environment variable: ${envVar}`);
    }
}
