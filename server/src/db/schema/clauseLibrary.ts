import { mysqlTable, varchar, text, int, boolean, timestamp, date, index, uniqueIndex } from "drizzle-orm/mysql-core";
import { randomUUID } from "crypto";
import { jsonType } from "../customTypes";

/**
 * Reusable terms & conditions clauses (§12) with full version history (§13).
 *
 * Editing a clause NEVER updates body text in place: it appends a new
 * clause_library_versions row and repoints `currentVersionId`. Documents pin the
 * version id they were built from, so changing master legal wording can never
 * retroactively alter a tender that has already been issued.
 */
export const clauseLibrary = mysqlTable("clause_library", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    code: varchar("code", { length: 40 }).notNull().unique(),
    name: varchar("name", { length: 200 }).notNull(),
    category: varchar("category", { length: 80 }),
    tags: jsonType<string[]>("tags"),

    // Points at the current clause_library_versions row. Deliberately not a FK:
    // the two tables reference each other and a circular FK breaks inserts.
    currentVersionId: varchar("current_version_id", { length: 36 }),

    // Which document kinds this clause applies to, e.g. ["tender"] or ["tender","contract"].
    docTypes: jsonType<string[]>("doc_types"),

    // Copied into a new document automatically when true.
    isDefaultEnabled: boolean("is_default_enabled").default(false).notNull(),
    // Cannot be issued without it — enforced by validateForIssue.
    isRequired: boolean("is_required").default(false).notNull(),

    sortOrder: int("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdByUserId: varchar("created_by_user_id", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({
    categoryIdx: index("clause_library_category_idx").on(t.category),
}));

/** Append-only history. Never UPDATE a row here. */
export const clauseLibraryVersions = mysqlTable("clause_library_versions", {
    id: varchar("id", { length: 36 }).primaryKey().$defaultFn(() => randomUUID()),
    clauseId: varchar("clause_id", { length: 36 }).notNull().references(() => clauseLibrary.id, { onDelete: "cascade" }),
    versionNumber: int("version_number").notNull(),

    // bodyMarkup is the editable source; bodyHtml is derived server-side and is what
    // the PDF renderer consumes.
    bodyMarkup: text("body_markup").notNull(),
    bodyHtml: text("body_html").notNull(),

    changeNote: varchar("change_note", { length: 255 }),
    effectiveDate: date("effective_date"),
    createdByUserId: varchar("created_by_user_id", { length: 255 }),
    createdByEmail: varchar("created_by_email", { length: 255 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
    clauseVersionUq: uniqueIndex("clause_library_versions_clause_version_uq").on(t.clauseId, t.versionNumber),
}));

export type ClauseLibraryEntry = typeof clauseLibrary.$inferSelect;
export type NewClauseLibraryEntry = typeof clauseLibrary.$inferInsert;
export type ClauseLibraryVersion = typeof clauseLibraryVersions.$inferSelect;
export type NewClauseLibraryVersion = typeof clauseLibraryVersions.$inferInsert;
