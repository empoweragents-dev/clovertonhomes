import mysql from "mysql2/promise";

// Shared MySQL pool for Next.js API routes (used in `next dev`; in production the
// unified Express server serves /api/* directly). Cached across hot reloads.
declare global {
    // eslint-disable-next-line no-var
    var _mysqlPool: mysql.Pool | undefined;
}

export function getPool(): mysql.Pool {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    if (!global._mysqlPool) {
        global._mysqlPool = mysql.createPool({
            uri: url,
            connectionLimit: 5,
            connectTimeout: 15000,
            // Hostinger closes idle connections; keepalive + bounded idle prevents
            // handing out dead sockets (ECONNRESET).
            enableKeepAlive: true,
            keepAliveInitialDelay: 10000,
            idleTimeout: 60000,
            maxIdle: 2,
        });
    }
    return global._mysqlPool;
}

function isTransient(err: any): boolean {
    const code = err?.code || "";
    return ["ECONNRESET", "PROTOCOL_CONNECTION_LOST", "EPIPE", "ETIMEDOUT"].includes(code);
}

// Run a parameterised query and return typed rows. Retries once on a transient
// connection drop (stale pooled socket).
export async function query<T = any>(sql: string, params: any[] = []): Promise<T[]> {
    try {
        const [rows] = await getPool().query(sql, params);
        return rows as T[];
    } catch (err: any) {
        if (isTransient(err)) {
            const [rows] = await getPool().query(sql, params);
            return rows as T[];
        }
        throw err;
    }
}
