import { mysqlTable, varchar, text, int, boolean, timestamp, date, decimal, mysqlEnum, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes.js";
import { docTypeValues, gstModeValues } from "./documentSettings.js";
import { clientTypeValues } from "./clients.js";
import type { PdfConfig } from "./documentTemplates.js";

/**
 * DOCUMENT INSTANCES — a tender now, a build contract in phase 2 (hence the generic
 * `document_*` naming plus the `docType` discriminator, rather than `tender_*`).
 *
 * Architecture (§30): these tables are the EDITABLE WORKING COPY of the current
 * draft. Every issued revision additionally freezes a complete JSON snapshot in
 * document_revisions.snapshotJson, and the PDF for a revision is always rendered from
 * that snapshot — never from these tables and never from the master template. So:
 *
 *   MASTER TEMPLATE -> CREATE -> WORKING COPY -> EDIT -> ISSUE -> FROZEN SNAPSHOT + PDF
 *
 * Editing a template, a library clause, or a client can therefore never alter a
 * document that has already gone out.
 */

export const documentStatusValues = [
    "draft",
    "internal_review",
    "ready_to_send",
    "sent",
    "accepted",
    "declined",
    "expired",
    "superseded",
    "converted",
    "archived",
] as const;
export type DocumentStatus = (typeof documentStatusValues)[number];

/** Only `draft` and `internal_review` documents may be edited; see services/documents/guards.ts. */
export const editableDocumentStatuses: readonly DocumentStatus[] = ["draft", "internal_review"];

export const partyRoleValues = ["primary", "secondary", "company", "contact"] as const;
export type PartyRole = (typeof partyRoleValues)[number];

export const revisionStatusValues = ["draft", "issued", "superseded"] as const;
export type RevisionStatus = (typeof revisionStatusValues)[number];

export const fileKindValues = ["final_pdf", "preview_pdf", "attachment", "logo"] as const;
export type FileKind = (typeof fileKindValues)[number];

/** §6's pricing treatments. See services/documents/pricing.ts for which roll into the total. */
export const pricingTreatmentValues = [
    "include_in_total",
    "display_and_include",
    "display_separately",
    "optional",
    "excluded",
    "allowance",
    "provisional_sum",
    "client_supplied",
    "owner_responsibility",
] as const;
export type PricingTreatment = (typeof pricingTreatmentValues)[number];

export const pricingCategoryValues = [
    "base_house",
    "site_costs",
    "council_statutory",
    "basix",
    "upgrade",
    "additional_works",
    "discount",
    "promotion",
    "other",
] as const;
export type PricingCategory = (typeof pricingCategoryValues)[number];

/** Staff-defined extra project fields (§4) — no migration needed to add one. */
export interface CustomField {
    label: string;
    value: string;
    showInPdf?: boolean;
}

export const documents = mysqlTable("documents", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    docType: mysqlEnum("doc_type", docTypeValues).default("tender").notNull(),

    // Base number without the revision suffix, e.g. TND-2026-0001. The unique index is
    // the real guard against two staff creating a tender at the same moment.
    documentNumber: varchar("document_number", { length: 30 }).notNull().unique(),
    year: int("year").notNull(),
    sequence: int("sequence").notNull(),
    currentRevisionNumber: int("current_revision_number").default(0).notNull(),
    status: mysqlEnum("status", documentStatusValues).default("draft").notNull(),

    // Provenance only. Never read at render time.
    templateId: varchar("template_id", { length: 36 }),
    templateVersionAtCreate: int("template_version_at_create"),
    // Duplicate/revision lineage.
    sourceDocumentId: varchar("source_document_id", { length: 36 }),
    supersedesDocumentId: varchar("supersedes_document_id", { length: 36 }),

    // ---- Client snapshot (full detail lives in document_parties) ----
    clientId: varchar("client_id", { length: 36 }),
    clientDisplayName: varchar("client_display_name", { length: 255 }),
    clientType: mysqlEnum("client_type", clientTypeValues).default("individual").notNull(),

    // ---- Project snapshot (§4) ----
    projectAddress: text("project_address"),
    lotNumber: varchar("lot_number", { length: 30 }),
    dpNumber: varchar("dp_number", { length: 30 }),
    suburb: varchar("suburb", { length: 100 }),
    state: varchar("state", { length: 10 }),
    postcode: varchar("postcode", { length: 10 }),
    council: varchar("council", { length: 120 }),
    developmentRef: varchar("development_ref", { length: 80 }),
    constructionType: varchar("construction_type", { length: 60 }),
    propertyType: varchar("property_type", { length: 60 }),

    // Optional links into the existing catalogue; the *_snapshot strings are what print,
    // so renaming a design later cannot rewrite an issued tender.
    propertyId: varchar("property_id", { length: 36 }),
    designId: varchar("design_id", { length: 36 }),
    designNameSnapshot: varchar("design_name_snapshot", { length: 200 }),
    facadeId: varchar("facade_id", { length: 36 }),
    facadeSnapshot: varchar("facade_snapshot", { length: 120 }),

    squareMetres: int("square_metres"),
    // "approx. 22 Sq" — squares, not money, so decimal is correct here.
    squares: decimal("squares", { precision: 6, scale: 1 }),
    bedrooms: int("bedrooms"),
    bathrooms: int("bathrooms"),
    garages: int("garages"),
    projectNotes: text("project_notes"),

    // ---- Tender information (§5) ----
    documentDate: date("document_date"),
    expiryDate: date("expiry_date"),
    validityDays: int("validity_days"),
    preparedByUserId: varchar("prepared_by_user_id", { length: 255 }),
    preparedByName: varchar("prepared_by_name", { length: 150 }),
    salesConsultantId: varchar("sales_consultant_id", { length: 36 }),
    salesConsultantName: varchar("sales_consultant_name", { length: 150 }),
    estimatorName: varchar("estimator_name", { length: 150 }),
    introMarkup: text("intro_markup"),
    descriptionMarkup: text("description_markup"),
    // Internal notes must never reach the client PDF (§36).
    internalNotes: text("internal_notes"),
    clientNotes: text("client_notes"),

    // ---- Pricing rollup: a server-computed cache, never trusted from the client ----
    gstMode: mysqlEnum("gst_mode", gstModeValues).default("inclusive").notNull(),
    gstRateBp: int("gst_rate_bp").default(1000).notNull(),
    subtotalCents: int("subtotal_cents").default(0).notNull(),
    gstCents: int("gst_cents").default(0).notNull(),
    totalCents: int("total_cents").default(0).notNull(),
    optionalTotalCents: int("optional_total_cents").default(0).notNull(),
    displaySeparatelyTotalCents: int("display_separately_total_cents").default(0).notNull(),
    // Authorised manual override; requires a reason and writes an audit row.
    totalOverrideCents: int("total_override_cents"),
    totalOverrideReason: varchar("total_override_reason", { length: 255 }),

    customFields: jsonType<CustomField[]>("custom_fields"),
    pdfConfig: jsonType<PdfConfig>("pdf_config"),
    meta: jsonType<Record<string, unknown>>("meta"),

    // Set when a revision is issued; cleared by Create Revision.
    lockedAt: timestamp("locked_at"),
    isArchived: boolean("is_archived").default(false).notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 255 }),
    updatedByUserId: varchar("updated_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    statusIdx: index("documents_status_idx").on(t.docType, t.status),
    clientIdx: index("documents_client_idx").on(t.clientId),
    createdIdx: index("documents_created_idx").on(t.createdAt),
    yearSeqIdx: index("documents_year_sequence_idx").on(t.docType, t.year, t.sequence),
}));

/** Owners/clients as printed on this document. Snapshot copies, not live references. */
export const documentParties = mysqlTable("document_parties", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
    clientId: varchar("client_id", { length: 36 }),
    role: mysqlEnum("role", partyRoleValues).default("primary").notNull(),

    fullName: varchar("full_name", { length: 200 }),
    companyName: varchar("company_name", { length: 200 }),
    abn: varchar("abn", { length: 20 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 40 }),
    currentAddress: text("current_address"),
    postalAddress: text("postal_address"),
    notes: text("notes"),

    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    documentIdx: index("document_parties_document_idx").on(t.documentId, t.sortOrder),
}));

export const documentSections = mysqlTable("document_sections", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
    templateSectionId: varchar("template_section_id", { length: 36 }),

    sectionNumber: int("section_number").default(1).notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: varchar("subtitle", { length: 255 }),
    descriptionMarkup: text("description_markup"),
    descriptionHtml: text("description_html"),
    numberingStyle: varchar("numbering_style", { length: 20 }).default("decimal").notNull(),

    coverSummaryLabel: varchar("cover_summary_label", { length: 150 }),
    showOnCoverSummary: boolean("show_on_cover_summary").default(false).notNull(),

    pageBreakBefore: boolean("page_break_before").default(false).notNull(),
    isClientVisible: boolean("is_client_visible").default(true).notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    meta: jsonType<Record<string, unknown>>("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    documentSortIdx: index("document_sections_document_sort_idx").on(t.documentId, t.sortOrder),
}));

export const documentItems = mysqlTable("document_items", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
    sectionId: varchar("section_id", { length: 36 }).notNull().references(() => documentSections.id, { onDelete: "cascade" }),
    parentItemId: varchar("parent_item_id", { length: 36 }),
    templateItemId: varchar("template_item_id", { length: 36 }),

    // Two numbers on purpose. clauseNumber counts every item and is the stable internal
    // reference used by the editor and audit log. displayClauseNumber counts only
    // client-visible items, so hiding 2.2 prints 2.1, 2.2, 2.3 in the client's PDF
    // rather than a gap that reads like a defect.
    clauseNumber: varchar("clause_number", { length: 24 }),
    displayClauseNumber: varchar("display_clause_number", { length: 24 }),

    title: varchar("title", { length: 255 }).notNull(),
    bodyMarkup: text("body_markup"),
    bodyHtml: text("body_html"),

    // Status code plus a snapshot of its label/treatment, so renaming or deleting a
    // status later cannot rewrite what an issued document said.
    statusCode: varchar("status_code", { length: 40 }).default("included").notNull(),
    statusLabel: varchar("status_label", { length: 60 }),
    statusTreatment: varchar("status_treatment", { length: 20 }),

    quantity: decimal("quantity", { precision: 12, scale: 3 }),
    unit: varchar("unit", { length: 20 }),
    // Display-only; see the note on templateItems.
    allowanceCents: int("allowance_cents"),
    priceCents: int("price_cents"),

    isClientVisible: boolean("is_client_visible").default(true).notNull(),
    internalNote: text("internal_note"),
    clientNote: text("client_note"),
    // True when staff added this item rather than it coming from the template.
    isCustom: boolean("is_custom").default(false).notNull(),

    sortOrder: int("sort_order").default(0).notNull(),
    meta: jsonType<Record<string, unknown>>("meta"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    documentSectionSortIdx: index("document_items_doc_section_sort_idx").on(t.documentId, t.sectionId, t.sortOrder),
}));

export const documentTerms = mysqlTable("document_terms", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),

    // Which library clause and which exact version this came from (§13). Body text is
    // copied below, so a later master edit cannot change what was issued.
    clauseId: varchar("clause_id", { length: 36 }),
    clauseVersionId: varchar("clause_version_id", { length: 36 }),
    clauseVersionNumber: int("clause_version_number"),

    code: varchar("code", { length: 40 }),
    title: varchar("title", { length: 200 }).notNull(),
    bodyMarkup: text("body_markup"),
    bodyHtml: text("body_html").notNull(),

    isEnabled: boolean("is_enabled").default(true).notNull(),
    isRequired: boolean("is_required").default(false).notNull(),
    isCustom: boolean("is_custom").default(false).notNull(),
    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    documentSortIdx: index("document_terms_document_sort_idx").on(t.documentId, t.sortOrder),
}));

/** The only place total-affecting money lives. */
export const documentPricingLines = mysqlTable("document_pricing_lines", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),

    category: mysqlEnum("category", pricingCategoryValues).default("other").notNull(),
    label: varchar("label", { length: 200 }).notNull(),
    descriptionMarkup: text("description_markup"),

    quantity: decimal("quantity", { precision: 12, scale: 3 }),
    unitAmountCents: int("unit_amount_cents"),
    // Signed: discounts are negative. Integer cents, never a float.
    amountCents: int("amount_cents").default(0).notNull(),

    treatment: mysqlEnum("treatment", pricingTreatmentValues).default("include_in_total").notNull(),
    // null = follow the document's gstMode.
    isGstInclusive: boolean("is_gst_inclusive"),

    showInSummary: boolean("show_in_summary").default(true).notNull(),
    isClientVisible: boolean("is_client_visible").default(true).notNull(),
    internalNote: text("internal_note"),
    sortOrder: int("sort_order").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    documentSortIdx: index("document_pricing_lines_document_sort_idx").on(t.documentId, t.sortOrder),
}));

/**
 * Revision history and the immutability anchor. Once status = 'issued', snapshotJson
 * is the frozen, fully placeholder-resolved payload the PDF was rendered from, and
 * nothing that later happens to the working-copy rows can alter it.
 */
export const documentRevisions = mysqlTable("document_revisions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
    revisionNumber: int("revision_number").default(0).notNull(),
    // Display label, e.g. TND-2026-0001-R1.
    revisionLabel: varchar("revision_label", { length: 40 }),
    status: mysqlEnum("status", revisionStatusValues).default("draft").notNull(),

    issuedAt: timestamp("issued_at"),
    issuedByUserId: varchar("issued_by_user_id", { length: 255 }),

    // Typed as unknown: the concrete DocumentSnapshot interface lives with the snapshot
    // service, and the schema layer must not depend on it.
    snapshotJson: jsonType<Record<string, unknown> | null>("snapshot_json"),
    snapshotHash: varchar("snapshot_hash", { length: 64 }),
    totalCents: int("total_cents"),
    changeSummary: text("change_summary"),

    createdByUserId: varchar("created_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    documentRevisionUq: uniqueIndex("document_revisions_document_revision_uq").on(t.documentId, t.revisionNumber),
}));

/** Generated PDFs and project attachments (§37). */
export const documentFiles = mysqlTable("document_files", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    documentId: varchar("document_id", { length: 36 }).notNull().references(() => documents.id, { onDelete: "cascade" }),
    revisionId: varchar("revision_id", { length: 36 }),

    kind: mysqlEnum("kind", fileKindValues).default("attachment").notNull(),
    label: varchar("label", { length: 200 }),
    // Attachment classification: plans, engineering, soil test, survey, BASIX...
    category: varchar("category", { length: 60 }),
    filename: varchar("filename", { length: 255 }).notNull(),

    // Which storage backend wrote this row, so a future move to S3/R2 can be incremental.
    storageBackend: varchar("storage_backend", { length: 20 }).default("local").notNull(),
    storageKey: varchar("storage_key", { length: 500 }).notNull(),
    mimeType: varchar("mime_type", { length: 100 }),
    byteSize: int("byte_size"),
    // §22's immutability guarantee: verified when the file is served.
    sha256: varchar("sha256", { length: 64 }),
    pageCount: int("page_count"),

    // §38 hook for a future combined contract pack.
    includeInPack: boolean("include_in_pack").default(false).notNull(),
    isCurrent: boolean("is_current").default(true).notNull(),
    generatedByUserId: varchar("generated_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    documentKindIdx: index("document_files_document_kind_idx").on(t.documentId, t.kind),
    revisionIdx: index("document_files_revision_idx").on(t.revisionId),
}));

export type Document = typeof documents.$inferSelect;
export type NewDocument = typeof documents.$inferInsert;
export type DocumentParty = typeof documentParties.$inferSelect;
export type NewDocumentParty = typeof documentParties.$inferInsert;
export type DocumentSection = typeof documentSections.$inferSelect;
export type NewDocumentSection = typeof documentSections.$inferInsert;
export type DocumentItem = typeof documentItems.$inferSelect;
export type NewDocumentItem = typeof documentItems.$inferInsert;
export type DocumentTerm = typeof documentTerms.$inferSelect;
export type NewDocumentTerm = typeof documentTerms.$inferInsert;
export type DocumentPricingLine = typeof documentPricingLines.$inferSelect;
export type NewDocumentPricingLine = typeof documentPricingLines.$inferInsert;
export type DocumentRevision = typeof documentRevisions.$inferSelect;
export type NewDocumentRevision = typeof documentRevisions.$inferInsert;
export type DocumentFile = typeof documentFiles.$inferSelect;
export type NewDocumentFile = typeof documentFiles.$inferInsert;
