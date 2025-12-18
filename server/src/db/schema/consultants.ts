import { pgTable, uuid, varchar, text, boolean, timestamp } from "drizzle-orm/pg-core";

// Consultants table
export const consultants = pgTable("consultants", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id"), // Optional link to auth user
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
