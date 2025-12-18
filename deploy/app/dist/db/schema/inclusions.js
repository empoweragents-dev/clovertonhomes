import { pgTable, uuid, varchar, text, boolean, integer, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// Inclusion Tiers table (e.g., Designer, Elegance)
export const inclusionTiers = pgTable("inclusion_tiers", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true).notNull(),
});
// Inclusion Categories table (e.g., Kitchen, Bathroom)
export const inclusionCategories = pgTable("inclusion_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    icon: varchar("icon", { length: 50 }), // Material symbol name
    headline: varchar("headline", { length: 150 }), // e.g., "Culinary Excellence"
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: integer("sort_order").default(0),
});
// Inclusion Items table
export const inclusionItems = pgTable("inclusion_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    tierId: uuid("tier_id").references(() => inclusionTiers.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid("category_id").references(() => inclusionCategories.id, { onDelete: "cascade" }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    badge: varchar("badge", { length: 50 }), // e.g., "New Release", "Best Seller"
    features: json("features").$type().default([]), // List of features
    sortOrder: integer("sort_order").default(0),
});
// Relations
export const inclusionTiersRelations = relations(inclusionTiers, ({ many }) => ({
    items: many(inclusionItems),
}));
export const inclusionCategoriesRelations = relations(inclusionCategories, ({ many }) => ({
    items: many(inclusionItems),
}));
export const inclusionItemsRelations = relations(inclusionItems, ({ one }) => ({
    tier: one(inclusionTiers, {
        fields: [inclusionItems.tierId],
        references: [inclusionTiers.id],
    }),
    category: one(inclusionCategories, {
        fields: [inclusionItems.categoryId],
        references: [inclusionCategories.id],
    }),
}));
