import { Router } from "express";
import {
    tenderService, issueService, documentStorage, auditService,
    duplicateService, diffService,
} from "../services/documents";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";

const router = Router();

/**
 * Tender instance API. Mounted under /api/documents, after the more specific
 * /templates, /statuses and /settings paths so those are not swallowed by /:id.
 *
 * Admin-only: these are priced commercial documents.
 */

const actorFrom = (req: any) => ({ id: req.user?.id, email: req.user?.email, ip: req.ip });

// POST /api/documents - create a tender from a template
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const document = await tenderService.createFromTemplate(req.body, actorFrom(req));
    res.status(201).json({ success: true, data: document });
}));

// GET /api/documents/:id/full - document with parties, sections, items, pricing, revisions
router.get("/:id/full", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const tree = await tenderService.getTree(req.params.id);
    if (!tree) return res.status(404).json({ success: false, message: "Tender not found" });
    res.json({ success: true, data: tree });
}));

// PATCH /api/documents/:id - autosave header/client/project/tender fields
router.patch("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const document = await tenderService.update(req.params.id, req.body, actorFrom(req));
    if (!document) return res.status(404).json({ success: false, message: "Tender not found" });
    res.json({ success: true, data: document });
}));

// ------------------------------------------------------------------ clauses

router.post("/:id/sections/:sectionId/items", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const item = await tenderService.addItem(req.params.id, req.params.sectionId, req.body, actorFrom(req));
    if (!item) return res.status(404).json({ success: false, message: "Tender not found" });
    res.status(201).json({ success: true, data: item });
}));

router.put("/:id/items/:itemId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const item = await tenderService.updateItem(req.params.id, req.params.itemId, req.body, actorFrom(req));
    if (!item) return res.status(404).json({ success: false, message: "Clause not found" });
    res.json({ success: true, data: item });
}));

router.delete("/:id/items/:itemId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await tenderService.deleteItem(req.params.id, req.params.itemId, actorFrom(req));
    if (!deleted) return res.status(404).json({ success: false, message: "Clause not found" });
    res.json({ success: true, message: "Clause deleted" });
}));

// ------------------------------------------------------------------ pricing

// PUT /api/documents/:id/pricing - replace lines and recompute totals
router.put("/:id/pricing", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const document = await tenderService.savePricing(req.params.id, req.body.lines ?? [], actorFrom(req));
    if (!document) return res.status(404).json({ success: false, message: "Tender not found" });
    res.json({ success: true, data: document });
}));

// ------------------------------------------------------- validate / preview / issue

router.get("/:id/validate", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const result = await issueService.validate(req.params.id);
    res.json({ success: true, data: { ...result, canIssue: result.errors.length === 0 } });
}));

// POST /api/documents/:id/preview - streams a watermarked PDF; nothing is stored
router.post("/:id/preview", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const buffer = await issueService.preview(req.params.id, actorFrom(req));
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Length", buffer.length);
    res.setHeader("Content-Disposition", 'inline; filename="tender-preview.pdf"');
    res.setHeader("Cache-Control", "private, no-store");
    res.send(buffer);
}));

// POST /api/documents/:id/issue - validate, freeze, render, store, lock
router.post("/:id/issue", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    try {
        const result = await issueService.issue(req.params.id, actorFrom(req), req.body?.changeSummary);
        res.json({
            success: true,
            data: result,
            downloadUrl: `/api/documents/${req.params.id}/files/${result.fileId}`,
        });
    } catch (err: any) {
        if (err.code === "VALIDATION_FAILED") {
            return res.status(400).json({ success: false, message: err.message, errors: err.errors });
        }
        throw err;
    }
}));

// POST /api/documents/:id/revisions - open the next revision
router.post("/:id/revisions", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const document = await issueService.createRevision(req.params.id, actorFrom(req), req.body?.note);
    if (!document) return res.status(404).json({ success: false, message: "Tender not found" });
    res.status(201).json({ success: true, data: document });
}));

// ---------------------------------------------------- duplicate / comparison

// POST /api/documents/:id/duplicate - independent copy for another client (§24)
router.post("/:id/duplicate", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const document = await duplicateService.duplicate(req.params.id, req.body ?? {}, actorFrom(req));
    res.status(201).json({ success: true, data: document });
}));

// GET /api/documents/:id/compare?from=0&to=1 - revision diff (§25)
router.get("/:id/compare", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const from = parseInt(req.query.from as string);
    const to = parseInt(req.query.to as string);
    if (Number.isNaN(from) || Number.isNaN(to)) {
        return res.status(400).json({ success: false, message: "from and to revision numbers are required" });
    }
    const diff = await diffService.compare(req.params.id, from, to);
    res.json({ success: true, data: diff });
}));

// ------------------------------------------------------------------ files

// GET /api/documents/:id/files/:fileId - authenticated stream; never web-rooted
router.get("/:id/files/:fileId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const file = await issueService.getFile(req.params.id, req.params.fileId);
    if (!file) return res.status(404).json({ success: false, message: "File not found" });

    if (!(await documentStorage.exists(file.storageKey))) {
        return res.status(410).json({
            success: false,
            message: "The stored PDF is missing. Regenerate it from the revision snapshot.",
        });
    }

    // The checksum is the immutability guarantee — refuse to serve altered bytes.
    if (file.sha256 && !(await documentStorage.verify(file.storageKey, file.sha256))) {
        console.error(`Checksum mismatch for document file ${file.id} (${file.storageKey})`);
        return res.status(409).json({
            success: false,
            message: "This PDF no longer matches the checksum recorded when it was issued.",
        });
    }

    const disposition = req.query.download === "1" ? "attachment" : "inline";
    res.setHeader("Content-Type", file.mimeType ?? "application/pdf");
    if (file.byteSize) res.setHeader("Content-Length", file.byteSize);
    res.setHeader("Content-Disposition", `${disposition}; filename="${file.filename}"`);
    res.setHeader("Cache-Control", "private, no-store");
    documentStorage.createReadStream(file.storageKey).pipe(res);
}));

// GET /api/documents/:id/audit
router.get("/:id/audit", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const entries = await auditService.getForDocument(req.params.id);
    res.json({ success: true, data: entries });
}));

export default router;
