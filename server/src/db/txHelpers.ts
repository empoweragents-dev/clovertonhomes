import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../config/database.js";

/**
 * Transaction-aware write helpers.
 *
 * The existing insertReturning/updateReturning in ./helpers.ts are bound to the
 * module-level `db` and cannot join a transaction. Rather than adding an optional
 * parameter to those — which would leave 100+ existing call sites *looking*
 * transactional while silently running outside any transaction, all against the live
 * production database — this module takes the executor explicitly as the first
 * argument. Transactional discipline is then visible at every call site.
 *
 * MySQL has no RETURNING, so multi-row writes pre-generate UUIDs in application code
 * and insert in chunks instead of re-selecting per row.
 */

/** Either the pool-backed db or an open transaction. */
export type Executor = typeof db | Parameters<Parameters<typeof db.transaction>[0]>[0];

/** Runs `fn` inside a transaction. Keep the body to DML only — never disk or HTTP. */
export async function withTx<T>(fn: (tx: Executor) => Promise<T>): Promise<T> {
    return db.transaction(async (tx) => fn(tx as Executor));
}

/** Insert one row and return it, generating the id when absent. */
export async function insertRowReturning<T = any>(
    ex: Executor, table: any, values: Record<string, any>,
): Promise<T> {
    const id = values.id ?? randomUUID();
    await ex.insert(table).values({ ...values, id });
    const [row] = await ex.select().from(table).where(eq(table.id, id));
    return row as T;
}

/** Update one row by id and return it. */
export async function updateRowReturning<T = any>(
    ex: Executor, table: any, id: string, values: Record<string, any>,
): Promise<T | undefined> {
    await ex.update(table).set(values).where(eq(table.id, id));
    const [row] = await ex.select().from(table).where(eq(table.id, id));
    return row as T | undefined;
}

/**
 * Inserts many rows in chunks. Callers pre-generate ids so child rows can reference
 * parents without a round trip — the pattern used for copying a 65-clause template.
 */
export async function insertMany(
    ex: Executor, table: any, rows: Record<string, any>[], chunkSize = 200,
): Promise<number> {
    if (!rows.length) return 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
        await ex.insert(table).values(rows.slice(i, i + chunkSize));
    }
    return rows.length;
}
