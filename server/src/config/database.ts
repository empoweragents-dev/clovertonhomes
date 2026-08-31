import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "./env.js";
import * as schema from "../db/schema/index.js";

// Create MySQL connection pool. Hostinger closes idle connections, so enable
// keepalive and bound idle sockets to avoid ECONNRESET on reused connections.
const pool = mysql.createPool({
    uri: env.DATABASE_URL,
    connectionLimit: 10,
    connectTimeout: 15000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    idleTimeout: 60000,
    maxIdle: 4,
});

// Create drizzle instance with schema
export const db = drizzle(pool, { schema, mode: "default" });

export type Database = typeof db;
