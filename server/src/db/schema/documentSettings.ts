import { mysqlTable, varchar, text, int, boolean, timestamp, mysqlEnum, uniqueIndex } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";

/**
 * Shared vocabulary and configuration for the document engine (tenders now, build
 * contracts in phase 2). Nothing here is hard-coded in application code — branding,
 * GST rate and the item-status list are all editable by staff.
 */

// Document kinds the engine can produce. `contract` exists from day one so phase 2
// needs no schema change to the instance tables.
export const docTypeValues = ["tender", "contract"] as const;
export type DocType = (typeof docTypeValues)[number];

// Whether prices are quoted with GST already inside them or added on top.
export const gstModeValues = ["inclusive", "exclusive"] as const;
export type GstMode = (typeof gstModeValues)[number];

/**
 * How a status is rendered in the PDF. Kept separate from the label so a custom
 * status ("As Per Engineering") still prints with a sensible badge treatment, and so
 * the badge stays readable in black and white (§17) rather than relying on colour.
 */
export const statusTreatmentValues = ["included", "excluded", "partial", "neutral", "money"] as const;
export type StatusTreatment = (typeof statusTreatmentValues)[number];

/**
 * Builder identity and document appearance. Single logical row — the service uses
 * getOrCreate. Seeded blank so nothing about Cloverton is baked into code.
 */
export const documentBrandSettings = mysqlTable("document_brand_settings", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),

    // Legal identity — printed on every page header and the cover.
    legalName: varchar("legal_name", { length: 200 }),
    tradingName: varchar("trading_name", { length: 200 }),
    abn: varchar("abn", { length: 20 }),
    acn: varchar("acn", { length: 20 }),
    builderLicence: varchar("builder_licence", { length: 50 }),

    // Contact block.
    addressLine1: varchar("address_line1", { length: 200 }),
    addressLine2: varchar("address_line2", { length: 200 }),
    suburb: varchar("suburb", { length: 100 }),
    state: varchar("state", { length: 10 }),
    postcode: varchar("postcode", { length: 10 }),
    poBox: varchar("po_box", { length: 60 }),
    phone: varchar("phone", { length: 40 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 200 }),

    // Appearance. Logo is a storage key, never bytes; null falls back to the in-repo
    // public/images/logo-dark.png so a fresh install can generate a PDF immediately.
    logoStorageKey: varchar("logo_storage_key", { length: 500 }),
    logoLightStorageKey: varchar("logo_light_storage_key", { length: 500 }),
    primaryColor: varchar("primary_color", { length: 9 }).default("#234252"),
    secondaryColor: varchar("secondary_color", { length: 9 }).default("#43413d"),
    accentColor: varchar("accent_color", { length: 9 }).default("#222222"),
    footerText: varchar("footer_text", { length: 500 }),
    watermarkEnabled: boolean("watermark_enabled").default(false).notNull(),
    watermarkText: varchar("watermark_text", { length: 60 }),

    // Signature-line labels, so wording is configurable rather than hard-coded.
    ownerInitialLabel: varchar("owner_initial_label", { length: 60 }).default("Owner's Initial"),
    builderInitialLabel: varchar("builder_initial_label", { length: 60 }).default("Builder's Initial"),

    // Commercial defaults copied onto each new document at creation time.
    defaultValidityDays: int("default_validity_days").default(30).notNull(),
    // Basis points: 1000 = 10%. Integer maths only, no floats near money.
    gstRateBp: int("gst_rate_bp").default(1000).notNull(),
    defaultGstMode: mysqlEnum("default_gst_mode", gstModeValues).default("inclusive").notNull(),

    updatedByUserId: varchar("updated_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Per-year counter behind TND-2026-0001. Incremented with an UPDATE inside the
 * create transaction so concurrent creates serialise on the InnoDB row lock; the
 * unique index on documents.document_number is the hard backstop.
 */
export const documentNumberSequences = mysqlTable("document_number_sequences", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    docType: mysqlEnum("doc_type", docTypeValues).notNull(),
    year: int("year").notNull(),
    prefix: varchar("prefix", { length: 10 }).notNull(),
    lastNumber: int("last_number").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    docTypeYear: uniqueIndex("document_number_sequences_type_year_uq").on(t.docType, t.year),
}));

/**
 * The item-status vocabulary. Extensible per §9 — admins can add their own.
 * Items reference this by `code` as a plain varchar with no FK, so deleting a status
 * can never cascade away tender content.
 */
export const documentStatuses = mysqlTable("document_statuses", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    code: varchar("code", { length: 40 }).notNull().unique(),
    label: varchar("label", { length: 60 }).notNull(),
    // Short form used inside the PDF badge, e.g. "PART INCLUDED".
    shortLabel: varchar("short_label", { length: 16 }).notNull(),
    pdfTreatment: mysqlEnum("pdf_treatment", statusTreatmentValues).default("neutral").notNull(),
    description: varchar("description", { length: 255 }),
    // System statuses cannot be deleted, only deactivated.
    isSystem: boolean("is_system").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type DocumentBrandSettings = typeof documentBrandSettings.$inferSelect;
export type NewDocumentBrandSettings = typeof documentBrandSettings.$inferInsert;
export type DocumentNumberSequence = typeof documentNumberSequences.$inferSelect;
export type NewDocumentNumberSequence = typeof documentNumberSequences.$inferInsert;
// Named DocumentItemStatus, not DocumentStatus: `DocumentStatus` in ./documents is the
// document's lifecycle state (draft/sent/accepted), which is a different concept.
export type DocumentItemStatus = typeof documentStatuses.$inferSelect;
export type NewDocumentItemStatus = typeof documentStatuses.$inferInsert;
