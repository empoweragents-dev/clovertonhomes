import { mysqlTable, varchar, text, boolean, timestamp, int, decimal, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";

// Enum value sets (MySQL defines enums inline on the column)
export const storeysValues = ["single", "double", "split"] as const;
export const designCategoryValues = ["popular", "single_storey", "double_storey", "acreage", "dual_occupancy"] as const;

// Home Designs table
export const homeDesigns = mysqlTable("home_designs", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    description: text("description"),
    priceFrom: int("price_from"), // in cents
    bedrooms: int("bedrooms").notNull(),
    bathrooms: int("bathrooms").notNull(),
    garages: int("garages").notNull(),
    storeys: mysqlEnum("storeys", storeysValues).default("single").notNull(),
    category: mysqlEnum("category", designCategoryValues).default("popular").notNull(),
    squareMeters: int("square_meters"),
    landWidth: decimal("land_width", { precision: 5, scale: 2 }),
    landDepth: decimal("land_depth", { precision: 5, scale: 2 }),
    featuredImage: text("featured_image"),
    badge: varchar("badge", { length: 50 }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: int("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Design Images table (gallery)
export const designImages = mysqlTable("design_images", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    designId: varchar("design_id", { length: 36 }).references(() => homeDesigns.id, { onDelete: "cascade" }).notNull(),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    type: varchar("type", { length: 20 }).default("exterior"), // exterior, interior, floorplan
    sortOrder: int("sort_order").default(0),
});

// Design Floorplans table
export const designFloorplans = mysqlTable("design_floorplans", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    designId: varchar("design_id", { length: 36 }).references(() => homeDesigns.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    imageUrl: text("image_url").notNull(),
    sortOrder: int("sort_order").default(0),
});

// Relations
export const homeDesignsRelations = relations(homeDesigns, ({ many }) => ({
    images: many(designImages),
    floorplans: many(designFloorplans),
}));

export const designImagesRelations = relations(designImages, ({ one }) => ({
    design: one(homeDesigns, {
        fields: [designImages.designId],
        references: [homeDesigns.id],
    }),
}));

export const designFloorplansRelations = relations(designFloorplans, ({ one }) => ({
    design: one(homeDesigns, {
        fields: [designFloorplans.designId],
        references: [homeDesigns.id],
    }),
}));

export type HomeDesign = typeof homeDesigns.$inferSelect;
export type NewHomeDesign = typeof homeDesigns.$inferInsert;
export type DesignImage = typeof designImages.$inferSelect;
export type NewDesignImage = typeof designImages.$inferInsert;
export type DesignFloorplan = typeof designFloorplans.$inferSelect;
export type NewDesignFloorplan = typeof designFloorplans.$inferInsert;
