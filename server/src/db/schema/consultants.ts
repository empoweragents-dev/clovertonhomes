import { mysqlTable, varchar, text, boolean, timestamp } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

// Consultants table
export const consultants = mysqlTable("consultants", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 }), // Optional link to auth user
    name: varchar("name", { length: 150 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 255 }),
    avatarUrl: text("avatar_url"),
    bio: text("bio"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Consultant = typeof consultants.$inferSelect;
export type NewConsultant = typeof consultants.$inferInsert;
