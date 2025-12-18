import { pgTable, uuid, varchar, text, boolean, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { properties } from "./properties";
import { homeDesigns } from "./designs";
import { consultants } from "./consultants";

// Enums
export const enquiryTypeEnum = pgEnum("enquiry_type", ["general", "property", "design", "custom_build"]);
export const enquiryStatusEnum = pgEnum("enquiry_status", ["new", "contacted", "qualified", "closed"]);

// Enquiries table
export const enquiries = pgTable("enquiries", {
    id: uuid("id").primaryKey().defaultRandom(),
    type: enquiryTypeEnum("type").default("general").notNull(),

    // Related entities (optional)
    propertyId: uuid("property_id").references(() => properties.id),
    designId: uuid("design_id").references(() => homeDesigns.id),
    consultantId: uuid("consultant_id").references(() => consultants.id),

    // Contact details
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),

    // Preferences (from forms)
    interestType: varchar("interest_type", { length: 100 }), // e.g., "Building a New Home"
    homeType: varchar("home_type", { length: 50 }), // e.g., "Single Storey"
    designPreference: varchar("design_preference", { length: 20 }), // "existing" or "custom"

    message: text("message"),
    source: varchar("source", { length: 50 }), // Which page/form

    // Status tracking
    status: enquiryStatusEnum("status").default("new").notNull(),
    assignedTo: uuid("assigned_to"), // FK to users table
    notes: text("notes"), // Internal notes

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const enquiriesRelations = relations(enquiries, ({ one }) => ({
    property: one(properties, {
        fields: [enquiries.propertyId],
        references: [properties.id],
    }),
    design: one(homeDesigns, {
        fields: [enquiries.designId],
        references: [homeDesigns.id],
    }),
    consultant: one(consultants, {
        fields: [enquiries.consultantId],
        references: [consultants.id],
    }),
}));

export type Enquiry = typeof enquiries.$inferSelect;
export type NewEnquiry = typeof enquiries.$inferInsert;
