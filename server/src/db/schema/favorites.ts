import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { properties } from "./properties";
import { homeDesigns } from "./designs";

// User Favorites table
export const favorites = mysqlTable("favorites", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    userId: varchar("user_id", { length: 36 }).notNull(), // References Better Auth user
    propertyId: varchar("property_id", { length: 36 }).references(() => properties.id, { onDelete: "cascade" }),
    designId: varchar("design_id", { length: 36 }).references(() => homeDesigns.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const favoritesRelations = relations(favorites, ({ one }) => ({
    property: one(properties, {
        fields: [favorites.propertyId],
        references: [properties.id],
    }),
    design: one(homeDesigns, {
        fields: [favorites.designId],
        references: [homeDesigns.id],
    }),
}));

export type Favorite = typeof favorites.$inferSelect;
export type NewFavorite = typeof favorites.$inferInsert;
