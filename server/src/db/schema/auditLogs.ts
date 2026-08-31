import { mysqlTable, varchar, text, int, timestamp, index } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes.js";

/**
 * Append-only audit trail (§35). Commercially meaningful changes are recorded with
 * before/after values so "who changed the price, and when" is answerable.
 *
 * `documentId` is denormalised alongside `entityId` so a tender's whole timeline —
 * including changes to its items, terms and pricing lines — is one indexed query.
 *
 * No FKs: an audit row must survive deletion of whatever it describes.
 */
export const auditLogs = mysqlTable("audit_logs", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),

    entityType: varchar("entity_type", { length: 40 }).notNull(),
    entityId: varchar("entity_id", { length: 36 }),
    documentId: varchar("document_id", { length: 36 }),
    revisionNumber: int("revision_number"),

    // e.g. created, updated, item_status_changed, price_overridden, pdf_generated,
    // revision_issued, duplicated, archived, clause_version_created.
    action: varchar("action", { length: 60 }).notNull(),

    field: varchar("field", { length: 80 }),
    previousValue: text("previous_value"),
    newValue: text("new_value"),
    // Human-readable one-liner for the timeline UI.
    summary: varchar("summary", { length: 255 }),

    userId: varchar("user_id", { length: 255 }),
    userEmail: varchar("user_email", { length: 255 }),
    ipAddress: varchar("ip_address", { length: 45 }),
    metadata: jsonType<Record<string, unknown>>("metadata"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    documentIdx: index("audit_logs_document_created_idx").on(t.documentId, t.createdAt),
    entityIdx: index("audit_logs_entity_idx").on(t.entityType, t.entityId),
}));

export type AuditLog = typeof auditLogs.$inferSelect;
export type NewAuditLog = typeof auditLogs.$inferInsert;
