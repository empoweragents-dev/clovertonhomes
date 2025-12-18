import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, date, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { homeDesigns } from "./designs";
import { regions } from "./regions";
import { estates } from "./estates";
import { consultants } from "./consultants";

// Enums
export const propertyBadgeEnum = pgEnum("property_badge", ["new", "fixed", "sold", "under_offer"]);

// Properties table (House & Land Packages)
export const properties = pgTable("properties", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    designId: uuid("design_id").references(() => homeDesigns.id),
    estateId: uuid("estate_id").references(() => estates.id),
    regionId: uuid("region_id").references(() => regions.id).notNull(),
    // consultantId removed
    description: text("description"),
    address: text("address"),
    lotNumber: varchar("lot_number", { length: 20 }),

    // Pricing
    housePrice: integer("house_price"), // in cents
    landPrice: integer("land_price"), // in cents
    totalPrice: integer("total_price"), // in cents

    // Specs
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    garages: integer("garages").notNull(),
    squareMeters: integer("square_meters"),

    // Land details
    landWidth: decimal("land_width", { precision: 5, scale: 2 }),
    landDepth: decimal("land_depth", { precision: 5, scale: 2 }),
    landArea: integer("land_area"), // sq meters

    // Display
    featuredImage: text("featured_image"),
    badge: propertyBadgeEnum("badge"),

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
export const propertyImages = pgTable("property_images", {
    id: uuid("id").primaryKey().defaultRandom(),
    propertyId: uuid("property_id").references(() => properties.id, { onDelete: "cascade" }).notNull(),
    imageUrl: text("image_url").notNull(),
    altText: varchar("alt_text", { length: 255 }),
    sortOrder: integer("sort_order").default(0),
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
