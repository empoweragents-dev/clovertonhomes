import { mysqlTable, varchar, text, boolean, int } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes.js";

// Inclusion Tiers table (e.g., Designer, Elegance)
export const inclusionTiers = mysqlTable("inclusion_tiers", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    sortOrder: int("sort_order").default(0),
    isActive: boolean("is_active").default(true).notNull(),
});

// Inclusion Categories table (e.g., Kitchen, Bathroom)
export const inclusionCategories = mysqlTable("inclusion_categories", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    icon: varchar("icon", { length: 50 }), // Material symbol name
    headline: varchar("headline", { length: 150 }), // e.g., "Culinary Excellence"
    description: text("description"),
    imageUrl: text("image_url"),
    sortOrder: int("sort_order").default(0),
});

// Inclusion Items table
export const inclusionItems = mysqlTable("inclusion_items", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    tierId: varchar("tier_id", { length: 36 }).references(() => inclusionTiers.id, { onDelete: "cascade" }).notNull(),
    categoryId: varchar("category_id", { length: 36 }).references(() => inclusionCategories.id, { onDelete: "cascade" }).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: text("image_url"),
    badge: varchar("badge", { length: 50 }), // e.g., "New Release", "Best Seller"
    features: jsonType<string[]>("features"), // List of features
    sortOrder: int("sort_order").default(0),
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

export type InclusionTier = typeof inclusionTiers.$inferSelect;
export type NewInclusionTier = typeof inclusionTiers.$inferInsert;
export type InclusionCategory = typeof inclusionCategories.$inferSelect;
export type NewInclusionCategory = typeof inclusionCategories.$inferInsert;
export type InclusionItem = typeof inclusionItems.$inferSelect;
export type NewInclusionItem = typeof inclusionItems.$inferInsert;
