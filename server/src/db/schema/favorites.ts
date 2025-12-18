import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { properties } from "./properties";
import { homeDesigns } from "./designs";

// User Favorites table
export const favorites = pgTable("favorites", {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").notNull(), // References Better Auth user
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }),
    designId: uuid("design_id").references(() => homeDesigns.id, { onDelete: "cascade" }),
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
