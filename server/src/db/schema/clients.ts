import { mysqlTable, varchar, text, int, boolean, timestamp, mysqlEnum, index } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

/**
 * Builder clients (the people a tender is addressed to). Distinct from `enquiries`,
 * which are marketing leads — a client is someone being quoted or contracted.
 *
 * A tender snapshots these values onto document_parties, so editing a client here
 * never mutates an already-issued document.
 */

export const clientTypeValues = ["individual", "couple", "company"] as const;
export type ClientType = (typeof clientTypeValues)[number];

export const clients = mysqlTable("clients", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    clientType: mysqlEnum("client_type", clientTypeValues).default("individual").notNull(),

    // Two name fields rather than a party table: a couple ("Mr S M Rahman & Mst S S
    // Tamanna") is by far the common case and does not justify the extra join.
    primaryName: varchar("primary_name", { length: 200 }).notNull(),
    secondaryName: varchar("secondary_name", { length: 200 }),
    companyName: varchar("company_name", { length: 200 }),
    abn: varchar("abn", { length: 20 }),

    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 40 }),
    currentAddress: text("current_address"),
    postalAddress: text("postal_address"),
    notes: text("notes"),

    isActive: boolean("is_active").default(true).notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    emailIdx: index("clients_email_idx").on(t.email),
    phoneIdx: index("clients_phone_idx").on(t.phone),
    primaryNameIdx: index("clients_primary_name_idx").on(t.primaryName),
}));

/** Additional contacts (§3's "Additional Contact") — broker, family member, solicitor. */
export const clientContacts = mysqlTable("client_contacts", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    clientId: varchar("client_id", { length: 36 }).notNull().references(() => clients.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 200 }).notNull(),
    relationship: varchar("relationship", { length: 60 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 40 }),
    notes: text("notes"),
    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
export type ClientContact = typeof clientContacts.$inferSelect;
export type NewClientContact = typeof clientContacts.$inferInsert;
