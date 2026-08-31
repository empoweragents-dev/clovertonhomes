import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "../config/database.js";

/**
 * MySQL has no RETURNING clause. These helpers replicate the Postgres
 * "insert/update ... returning *" ergonomics by generating the UUID up front
 * (or reusing an existing id) and re-selecting the row by primary key.
 *
 * Every table in this schema uses a varchar(36) `id` primary key.
 */

// Insert one row (auto-generating a UUID id when absent) and return the persisted row.
export async function insertReturning<T = any>(table: any, values: Record<string, any>): Promise<T> {
    const id = values.id ?? randomUUID();
    await db.insert(table).values({ ...values, id });
    const [row] = await db.select().from(table).where(eq(table.id, id));
    return row as T;
}

// Update one row by id and return the updated row (or undefined if it didn't exist).
export async function updateReturning<T = any>(table: any, id: string, values: Record<string, any>): Promise<T | undefined> {
    await db.update(table).set(values).where(eq(table.id, id));
    const [row] = await db.select().from(table).where(eq(table.id, id));
    return row as T | undefined;
}
