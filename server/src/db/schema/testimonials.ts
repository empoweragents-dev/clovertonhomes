import { pgTable, uuid, varchar, text, boolean, timestamp, integer } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { properties } from "./properties";
import { homeDesigns } from "./designs";

// Testimonials table
export const testimonials = pgTable("testimonials", {
    id: uuid("id").primaryKey().defaultRandom(),
    familyName: varchar("family_name", { length: 150 }).notNull(),
    quote: text("quote").notNull(),
    rating: integer("rating").default(5), // 1-5 stars
    imageUrl: text("image_url"),

    // Related entities (optional)
    designId: uuid("design_id").references(() => homeDesigns.id),
    propertyId: uuid("property_id").references(() => properties.id),

    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const testimonialsRelations = relations(testimonials, ({ one }) => ({
    design: one(homeDesigns, {
        fields: [testimonials.designId],
        references: [homeDesigns.id],
    }),
    property: one(properties, {
        fields: [testimonials.propertyId],
        references: [properties.id],
    }),
}));

export type Testimonial = typeof testimonials.$inferSelect;
export type NewTestimonial = typeof testimonials.$inferInsert;
