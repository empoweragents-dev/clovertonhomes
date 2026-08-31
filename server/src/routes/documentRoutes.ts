import { Router } from "express";
import { brandService, statusService, documentService, templateService, clauseService } from "../services/documents";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";
import tenderRoutes from "./tenderRoutes";

const router = Router();

/**
 * Document engine API (tenders now, build contracts in phase 2).
 * Every route is admin-only — these are commercial documents.
 */

// ---------------------------------------------------------------- brand settings

// GET /api/documents/settings - builder identity + document appearance
router.get("/settings", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const brand = await brandService.getOrCreate();
    res.json({
        success: true,
        data: brand,
        // Surfaced so the UI can warn before a tender is blocked at issue time.
        missingRequired: brandService.missingRequiredFields(brand),
    });
}));

// PUT /api/documents/settings
router.put("/settings", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const brand = await brandService.update(req.body, req.user?.id);
    res.json({
        success: true,
        data: brand,
        missingRequired: brandService.missingRequiredFields(brand),
    });
}));

// ---------------------------------------------------------------- item statuses

// GET /api/documents/statuses
router.get("/statuses", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const statuses = await statusService.getAll(req.query.includeInactive === "true");
    res.json({ success: true, data: statuses });
}));

// POST /api/documents/statuses - staff-defined status (§9)
router.post("/statuses", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { code, label } = req.body;
    if (!code || !label) {
        return res.status(400).json({ success: false, message: "code and label are required" });
    }
    if (await statusService.getByCode(code)) {
        return res.status(409).json({ success: false, message: `Status code "${code}" already exists` });
    }
    const status = await statusService.create(req.body);
    res.status(201).json({ success: true, data: status });
}));

// PUT /api/documents/statuses/:id
router.put("/statuses/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const status = await statusService.update(req.params.id, req.body);
    if (!status) {
        return res.status(404).json({ success: false, message: "Status not found" });
    }
    res.json({ success: true, data: status });
}));

// DELETE /api/documents/statuses/:id
router.delete("/statuses/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const result = await statusService.remove(req.params.id);
    if (result.reason === "not_found") {
        return res.status(404).json({ success: false, message: "Status not found" });
    }
    if (result.reason === "system") {
        return res.status(400).json({ success: false, message: "Built-in statuses cannot be deleted. Deactivate it instead." });
    }
    res.json({ success: true, message: "Status deleted" });
}));


// ---------------------------------------------------------------- clauses

// GET /api/documents/clauses - terms & conditions library (§12)
router.get("/clauses", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const clauses = await clauseService.getAll(req.query.includeInactive === "true");
    res.json({ success: true, data: clauses, total: clauses.length });
}));

// GET /api/documents/clauses/:id/versions - full history (§13)
router.get("/clauses/:id/versions", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const versions = await clauseService.getVersions(req.params.id);
    res.json({ success: true, data: versions });
}));

// POST /api/documents/clauses
router.post("/clauses", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    if (!req.body.name || !req.body.bodyMarkup) {
        return res.status(400).json({ success: false, message: "name and bodyMarkup are required" });
    }
    const clause = await clauseService.create(req.body, req.user);
    res.status(201).json({ success: true, data: clause });
}));

// PUT /api/documents/clauses/:id - edits append a version, never overwrite
router.put("/clauses/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const clause = await clauseService.update(req.params.id, req.body, req.user);
    if (!clause) return res.status(404).json({ success: false, message: "Clause not found" });
    res.json({ success: true, data: clause });
}));

// DELETE /api/documents/clauses/:id - deactivates; issued tenders reference versions
router.delete("/clauses/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const ok = await clauseService.deactivate(req.params.id, req.user);
    if (!ok) return res.status(404).json({ success: false, message: "Clause not found" });
    res.json({ success: true, message: "Clause deactivated" });
}));

// ---------------------------------------------------------------- templates

// GET /api/documents/templates - master templates (§7)
router.get("/templates", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const templates = await templateService.getAll(req.query.includeInactive === "true");
    res.json({ success: true, data: templates, total: templates.length });
}));

// GET /api/documents/templates/:id - full tree with sections and clauses
router.get("/templates/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const tree = await templateService.getTree(req.params.id);
    if (!tree) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, data: tree });
}));

// POST /api/documents/templates
router.post("/templates", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ success: false, message: "name is required" });
    }
    const template = await templateService.create(req.body, req.user?.id);
    res.status(201).json({ success: true, data: template });
}));

// PUT /api/documents/templates/:id
router.put("/templates/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const template = await templateService.update(req.params.id, req.body);
    if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.json({ success: true, data: template });
}));

// POST /api/documents/templates/:id/duplicate
router.post("/templates/:id/duplicate", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const name = req.body.name || "Copy of template";
    const template = await templateService.duplicate(req.params.id, name, req.user?.id);
    if (!template) {
        return res.status(404).json({ success: false, message: "Template not found" });
    }
    res.status(201).json({ success: true, data: template });
}));

// POST /api/documents/templates/:id/sections
router.post("/templates/:id/sections", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const section = await templateService.addSection(req.params.id, req.body);
    res.status(201).json({ success: true, data: section });
}));

// DELETE /api/documents/templates/sections/:sectionId
router.delete("/templates/sections/:sectionId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await templateService.deleteSection(req.params.sectionId);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Section not found" });
    }
    res.json({ success: true, message: "Section deleted" });
}));

// POST /api/documents/templates/:id/sections/:sectionId/items
router.post("/templates/:id/sections/:sectionId/items", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const item = await templateService.addItem(req.params.id, req.params.sectionId, req.body);
    res.status(201).json({ success: true, data: item });
}));

// PUT /api/documents/templates/items/:itemId
router.put("/templates/items/:itemId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const item = await templateService.updateItem(req.params.itemId, req.body);
    if (!item) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, data: item });
}));

// DELETE /api/documents/templates/items/:itemId
router.delete("/templates/items/:itemId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await templateService.deleteItem(req.params.itemId);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, message: "Item deleted" });
}));

// ---------------------------------------------------------------- tenders

// GET /api/documents/stats - dashboard counters
router.get("/stats", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const stats = await documentService.getStats((req.query.docType as string) || "tender");
    res.json({ success: true, data: stats });
}));

// GET /api/documents - dashboard list
router.get("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { docType, q, status, clientId, templateId, createdBy, dateFrom, dateTo, includeArchived, limit, offset } = req.query;

    const result = await documentService.getAll({
        docType: docType as string,
        q: q as string,
        status: status as string,
        clientId: clientId as string,
        templateId: templateId as string,
        createdBy: createdBy as string,
        dateFrom: dateFrom as string,
        dateTo: dateTo as string,
        includeArchived: includeArchived === "true",
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
    });

    res.json({ success: true, data: result.documents, total: result.total });
}));

// GET /api/documents/:id
router.get("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const document = await documentService.getById(req.params.id);
    if (!document) {
        return res.status(404).json({ success: false, message: "Document not found" });
    }
    res.json({ success: true, data: document });
}));

// Tender instance routes (create, edit, price, preview, issue, files).
// Mounted last so /templates, /statuses, /settings and /stats resolve first.
router.use("/", tenderRoutes);

export default router;
