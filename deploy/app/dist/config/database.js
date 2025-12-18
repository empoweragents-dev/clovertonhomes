import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "./env";
import * as schema from "../db/schema";
// Create postgres connection
const client = postgres(env.DATABASE_URL, {
    max: 10, // Max connections in pool
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Required for Supabase connection pooler
});
// Create drizzle instance with schema
export const db = drizzle(client, { schema });
