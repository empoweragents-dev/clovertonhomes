import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
// Enums
export const storeysEnum = pgEnum("storeys", ["single", "double", "split"]);
export const designCategoryEnum = pgEnum("design_category", ["popular", "single_storey", "double_storey", "acreage", "dual_occupancy"]);
// Home Designs table
export const homeDesigns = pgTable("home_designs", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    description: text("description"),
    priceFrom: integer("price_from"), // in cents
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    garages: integer("garages").notNull(),
    storeys: storeysEnum("storeys").default("single").notNull(),
    category: designCategoryEnum("category").default("popular").notNull(),
    squareMeters: integer("square_meters"),
    landWidth: decimal("land_width", { precision: 5, scale: 2 }),
    landDepth: decimal("land_depth", { precision: 5, scale: 2 }),
    featuredImage: text("featured_image"),
    badge: varchar("badge", { length: 50 }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
// Design Images table (gallery)
export const designImages = pgTable("design_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    designId: uuid("design_id").references(() => homeDesigns.id, { onDelete: "cascade" }).notNull(),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    type: varchar("type", { length: 20 }).default("exterior"), // exterior, interior, floorplan
    sortOrder: integer("sort_order").default(0),
});
// Design Floorplans table
export const designFloorplans = pgTable("design_floorplans", {
    id: uuid("id").primaryKey().defaultRandom(),
    designId: uuid("design_id").references(() => homeDesigns.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    imageUrl: text("image_url").notNull(),
    sortOrder: integer("sort_order").default(0),
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
