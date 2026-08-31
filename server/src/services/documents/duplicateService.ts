import { db } from "../../config/database";
import {
    documents, documentParties, documentSections, documentItems,
    documentPricingLines, documentRevisions, Document, DocumentParty,
} from "../../db/schema";
import { eq, asc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { withTx, insertMany } from "../../db/txHelpers";
import { tenderService } from "./tenderService";
import { auditService } from "./auditService";

/**
 * Duplicate a tender for another client (§24).
 *
 * Every copied row gets a NEW id under a NEW document id, so the copy shares no
 * storage with the original: changing the duplicate can never affect the tender it
 * came from. That independence is asserted by test, not assumed.
 */

export interface DuplicateOptions {
    /** Which revision to copy from. Omitted = the current working copy. */
    fromRevision?: number;
    copyInclusions?: boolean;
    copyPricing?: boolean;
    copyOptionalItems?: boolean;
    /** New client/project for the copy. */
    clientDisplayName?: string;
    clientType?: string;
    parties?: Partial<DocumentParty>[];
    projectAddress?: string;
    suburb?: string;
    state?: string;
    postcode?: string;
    lotNumber?: string;
}

export const duplicateService = {
    async duplicate(sourceId: string, options: DuplicateOptions, actor?: { id?: string; email?: string }): Promise<Document> {
        const source = await tenderService.getTree(sourceId);
        if (!source) throw Object.assign(new Error("Tender not found"), { statusCode: 404 });

        const copyInclusions = options.copyInclusions ?? true;
        const copyPricing = options.copyPricing ?? true;
        const copyOptional = options.copyOptionalItems ?? true;

        const src = source.document;
        const documentId = randomUUID();
        const year = new Date().getFullYear();

        // Dates restart from today: a duplicate is a new offer, and carrying the
        // original's expiry across would quietly issue an already-stale tender.
        const today = new Date();
        const validityDays = src.validityDays ?? 30;
        const expiry = new Date(today);
        expiry.setDate(expiry.getDate() + validityDays);
        const asDate = (d: Date) => d.toISOString().slice(0, 10);

        const created = await withTx(async (tx) => {
            const { documentNumber, sequence } = await tenderService.allocateNumber(tx, "tender", year);

            await tx.insert(documents).values({
                id: documentId,
                docType: src.docType,
                documentNumber,
                year,
                sequence,
                currentRevisionNumber: 0,
                status: "draft",
                templateId: src.templateId,
                templateVersionAtCreate: src.templateVersionAtCreate,
                sourceDocumentId: sourceId,

                // Client and project come from the caller, falling back to the source
                // only where the caller left a field blank.
                clientDisplayName: options.clientDisplayName ?? null,
                clientType: (options.clientType as any) ?? src.clientType,
                projectAddress: options.projectAddress ?? null,
                suburb: options.suburb ?? null,
                state: options.state ?? src.state,
                postcode: options.postcode ?? null,
                lotNumber: options.lotNumber ?? null,

                // Build characteristics carry over — that is the point of duplicating.
                constructionType: src.constructionType,
                propertyType: src.propertyType,
                designId: src.designId,
                designNameSnapshot: src.designNameSnapshot,
                facadeId: src.facadeId,
                facadeSnapshot: src.facadeSnapshot,
                squareMetres: src.squareMetres,
                squares: src.squares,
                bedrooms: src.bedrooms,
                bathrooms: src.bathrooms,
                garages: src.garages,

                documentDate: asDate(today) as any,
                expiryDate: asDate(expiry) as any,
                validityDays,
                preparedByName: src.preparedByName,
                preparedByUserId: actor?.id,
                salesConsultantName: src.salesConsultantName,
                estimatorName: src.estimatorName,
                introMarkup: src.introMarkup,
                clientNotes: src.clientNotes,

                gstMode: src.gstMode,
                gstRateBp: src.gstRateBp,
                pdfConfig: src.pdfConfig,

                createdByUserId: actor?.id,
                updatedByUserId: actor?.id,
            });

            if (options.parties?.length) {
                await insertMany(tx, documentParties, options.parties.map((p, i) => ({
                    id: randomUUID(), documentId,
                    role: p.role ?? (i === 0 ? "primary" : "secondary"),
                    fullName: p.fullName, companyName: p.companyName,
                    email: p.email, phone: p.phone,
                    currentAddress: p.currentAddress, postalAddress: p.postalAddress,
                    sortOrder: i,
                })));
            }

            if (copyInclusions) {
                const sectionIdMap = new Map<string, string>();
                await insertMany(tx, documentSections, source.sections.map((s, i) => {
                    const id = randomUUID();
                    sectionIdMap.set(s.id, id);
                    return {
                        id, documentId, templateSectionId: s.templateSectionId,
                        sectionNumber: s.sectionNumber, title: s.title, subtitle: s.subtitle,
                        descriptionMarkup: s.descriptionMarkup, descriptionHtml: s.descriptionHtml,
                        numberingStyle: s.numberingStyle,
                        coverSummaryLabel: s.coverSummaryLabel, showOnCoverSummary: s.showOnCoverSummary,
                        pageBreakBefore: s.pageBreakBefore, isClientVisible: s.isClientVisible,
                        sortOrder: i,
                    };
                }));

                const items = source.sections.flatMap((s) => s.items)
                    .filter((i) => copyOptional || i.statusCode !== "optional");

                await insertMany(tx, documentItems, items.map((i) => ({
                    id: randomUUID(), documentId,
                    sectionId: sectionIdMap.get(i.sectionId)!,
                    templateItemId: i.templateItemId,
                    clauseNumber: i.clauseNumber, displayClauseNumber: i.displayClauseNumber,
                    title: i.title, bodyMarkup: i.bodyMarkup, bodyHtml: i.bodyHtml,
                    statusCode: i.statusCode, statusLabel: i.statusLabel, statusTreatment: i.statusTreatment,
                    quantity: i.quantity, unit: i.unit,
                    allowanceCents: i.allowanceCents, priceCents: i.priceCents,
                    isClientVisible: i.isClientVisible,
                    internalNote: i.internalNote, clientNote: i.clientNote,
                    isCustom: i.isCustom, sortOrder: i.sortOrder,
                })).filter((r) => r.sectionId));
            }

            if (copyPricing) {
                await insertMany(tx, documentPricingLines, source.pricingLines.map((l, i) => ({
                    id: randomUUID(), documentId,
                    category: l.category, label: l.label, descriptionMarkup: l.descriptionMarkup,
                    quantity: l.quantity, unitAmountCents: l.unitAmountCents, amountCents: l.amountCents,
                    treatment: l.treatment, isGstInclusive: l.isGstInclusive,
                    showInSummary: l.showInSummary, isClientVisible: l.isClientVisible,
                    sortOrder: i,
                })));
            }

            await tx.insert(documentRevisions).values({
                id: randomUUID(), documentId, revisionNumber: 0,
                revisionLabel: `${documentNumber}-R0`, status: "draft",
                changeSummary: `Duplicated from ${src.documentNumber}`,
                createdByUserId: actor?.id,
            });

            const [row] = await tx.select().from(documents).where(eq(documents.id, documentId));
            return row;
        });

        // Renumber and recompute against the copy's own rows.
        if (copyInclusions) await tenderService.renumberDocument(documentId);
        if (copyPricing) await tenderService.recalculate(documentId, actor);

        await auditService.log({
            entityType: "document", entityId: documentId, documentId, revisionNumber: 0,
            action: "duplicated",
            summary: `Duplicated from ${src.documentNumber} (inclusions: ${copyInclusions}, pricing: ${copyPricing})`,
            actor, metadata: { sourceId, sourceNumber: src.documentNumber },
        });

        const [final] = await db.select().from(documents).where(eq(documents.id, documentId));
        return final;
    },
};
