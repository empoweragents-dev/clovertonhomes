import { db } from "../../config/database";
import { documents, documentFiles, Document, DocumentStatus } from "../../db/schema";
import { and, or, eq, like, desc, gte, lte, inArray, SQL } from "drizzle-orm";

/**
 * Tender/contract records for the dashboard (§2). Creation, editing and issuing live
 * in their own services; this one covers listing and reading.
 */

export interface DocumentListFilters {
    docType?: string;
    q?: string;
    status?: string;
    clientId?: string;
    templateId?: string;
    createdBy?: string;
    dateFrom?: string;
    dateTo?: string;
    includeArchived?: boolean;
    limit?: number;
    offset?: number;
}

/** A list row plus the id of its most recent issued PDF, for the download action. */
export type DocumentListRow = Document & { latestPdfFileId: string | null };

export const documentService = {
    async getAll(filters: DocumentListFilters = {}): Promise<{ documents: DocumentListRow[]; total: number }> {
        const conditions: SQL[] = [eq(documents.docType, (filters.docType as any) ?? "tender")];

        if (!filters.includeArchived) conditions.push(eq(documents.isArchived, false));
        if (filters.status) conditions.push(eq(documents.status, filters.status as DocumentStatus));
        if (filters.clientId) conditions.push(eq(documents.clientId, filters.clientId));
        if (filters.templateId) conditions.push(eq(documents.templateId, filters.templateId));
        if (filters.createdBy) conditions.push(eq(documents.createdByUserId, filters.createdBy));
        if (filters.dateFrom) conditions.push(gte(documents.createdAt, new Date(filters.dateFrom)));
        if (filters.dateTo) conditions.push(lte(documents.createdAt, new Date(filters.dateTo)));

        // §39: one search box across number, client and address.
        if (filters.q) {
            const term = `%${filters.q}%`;
            conditions.push(or(
                like(documents.documentNumber, term),
                like(documents.clientDisplayName, term),
                like(documents.projectAddress, term),
                like(documents.suburb, term),
                like(documents.lotNumber, term),
            )!);
        }

        const where = and(...conditions);
        const limit = filters.limit ?? 20;
        const offset = filters.offset ?? 0;

        const rows = await db.select().from(documents)
            .where(where)
            .orderBy(desc(documents.createdAt))
            .limit(limit)
            .offset(offset);

        // Matches the counting approach used elsewhere in this codebase.
        const all = await db.select({ id: documents.id }).from(documents).where(where);

        // One extra query for the whole page rather than one per row.
        const files = rows.length
            ? await db.select().from(documentFiles).where(and(
                inArray(documentFiles.documentId, rows.map((r) => r.id)),
                eq(documentFiles.kind, "final_pdf"),
                eq(documentFiles.isCurrent, true),
            ))
            : [];

        const withFiles: DocumentListRow[] = rows.map((row) => {
            const forDoc = files.filter((f) => f.documentId === row.id);
            const latest = forDoc[forDoc.length - 1];
            return { ...row, latestPdfFileId: latest?.id ?? null };
        });

        return { documents: withFiles, total: all.length };
    },

    async getById(id: string): Promise<Document | undefined> {
        const [row] = await db.select().from(documents).where(eq(documents.id, id));
        return row;
    },

    /** Dashboard counters (§40). Deliberately simple — real values, no placeholders. */
    async getStats(docType = "tender"): Promise<Record<string, number>> {
        const rows = await db.select({
            id: documents.id,
            status: documents.status,
            totalCents: documents.totalCents,
        }).from(documents).where(and(
            eq(documents.docType, docType as any),
            eq(documents.isArchived, false),
        ));

        const count = (...statuses: string[]) => rows.filter((r) => statuses.includes(r.status)).length;

        return {
            total: rows.length,
            draft: count("draft", "internal_review"),
            sent: count("ready_to_send", "sent"),
            accepted: count("accepted"),
            // Value of everything not lost, in cents.
            pipelineValueCents: rows
                .filter((r) => !["declined", "expired", "superseded"].includes(r.status))
                .reduce((sum, r) => sum + (r.totalCents ?? 0), 0),
        };
    },
};
