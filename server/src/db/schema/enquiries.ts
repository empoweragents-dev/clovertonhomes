import { mysqlTable, varchar, text, timestamp, mysqlEnum } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { randomUUID } from "crypto";
import { properties } from "./properties.js";
import { homeDesigns } from "./designs.js";
import { consultants } from "./consultants.js";

// Enum value sets
export const enquiryTypeValues = ["general", "property", "design", "custom_build"] as const;
export const enquiryStatusValues = ["new", "contacted", "qualified", "closed"] as const;

// Enquiries table
export const enquiries = mysqlTable("enquiries", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    type: mysqlEnum("type", enquiryTypeValues).default("general").notNull(),

    // Related entities (optional)
    propertyId: varchar("property_id", { length: 36 }).references(() => properties.id),
    designId: varchar("design_id", { length: 36 }).references(() => homeDesigns.id),
    consultantId: varchar("consultant_id", { length: 36 }).references(() => consultants.id),

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
    status: mysqlEnum("status", enquiryStatusValues).default("new").notNull(),
    assignedTo: varchar("assigned_to", { length: 36 }), // FK to users table
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
