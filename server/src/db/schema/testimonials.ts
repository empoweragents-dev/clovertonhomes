import { mysqlTable, varchar, text, boolean, timestamp, int } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { properties } from "./properties.js";
import { homeDesigns } from "./designs.js";

// Testimonials table
export const testimonials = mysqlTable("testimonials", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    familyName: varchar("family_name", { length: 150 }).notNull(),
    quote: text("quote").notNull(),
    rating: int("rating").default(5), // 1-5 stars
    imageUrl: text("image_url"),

    // Related entities (optional)
    designId: varchar("design_id", { length: 36 }).references(() => homeDesigns.id),
    propertyId: varchar("property_id", { length: 36 }).references(() => properties.id),

    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: int("sort_order").default(0),
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
