import { db } from "../../config/database.js";
import {
    documents, documentParties, documentSections, documentItems,
    documentPricingLines, documentRevisions, documentFiles,
    documentNumberSequences, documentTemplates, templateSections, templateItems,
    documentStatuses, editableDocumentStatuses,
    Document, DocumentSection, DocumentItem, DocumentParty, DocumentPricingLine, DocumentRevision, DocumentFile,
} from "../../db/schema/index.js";
import { eq, and, asc, sql, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { withTx, insertMany, Executor } from "../../db/txHelpers.js";
import { insertReturning, updateReturning } from "../../db/helpers.js";
import { renumber } from "./numbering.js";
import { toHtml } from "./markup.js";
import { calculateTotals, PricingLineInput } from "./pricing.js";
import { brandService } from "./brandService.js";
import { auditService } from "./auditService.js";

/**
 * Tender creation, editing and the snapshot mechanics (§30).
 *
 * Creating a tender deep-copies a master template into this document's own tables.
 * From then on the document is self-contained: editing the template, a library
 * clause or a client record can never alter it.
 */

export class DocumentLockedError extends Error {
    statusCode = 409;
    code = "DOCUMENT_LOCKED";
    constructor(revision: number) {
        super(`Revision R${revision} has been issued and is immutable. Create a revision to make changes.`);
    }
}

export interface TenderTree {
    document: Document;
    parties: DocumentParty[];
    sections: (DocumentSection & { items: DocumentItem[] })[];
    pricingLines: DocumentPricingLine[];
    revisions: DocumentRevision[];
    /** Generated PDFs and attachments, so the UI can offer a download per revision. */
    files: DocumentFile[];
}

export const tenderService = {
    /**
     * Allocates the next TND-YYYY-NNNN. Runs inside the caller's transaction so
     * concurrent creates serialise on the sequence row's lock; the unique index on
     * documents.document_number is the hard backstop.
     */
    async allocateNumber(tx: Executor, docType: "tender" | "contract", year: number): Promise<{ documentNumber: string; sequence: number }> {
        const prefix = docType === "tender" ? "TND" : "CTR";

        const existing = await tx.select().from(documentNumberSequences)
            .where(and(eq(documentNumberSequences.docType, docType), eq(documentNumberSequences.year, year)));

        if (!existing.length) {
            await tx.insert(documentNumberSequences).values({ docType, year, prefix, lastNumber: 1 });
            return { documentNumber: `${prefix}-${year}-0001`, sequence: 1 };
        }

        await tx.update(documentNumberSequences)
            .set({ lastNumber: sql`${documentNumberSequences.lastNumber} + 1`, updatedAt: new Date() })
            .where(eq(documentNumberSequences.id, existing[0].id));

        const [row] = await tx.select().from(documentNumberSequences)
            .where(eq(documentNumberSequences.id, existing[0].id));

        const sequence = row.lastNumber;
        return { documentNumber: `${prefix}-${year}-${String(sequence).padStart(4, "0")}`, sequence };
    },

    /** Creates a tender from a template. One transaction; template read happens first. */
    async createFromTemplate(input: {
        templateId?: string;
        clientDisplayName?: string;
        clientType?: string;
        parties?: Partial<DocumentParty>[];
        projectAddress?: string;
        suburb?: string;
        state?: string;
        postcode?: string;
        lotNumber?: string;
        constructionType?: string;
        designNameSnapshot?: string;
        facadeSnapshot?: string;
        squares?: string;
        bedrooms?: number;
        bathrooms?: number;
        garages?: number;
        documentDate?: string;
        preparedByName?: string;
    }, actor?: { id?: string; email?: string }): Promise<Document> {
        const brand = await brandService.getOrCreate();

        // Everything the transaction needs is read up front so the tx stays short.
        const [template] = input.templateId
            ? await db.select().from(documentTemplates).where(eq(documentTemplates.id, input.templateId))
            : await db.select().from(documentTemplates).where(eq(documentTemplates.isDefault, true));

        if (!template) throw Object.assign(new Error("No tender template found"), { statusCode: 400 });

        const srcSections = await db.select().from(templateSections)
            .where(eq(templateSections.templateId, template.id)).orderBy(asc(templateSections.sortOrder));
        const srcItems = await db.select().from(templateItems)
            .where(eq(templateItems.templateId, template.id)).orderBy(asc(templateItems.sortOrder));
        const statuses = await db.select().from(documentStatuses);

        const validityDays = template.defaultValidityDays ?? brand.defaultValidityDays ?? 30;
        const documentDate = input.documentDate ? new Date(input.documentDate) : new Date();
        const expiry = new Date(documentDate);
        expiry.setDate(expiry.getDate() + validityDays);
        const asDate = (d: Date) => d.toISOString().slice(0, 10);

        const documentId = randomUUID();
        const year = documentDate.getFullYear();

        const created = await withTx(async (tx) => {
            const { documentNumber, sequence } = await this.allocateNumber(tx, "tender", year);

            await tx.insert(documents).values({
                id: documentId,
                docType: "tender",
                documentNumber,
                year,
                sequence,
                currentRevisionNumber: 0,
                status: "draft",
                templateId: template.id,
                templateVersionAtCreate: template.version,
                clientDisplayName: input.clientDisplayName,
                clientType: (input.clientType as any) ?? "individual",
                projectAddress: input.projectAddress,
                suburb: input.suburb,
                state: input.state,
                postcode: input.postcode,
                lotNumber: input.lotNumber,
                constructionType: input.constructionType,
                designNameSnapshot: input.designNameSnapshot,
                facadeSnapshot: input.facadeSnapshot,
                squares: input.squares,
                bedrooms: input.bedrooms,
                bathrooms: input.bathrooms,
                garages: input.garages,
                documentDate: asDate(documentDate) as any,
                expiryDate: asDate(expiry) as any,
                validityDays,
                preparedByName: input.preparedByName,
                preparedByUserId: actor?.id,
                introMarkup: template.coverIntroMarkup,
                // GST settings are snapshot so a later rate change cannot alter this tender.
                gstMode: template.defaultGstMode ?? brand.defaultGstMode ?? "inclusive",
                gstRateBp: brand.gstRateBp ?? 1000,
                createdByUserId: actor?.id,
                updatedByUserId: actor?.id,
            });

            // Clients.
            const parties = input.parties?.length
                ? input.parties
                : input.clientDisplayName
                    ? [{ role: "primary" as const, fullName: input.clientDisplayName }]
                    : [];
            if (parties.length) {
                await insertMany(tx, documentParties, parties.map((p, i) => ({
                    id: randomUUID(), documentId, role: p.role ?? (i === 0 ? "primary" : "secondary"),
                    fullName: p.fullName, companyName: p.companyName, email: p.email, phone: p.phone,
                    currentAddress: p.currentAddress, postalAddress: p.postalAddress, sortOrder: i,
                })));
            }

            // Section ids are generated up front so items can point at them with no
            // round trip; items then go in as one chunked multi-row insert.
            const sectionIdMap = new Map<string, string>();
            const sectionRows = srcSections.map((s, i) => {
                const id = randomUUID();
                sectionIdMap.set(s.id, id);
                return {
                    id, documentId, templateSectionId: s.id,
                    sectionNumber: s.sectionNumber, title: s.title, subtitle: s.subtitle,
                    descriptionMarkup: s.descriptionMarkup, descriptionHtml: toHtml(s.descriptionMarkup),
                    numberingStyle: s.numberingStyle,
                    coverSummaryLabel: s.coverSummaryLabel, showOnCoverSummary: s.showOnCoverSummary,
                    pageBreakBefore: s.pageBreakBefore, sortOrder: i,
                };
            });
            await insertMany(tx, documentSections, sectionRows);

            const statusByCode = new Map(statuses.map((s) => [s.code, s]));
            const itemRows = srcItems.map((it) => {
                const status = statusByCode.get(it.statusCode);
                return {
                    id: randomUUID(), documentId,
                    sectionId: sectionIdMap.get(it.sectionId)!,
                    templateItemId: it.id,
                    clauseNumber: it.clauseNumber, displayClauseNumber: it.clauseNumber,
                    title: it.title, bodyMarkup: it.bodyMarkup, bodyHtml: it.bodyHtml,
                    statusCode: it.statusCode,
                    // Label and treatment are snapshot so renaming a status later cannot
                    // rewrite what an issued document said.
                    statusLabel: status?.label ?? it.statusCode,
                    statusTreatment: status?.pdfTreatment ?? "neutral",
                    quantity: it.quantity, unit: it.unit,
                    allowanceCents: it.allowanceCents, priceCents: it.priceCents,
                    isClientVisible: it.isClientVisible,
                    internalNote: it.internalNote, clientNote: it.clientNote,
                    isCustom: false, sortOrder: it.sortOrder,
                };
            }).filter((r) => r.sectionId);
            await insertMany(tx, documentItems, itemRows);

            // Seed a pricing line per cover-summary section so the tender starts with
            // the shape of the reference document rather than an empty table.
            const seedLines = srcSections.filter((s) => s.showOnCoverSummary).map((s, i) => ({
                id: randomUUID(), documentId,
                category: (s.sectionNumber === 1 ? "site_costs"
                    : s.sectionNumber === 3 ? "council_statutory"
                    : s.sectionNumber === 4 ? "basix" : "base_house") as any,
                label: s.coverSummaryLabel ?? s.title,
                amountCents: 0,
                treatment: "include_in_total" as const,
                showInSummary: true, isClientVisible: true, sortOrder: i,
            }));
            await insertMany(tx, documentPricingLines, seedLines);

            await tx.insert(documentRevisions).values({
                id: randomUUID(), documentId, revisionNumber: 0,
                revisionLabel: `${documentNumber}-R0`, status: "draft",
                createdByUserId: actor?.id,
            });

            const [row] = await tx.select().from(documents).where(eq(documents.id, documentId));
            return row;
        });

        await auditService.log({
            entityType: "document", entityId: documentId, documentId, revisionNumber: 0,
            action: "created",
            summary: `Created ${created.documentNumber} from template "${template.name}" (${srcItems.length} clauses)`,
            actor,
        });

        return created;
    },

    async getTree(id: string): Promise<TenderTree | undefined> {
        const [document] = await db.select().from(documents).where(eq(documents.id, id));
        if (!document) return undefined;

        const [parties, sections, items, pricingLines, revisions, files] = await Promise.all([
            db.select().from(documentParties).where(eq(documentParties.documentId, id)).orderBy(asc(documentParties.sortOrder)),
            db.select().from(documentSections).where(eq(documentSections.documentId, id)).orderBy(asc(documentSections.sortOrder)),
            db.select().from(documentItems).where(eq(documentItems.documentId, id)).orderBy(asc(documentItems.sortOrder)),
            db.select().from(documentPricingLines).where(eq(documentPricingLines.documentId, id)).orderBy(asc(documentPricingLines.sortOrder)),
            db.select().from(documentRevisions).where(eq(documentRevisions.documentId, id)).orderBy(asc(documentRevisions.revisionNumber)),
            db.select().from(documentFiles).where(eq(documentFiles.documentId, id)).orderBy(asc(documentFiles.createdAt)),
        ]);

        return {
            document, parties, pricingLines, revisions, files,
            sections: sections.map((s) => ({ ...s, items: items.filter((i) => i.sectionId === s.id) })),
        };
    },

    /** Throws if the document is past the editable window (§23). */
    assertMutable(document: Document): void {
        if (!editableDocumentStatuses.includes(document.status)) {
            throw new DocumentLockedError(document.currentRevisionNumber);
        }
    },

    async update(id: string, data: Record<string, unknown>, actor?: { id?: string; email?: string }): Promise<Document | undefined> {
        const [document] = await db.select().from(documents).where(eq(documents.id, id));
        if (!document) return undefined;
        this.assertMutable(document);

        const patch: Record<string, unknown> = { updatedAt: new Date(), updatedByUserId: actor?.id };
        for (const field of [
            "clientDisplayName", "clientType", "projectAddress", "lotNumber", "dpNumber",
            "suburb", "state", "postcode", "council", "developmentRef", "constructionType",
            "propertyType", "designNameSnapshot", "facadeSnapshot", "squareMetres", "squares",
            "bedrooms", "bathrooms", "garages", "projectNotes", "documentDate", "expiryDate",
            "validityDays", "preparedByName", "salesConsultantName", "estimatorName",
            "internalNotes", "clientNotes", "gstMode", "status",
        ] as const) {
            if (field in data) patch[field] = data[field];
        }
        if ("introMarkup" in data) patch.introMarkup = data.introMarkup;

        // Keep expiry consistent when either side of the relationship changes.
        const baseDate = (patch.documentDate ?? document.documentDate) as string | undefined;
        const days = Number(patch.validityDays ?? document.validityDays ?? 30);
        if (baseDate && ("documentDate" in patch || "validityDays" in patch)) {
            const d = new Date(baseDate);
            d.setDate(d.getDate() + days);
            patch.expiryDate = d.toISOString().slice(0, 10);
        }

        const updated = await updateReturning<Document>(documents, id, patch);
        await auditService.log({
            entityType: "document", entityId: id, documentId: id,
            revisionNumber: document.currentRevisionNumber,
            action: "updated", summary: `Updated ${Object.keys(patch).filter(k => k !== "updatedAt" && k !== "updatedByUserId").join(", ")}`,
            actor,
        });
        return updated;
    },

    // ------------------------------------------------------------------- items

    async updateItem(documentId: string, itemId: string, data: Record<string, unknown>, actor?: { id?: string; email?: string }): Promise<DocumentItem | undefined> {
        const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!document) return undefined;
        this.assertMutable(document);

        const [before] = await db.select().from(documentItems).where(eq(documentItems.id, itemId));
        if (!before) return undefined;

        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const field of [
            "title", "isClientVisible", "internalNote", "clientNote",
            "quantity", "unit", "allowanceCents", "priceCents", "sortOrder", "sectionId",
        ] as const) {
            if (field in data) patch[field] = data[field];
        }
        if ("bodyMarkup" in data) {
            patch.bodyMarkup = data.bodyMarkup;
            patch.bodyHtml = toHtml(data.bodyMarkup as string);
        }
        if ("statusCode" in data) {
            const [status] = await db.select().from(documentStatuses).where(eq(documentStatuses.code, data.statusCode as string));
            patch.statusCode = data.statusCode;
            patch.statusLabel = status?.label ?? data.statusCode;
            patch.statusTreatment = status?.pdfTreatment ?? "neutral";
        }

        const updated = await updateReturning<DocumentItem>(documentItems, itemId, patch);

        // Status flips are the commercially meaningful edit — log with before/after.
        if ("statusCode" in data && before.statusCode !== data.statusCode) {
            await auditService.log({
                entityType: "document_item", entityId: itemId, documentId,
                revisionNumber: document.currentRevisionNumber,
                action: "item_status_changed", field: "statusCode",
                previousValue: before.statusCode, newValue: String(data.statusCode),
                summary: `${before.clauseNumber} ${before.title}: ${before.statusCode} → ${data.statusCode}`,
                actor,
            });
        }
        if ("isClientVisible" in data || "bodyMarkup" in data || "title" in data) {
            await this.renumberDocument(documentId);
        }
        return updated;
    },

    async addItem(documentId: string, sectionId: string, data: Record<string, unknown>, actor?: { id?: string; email?: string }): Promise<DocumentItem | undefined> {
        const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!document) return undefined;
        this.assertMutable(document);

        const siblings = await db.select().from(documentItems).where(eq(documentItems.sectionId, sectionId));
        const item = await insertReturning<DocumentItem>(documentItems, {
            documentId, sectionId,
            title: data.title ?? "New clause",
            bodyMarkup: data.bodyMarkup ?? "",
            bodyHtml: toHtml((data.bodyMarkup as string) ?? ""),
            statusCode: data.statusCode ?? "included",
            isClientVisible: true, isCustom: true,
            sortOrder: (data.sortOrder as number) ?? siblings.length,
        });
        await this.renumberDocument(documentId);
        await auditService.log({
            entityType: "document_item", entityId: item.id, documentId,
            revisionNumber: document.currentRevisionNumber,
            action: "item_added", summary: `Added clause "${item.title}"`, actor,
        });
        return item;
    },

    async deleteItem(documentId: string, itemId: string, actor?: { id?: string; email?: string }): Promise<boolean> {
        const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!document) return false;
        this.assertMutable(document);

        const [item] = await db.select().from(documentItems).where(eq(documentItems.id, itemId));
        if (!item) return false;

        await db.delete(documentItems).where(eq(documentItems.id, itemId));
        await this.renumberDocument(documentId);
        await auditService.log({
            entityType: "document_item", entityId: itemId, documentId,
            revisionNumber: document.currentRevisionNumber,
            action: "item_deleted", summary: `Deleted clause ${item.clauseNumber} "${item.title}"`, actor,
        });
        return true;
    },

    /** Recomputes both clause numbers in one atomic statement per table. */
    async renumberDocument(documentId: string): Promise<void> {
        const sections = await db.select().from(documentSections).where(eq(documentSections.documentId, documentId));
        const items = await db.select().from(documentItems).where(eq(documentItems.documentId, documentId));
        if (!sections.length) return;

        const result = renumber(
            sections.map((s) => ({ id: s.id, sortOrder: s.sortOrder, sectionNumber: s.sectionNumber })),
            items.map((i) => ({
                id: i.id, sectionId: i.sectionId, parentItemId: i.parentItemId, sortOrder: i.sortOrder,
                isClientVisible: i.isClientVisible, clauseNumber: i.clauseNumber,
                displayClauseNumber: i.displayClauseNumber,
            })),
        );

        if (result.changedSectionIds.length) {
            await db.update(documentSections).set({
                sectionNumber: sql.join([sql`CASE`, ...result.sections.map((s) => sql`WHEN ${documentSections.id} = ${s.id} THEN ${s.sectionNumber}`), sql`END`], sql` `),
                sortOrder: sql.join([sql`CASE`, ...result.sections.map((s) => sql`WHEN ${documentSections.id} = ${s.id} THEN ${s.sortOrder}`), sql`END`], sql` `),
            }).where(inArray(documentSections.id, result.sections.map((s) => s.id)));
        }

        if (result.changedItemIds.length) {
            await db.update(documentItems).set({
                clauseNumber: sql.join([sql`CASE`, ...result.items.map((i) => sql`WHEN ${documentItems.id} = ${i.id} THEN ${i.clauseNumber}`), sql`END`], sql` `),
                displayClauseNumber: sql.join([sql`CASE`, ...result.items.map((i) => sql`WHEN ${documentItems.id} = ${i.id} THEN ${i.displayClauseNumber ?? null}`), sql`END`], sql` `),
                sortOrder: sql.join([sql`CASE`, ...result.items.map((i) => sql`WHEN ${documentItems.id} = ${i.id} THEN ${i.sortOrder}`), sql`END`], sql` `),
            }).where(inArray(documentItems.id, result.items.map((i) => i.id)));
        }
    },

    // ----------------------------------------------------------------- pricing

    /** Replaces the pricing lines and recomputes totals server-side. */
    async savePricing(documentId: string, lines: Partial<DocumentPricingLine>[], actor?: { id?: string; email?: string }): Promise<Document | undefined> {
        const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!document) return undefined;
        this.assertMutable(document);

        await db.delete(documentPricingLines).where(eq(documentPricingLines.documentId, documentId));
        if (lines.length) {
            await db.insert(documentPricingLines).values(lines.map((l, i) => ({
                id: randomUUID(), documentId,
                category: (l.category ?? "other") as any,
                label: l.label ?? "Line item",
                amountCents: Math.round(Number(l.amountCents ?? 0)),
                treatment: (l.treatment ?? "include_in_total") as any,
                isGstInclusive: l.isGstInclusive ?? null,
                showInSummary: l.showInSummary ?? true,
                isClientVisible: l.isClientVisible ?? true,
                internalNote: l.internalNote,
                sortOrder: i,
            })));
        }
        return this.recalculate(documentId, actor);
    },

    /** Recomputes and stores totals. The client's numbers are never trusted. */
    async recalculate(documentId: string, actor?: { id?: string; email?: string }): Promise<Document | undefined> {
        const [document] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!document) return undefined;

        const lines = await db.select().from(documentPricingLines).where(eq(documentPricingLines.documentId, documentId));
        const totals = calculateTotals(
            lines.map<PricingLineInput>((l) => ({
                amountCents: l.amountCents, treatment: l.treatment, isGstInclusive: l.isGstInclusive,
            })),
            document.gstMode,
            document.gstRateBp,
        );

        return updateReturning<Document>(documents, documentId, {
            subtotalCents: totals.subtotalCents,
            gstCents: totals.gstCents,
            totalCents: document.totalOverrideCents ?? totals.totalCents,
            optionalTotalCents: totals.optionalTotalCents,
            displaySeparatelyTotalCents: totals.displaySeparatelyTotalCents,
            updatedAt: new Date(),
        });
    },
};
