import { db } from "../../config/database.js";
import {
    documents, documentRevisions, documentFiles, documentItems,
    Document, DocumentRevision,
} from "../../db/schema/index.js";
import { eq, and, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { withTx } from "../../db/txHelpers.js";
import { tenderService } from "./tenderService.js";
import { snapshotService, DocumentSnapshot } from "./snapshot.js";
import { brandService } from "./brandService.js";
import { documentStorage } from "./storage.js";
import { auditService } from "./auditService.js";
import { renderTenderPdf } from "../../pdf/render.js";

/**
 * Validation, issuing and revisions.
 *
 * Issue is the one irreversible step: it freezes a snapshot, renders the PDF, stores
 * the bytes with a checksum and locks the document. After that the only way to change
 * anything is Create Revision.
 */

export interface ValidationIssue {
    code: string;
    message: string;
    tab: string;
    severity: "error" | "warning";
}

export const issueService = {
    /** §43 pre-issue checks. Errors block; warnings inform. */
    async validate(documentId: string): Promise<{ errors: ValidationIssue[]; warnings: ValidationIssue[] }> {
        const tree = await tenderService.getTree(documentId);
        if (!tree) throw Object.assign(new Error("Document not found"), { statusCode: 404 });

        const brand = await brandService.getOrCreate();
        const doc = tree.document;
        const errors: ValidationIssue[] = [];
        const warnings: ValidationIssue[] = [];

        const err = (code: string, message: string, tab: string) => errors.push({ code, message, tab, severity: "error" });
        const warn = (code: string, message: string, tab: string) => warnings.push({ code, message, tab, severity: "warning" });

        if (!doc.clientDisplayName?.trim() && !tree.parties.some((p) => p.fullName?.trim())) {
            err("CLIENT_MISSING", "Add at least one client name", "client");
        }
        if (!doc.projectAddress?.trim()) err("PROJECT_ADDRESS_MISSING", "Enter the construction address", "project");
        if (!doc.documentDate) err("DOCUMENT_DATE_MISSING", "Set the tender date", "tender");
        if (!doc.validityDays || doc.validityDays < 1 || doc.validityDays > 365) {
            err("VALIDITY_INVALID", "Validity must be between 1 and 365 days", "tender");
        }
        if (doc.documentDate && doc.expiryDate && new Date(doc.expiryDate) <= new Date(doc.documentDate)) {
            err("EXPIRY_BEFORE_DATE", "Expiry date must be after the tender date", "tender");
        }

        const totalCents = doc.totalOverrideCents ?? doc.totalCents;
        if (!totalCents || totalCents <= 0) err("PRICE_MISSING", "Enter a tender price", "pricing");
        if (doc.gstRateBp <= 0) err("GST_MODE_INVALID", "GST rate must be greater than zero", "pricing");

        const visibleItems = tree.sections.flatMap((s) => s.items.filter((i) => i.isClientVisible));
        if (!tree.sections.length) err("NO_SECTIONS", "The tender has no sections", "inclusions");
        else if (!visibleItems.length) err("NO_VISIBLE_ITEMS", "No clauses are visible to the client", "inclusions");

        // Builder details print on every page, so they must exist before issuing.
        const missingBrand = brandService.missingRequiredFields(brand);
        if (missingBrand.length) {
            err("BRAND_INCOMPLETE", `Document branding is incomplete: ${missingBrand.join(", ")}`, "branding");
        }

        if (doc.totalOverrideCents !== null && !doc.totalOverrideReason?.trim()) {
            err("OVERRIDE_WITHOUT_REASON", "A price override needs a recorded reason", "pricing");
        }

        // Any unresolved {{placeholder}} would print literally to the client.
        const { unresolved } = await snapshotService.build(documentId, { isPreview: true });
        for (const token of unresolved) {
            err("UNRESOLVED_PLACEHOLDER", `Unknown placeholder {{${token}}} would appear in the PDF`, "inclusions");
        }

        if (!tree.parties.some((p) => p.email?.trim() || p.phone?.trim())) {
            warn("CLIENT_CONTACT_MISSING", "No client email or phone recorded", "client");
        }
        if (!doc.suburb?.trim()) warn("PROJECT_SUBURB_MISSING", "No suburb recorded", "project");
        if (visibleItems.length > 150) {
            warn("LARGE_DOCUMENT", `${visibleItems.length} clauses — PDF generation may be slow`, "inclusions");
        }
        const emptyBodies = visibleItems.filter((i) => !i.bodyHtml?.trim()).length;
        if (emptyBodies) warn("EMPTY_CLAUSE_BODY", `${emptyBodies} visible clauses have no description`, "inclusions");

        return { errors, warnings };
    },

    /** Renders a watermarked PDF from current data without persisting anything. */
    async preview(documentId: string, actor?: { id?: string }): Promise<Buffer> {
        const { snapshot } = await snapshotService.build(documentId, { isPreview: true, generatedBy: actor?.id });
        const { buffer } = await renderTenderPdf(snapshot);
        return buffer;
    },

    /**
     * Issues the current revision: validate, freeze, render, store, lock.
     *
     * The file is written BEFORE the DB rows. An orphaned file is recoverable noise;
     * a DB row pointing at a missing "immutable" PDF is a broken promise to a client.
     */
    async issue(documentId: string, actor?: { id?: string; email?: string }, changeSummary?: string):
        Promise<{ document: Document; revision: DocumentRevision; fileId: string }> {

        const [existing] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!existing) throw Object.assign(new Error("Document not found"), { statusCode: 404 });
        tenderService.assertMutable(existing);

        const { errors } = await this.validate(documentId);
        if (errors.length) {
            throw Object.assign(new Error("This tender cannot be issued yet"), {
                statusCode: 400, code: "VALIDATION_FAILED", errors,
            });
        }

        // Recompute totals server-side; never trust what the client last sent.
        await tenderService.recalculate(documentId, actor);

        const { snapshot } = await snapshotService.build(documentId, { generatedBy: actor?.id });
        const checksum = snapshotService.hash(snapshot);

        const { buffer, pageCount, byteSize } = await renderTenderPdf(snapshot);

        const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
        const key = documentStorage.buildKey(doc.docType, doc.year, doc.documentNumber, doc.currentRevisionNumber);
        const stored = await documentStorage.put(key, buffer, "application/pdf");

        try {
            const result = await withTx(async (tx) => {
                const [revision] = await tx.select().from(documentRevisions).where(and(
                    eq(documentRevisions.documentId, documentId),
                    eq(documentRevisions.revisionNumber, doc.currentRevisionNumber),
                ));

                await tx.update(documentRevisions).set({
                    status: "issued",
                    issuedAt: new Date(),
                    issuedByUserId: actor?.id,
                    snapshotJson: snapshot as unknown as Record<string, unknown>,
                    snapshotHash: checksum,
                    totalCents: snapshot.pricing.totalCents,
                    changeSummary,
                    updatedAt: new Date(),
                }).where(eq(documentRevisions.id, revision.id));

                const fileId = randomUUID();
                await tx.insert(documentFiles).values({
                    id: fileId, documentId, revisionId: revision.id,
                    kind: "final_pdf",
                    label: `${doc.documentNumber}-R${doc.currentRevisionNumber}`,
                    filename: `${doc.documentNumber}-R${doc.currentRevisionNumber}.pdf`,
                    storageBackend: "local", storageKey: stored.key,
                    mimeType: stored.mimeType, byteSize: stored.byteSize,
                    sha256: stored.sha256, pageCount,
                    generatedByUserId: actor?.id,
                });

                await tx.update(documents).set({
                    status: "ready_to_send", lockedAt: new Date(), updatedAt: new Date(),
                }).where(eq(documents.id, documentId));

                const [updatedDoc] = await tx.select().from(documents).where(eq(documents.id, documentId));
                const [updatedRev] = await tx.select().from(documentRevisions).where(eq(documentRevisions.id, revision.id));
                return { document: updatedDoc, revision: updatedRev, fileId };
            });

            await auditService.log({
                entityType: "document", entityId: documentId, documentId,
                revisionNumber: doc.currentRevisionNumber, action: "revision_issued",
                summary: `Issued ${doc.documentNumber}-R${doc.currentRevisionNumber} — ${(snapshot.pricing.totalCents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" })}, ${pageCount ?? "?"} pages`,
                actor, metadata: { checksum, byteSize, pageCount },
            });

            return result;
        } catch (err) {
            // DB write failed after the file landed — remove the orphan.
            await documentStorage.delete(stored.key).catch(() => undefined);
            throw err;
        }
    },

    /**
     * Opens the next revision for editing. The issued revision's snapshot and PDF are
     * never touched, so R0 stays exactly as the client received it.
     */
    async createRevision(documentId: string, actor?: { id?: string; email?: string }, note?: string): Promise<Document | undefined> {
        const [doc] = await db.select().from(documents).where(eq(documents.id, documentId));
        if (!doc) return undefined;

        const [current] = await db.select().from(documentRevisions)
            .where(and(eq(documentRevisions.documentId, documentId), eq(documentRevisions.revisionNumber, doc.currentRevisionNumber)));

        if (current?.status !== "issued") {
            throw Object.assign(new Error(`Revision R${doc.currentRevisionNumber} has not been issued yet — edit it directly.`), { statusCode: 409 });
        }

        const next = doc.currentRevisionNumber + 1;

        return withTx(async (tx) => {
            await tx.update(documentRevisions)
                .set({ status: "superseded", updatedAt: new Date() })
                .where(eq(documentRevisions.id, current.id));

            await tx.insert(documentRevisions).values({
                id: randomUUID(), documentId, revisionNumber: next,
                revisionLabel: `${doc.documentNumber}-R${next}`,
                status: "draft", changeSummary: note, createdByUserId: actor?.id,
            });

            // Working-copy rows carry forward as-is; R0's immutability rests entirely
            // on its frozen snapshot plus the stored PDF bytes.
            await tx.update(documents).set({
                currentRevisionNumber: next, status: "draft", lockedAt: null,
                updatedAt: new Date(), updatedByUserId: actor?.id,
            }).where(eq(documents.id, documentId));

            await auditService.log({
                entityType: "document", entityId: documentId, documentId, revisionNumber: next,
                action: "revision_created", summary: `Opened revision R${next}${note ? `: ${note}` : ""}`, actor,
            });

            const [updated] = await tx.select().from(documents).where(eq(documents.id, documentId));
            return updated;
        });
    },

    async getFile(documentId: string, fileId: string) {
        const [file] = await db.select().from(documentFiles)
            .where(and(eq(documentFiles.id, fileId), eq(documentFiles.documentId, documentId)));
        return file;
    },

    async getLatestPdf(documentId: string, revisionNumber?: number) {
        const files = await db.select().from(documentFiles)
            .where(and(eq(documentFiles.documentId, documentId), eq(documentFiles.kind, "final_pdf")))
            .orderBy(desc(documentFiles.createdAt));

        if (revisionNumber === undefined) return files[0];

        const revisions = await db.select().from(documentRevisions)
            .where(and(eq(documentRevisions.documentId, documentId), eq(documentRevisions.revisionNumber, revisionNumber)));
        if (!revisions[0]) return undefined;
        return files.find((f) => f.revisionId === revisions[0].id);
    },
};
