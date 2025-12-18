import { pgTable, uuid, varchar, text, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { regions } from "./regions";

// Estates table
export const estates = pgTable("estates", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    regionId: uuid("region_id").references(() => regions.id).notNull(),
    description: text("description"),
    address: text("address"),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const estatesRelations = relations(estates, ({ one }) => ({
    region: one(regions, {
        fields: [estates.regionId],
        references: [regions.id],
    }),
}));

export type Estate = typeof estates.$inferSelect;
export type NewEstate = typeof estates.$inferInsert;
