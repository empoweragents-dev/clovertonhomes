import { mysqlTable, varchar, text, boolean, timestamp, int, decimal, date, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { homeDesigns } from "./designs.js";
import { regions } from "./regions.js";
import { estates } from "./estates.js";

// Enum value set
export const propertyBadgeValues = ["new", "fixed", "sold", "under_offer"] as const;

// Properties table (House & Land Packages)
export const properties = mysqlTable("properties", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    designId: varchar("design_id", { length: 36 }).references(() => homeDesigns.id),
    estateId: varchar("estate_id", { length: 36 }).references(() => estates.id),
    regionId: varchar("region_id", { length: 36 }).references(() => regions.id).notNull(),
    // consultantId removed
    description: text("description"),
    address: text("address"),
    lotNumber: varchar("lot_number", { length: 20 }),

    // Pricing
    housePrice: int("house_price"), // in cents
    landPrice: int("land_price"), // in cents
    totalPrice: int("total_price"), // in cents

    // Specs
    bedrooms: int("bedrooms").notNull(),
    bathrooms: int("bathrooms").notNull(),
    garages: int("garages").notNull(),
    squareMeters: int("square_meters"),

    // Land details
    landWidth: decimal("land_width", { precision: 5, scale: 2 }),
    landDepth: decimal("land_depth", { precision: 5, scale: 2 }),
    landArea: int("land_area"), // sq meters

    // Display
    featuredImage: text("featured_image"),
    badge: mysqlEnum("badge", propertyBadgeValues),

    // Status
    titlesExpected: date("titles_expected"),
    isLandReady: boolean("is_land_ready").default(false),

    // Location
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),

    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Property Images table
export const propertyImages = mysqlTable("property_images", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    propertyId: varchar("property_id", { length: 36 }).references(() => properties.id, { onDelete: "cascade" }).notNull(),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    sortOrder: int("sort_order").default(0),
});

// Relations
export const propertiesRelations = relations(properties, ({ one, many }) => ({
    design: one(homeDesigns, {
        fields: [properties.designId],
        references: [homeDesigns.id],
    }),
    estate: one(estates, {
        fields: [properties.estateId],
        references: [estates.id],
    }),
    region: one(regions, {
        fields: [properties.regionId],
        references: [regions.id],
    }),
    images: many(propertyImages),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
    property: one(properties, {
        fields: [propertyImages.propertyId],
        references: [properties.id],
    }),
}));

export type Property = typeof properties.$inferSelect;
export type NewProperty = typeof properties.$inferInsert;
export type PropertyImage = typeof propertyImages.$inferSelect;
export type NewPropertyImage = typeof propertyImages.$inferInsert;
