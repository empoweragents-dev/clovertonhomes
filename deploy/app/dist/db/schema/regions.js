import { pgTable, uuid, varchar, boolean, timestamp } from "drizzle-orm/pg-core";
// Regions table
export const regions = pgTable("regions", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    state: varchar("state", { length: 50 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});
