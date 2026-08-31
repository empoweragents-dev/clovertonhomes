import { mysqlTable, varchar, text, int, boolean, timestamp, decimal, mysqlEnum, index } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes.js";
import { docTypeValues, gstModeValues } from "./documentSettings.js";

/**
 * MASTER templates (§7). Creating a tender deep-copies a template into
 * per-document tables; nothing here is ever read at render time. That is what makes
 * a later template edit unable to alter an existing client's tender (§30).
 */

/** Per-document PDF options, stored as JSON so new switches need no migration. */
export interface PdfConfig {
    showCoverSummary?: boolean;
    showTermsPage?: boolean;
    showSignoffPage?: boolean;
    showItemPrices?: boolean;
    coverSummaryRows?: { label: string; value: string }[];
}

export const documentTemplates = mysqlTable("document_templates", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    docType: mysqlEnum("doc_type", docTypeValues).default("tender").notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    description: text("description"),

    // Single Storey / Double Storey / Duplex / Granny Flat / Custom — free text rather
    // than an enum so staff can add their own without a migration.
    storeyType: varchar("storey_type", { length: 60 }),

    isDefault: boolean("is_default").default(false).notNull(),
    // Bumped when staff edit the master. Documents record the version they copied.
    version: int("version").default(1).notNull(),

    defaultValidityDays: int("default_validity_days"),
    defaultGstMode: mysqlEnum("default_gst_mode", gstModeValues),

    // Cover intro paragraph; may contain {{placeholders}}.
    coverIntroMarkup: text("cover_intro_markup"),
    pdfConfig: jsonType<PdfConfig>("pdf_config"),

    notes: text("notes"),
    isActive: boolean("is_active").default(true).notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const templateSections = mysqlTable("template_sections", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    templateId: varchar("template_id", { length: 36 }).notNull().references(() => documentTemplates.id, { onDelete: "cascade" }),

    // Derived from sortOrder by the numbering service; stored for display/PDF.
    sectionNumber: int("section_number").default(1).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    descriptionMarkup: text("description_markup"),

    // "decimal" prints 2.1, 2.2; "none" hides the ordinal without affecting numbering.
    numberingStyle: varchar("numbering_style", { length: 20 }).default("decimal").notNull(),

    // Cover page summary row (e.g. "Site costs — Included / Refer full list").
    coverSummaryLabel: varchar("cover_summary_label", { length: 150 }),
    showOnCoverSummary: boolean("show_on_cover_summary").default(false).notNull(),

    pageBreakBefore: boolean("page_break_before").default(false).notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    templateSortIdx: index("template_sections_template_sort_idx").on(t.templateId, t.sortOrder),
}));

export const templateItems = mysqlTable("template_items", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    templateId: varchar("template_id", { length: 36 }).notNull().references(() => documentTemplates.id, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 36 }).notNull().references(() => templateSections.id, { onDelete: "cascade" }),

    // Self-reference for subsections (2.13.1). Not a declared FK — a self-referential
    // cascade on MySQL is a foot-gun; orphans are handled in the service.
    parentItemId: varchar("parent_item_id", { length: 36 }),

    clauseNumber: varchar("clause_number", { length: 24 }),
    title: varchar("title", { length: 255 }).notNull(),
    bodyMarkup: text("body_markup"),
    bodyHtml: text("body_html"),

    // References document_statuses.code, intentionally without a FK.
    statusCode: varchar("status_code", { length: 40 }).default("included").notNull(),

    quantity: decimal("quantity", { precision: 12, scale: 3 }),
    unit: varchar("unit", { length: 20 }),

    // Display-only money printed beside the clause. Never contributes to the tender
    // total — all total-affecting money lives in document_pricing_lines.
    allowanceCents: int("allowance_cents"),
    priceCents: int("price_cents"),

    isClientVisible: boolean("is_client_visible").default(true).notNull(),
    internalNote: text("internal_note"),
    clientNote: text("client_note"),

    sortOrder: int("sort_order").default(0).notNull(),
    meta: jsonType<Record<string, unknown>>("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    templateSectionSortIdx: index("template_items_section_sort_idx").on(t.templateId, t.sectionId, t.sortOrder),
}));

/** Which library clauses a template pulls in by default. */
export const templateTerms = mysqlTable("template_terms", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    templateId: varchar("template_id", { length: 36 }).notNull().references(() => documentTemplates.id, { onDelete: "cascade" }),

    // Provenance only — no FK, so deleting a library clause cannot cascade into templates.
    clauseId: varchar("clause_id", { length: 36 }),

    isRequired: boolean("is_required").default(false).notNull(),
    isDefaultEnabled: boolean("is_default_enabled").default(true).notNull(),

    // Optional template-specific overrides of the library wording.
    overrideTitle: varchar("override_title", { length: 200 }),
    overrideBodyMarkup: text("override_body_markup"),

    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    templateSortIdx: index("template_terms_template_sort_idx").on(t.templateId, t.sortOrder),
}));

export type DocumentTemplate = typeof documentTemplates.$inferSelect;
export type NewDocumentTemplate = typeof documentTemplates.$inferInsert;
export type TemplateSection = typeof templateSections.$inferSelect;
export type NewTemplateSection = typeof templateSections.$inferInsert;
export type TemplateItem = typeof templateItems.$inferSelect;
export type NewTemplateItem = typeof templateItems.$inferInsert;
export type TemplateTerm = typeof templateTerms.$inferSelect;
export type NewTemplateTerm = typeof templateTerms.$inferInsert;
