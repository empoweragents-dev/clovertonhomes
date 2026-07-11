import { mysqlTable, varchar, boolean, timestamp } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

// Regions table
export const regions = mysqlTable("regions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    state: varchar("state", { length: 50 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Region = typeof regions.$inferSelect;
export type NewRegion = typeof regions.$inferInsert;
