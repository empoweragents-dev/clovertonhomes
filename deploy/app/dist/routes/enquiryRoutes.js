import { Router } from "express";
import { enquiryService } from "../services";
import { asyncHandler, requireAuth, requireAdmin, requireConsultantOrAdmin, validate, schemas } from "../middleware";
const router = Router();
// POST /api/enquiries - Create enquiry (public)
router.post("/", validate(schemas.createEnquiry), asyncHandler(async (req, res) => {
    const enquiry = await enquiryService.create(req.body);
    res.status(201).json({ success: true, data: enquiry, message: "Enquiry submitted successfully" });
}));
// GET /api/enquiries - Get all enquiries (admin/consultant)
router.get("/", requireAuth, requireConsultantOrAdmin, asyncHandler(async (req, res) => {
    const { type, status, assignedTo, limit, offset } = req.query;
    const filters = {
        type: type,
        status: status,
        assignedTo: assignedTo,
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
    };
    const result = await enquiryService.getAll(filters);
    res.json({ success: true, data: result.enquiries, total: result.total });
}));
// GET /api/enquiries/count - Get new enquiries count (admin)
router.get("/count", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const count = await enquiryService.getNewCount();
    res.json({ success: true, data: { count } });
}));
// GET /api/enquiries/:id - Get enquiry by ID (admin/consultant)
router.get("/:id", requireAuth, requireConsultantOrAdmin, asyncHandler(async (req, res) => {
    const result = await enquiryService.getById(req.params.id);
    if (!result) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, data: result });
}));
// PUT /api/enquiries/:id/status - Update enquiry status (admin)
router.put("/:id/status", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { status, notes } = req.body;
    const enquiry = await enquiryService.updateStatus(req.params.id, status, notes);
    if (!enquiry) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, data: enquiry });
}));
// PUT /api/enquiries/:id/assign - Assign enquiry (admin)
router.put("/:id/assign", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { userId } = req.body;
    const enquiry = await enquiryService.assign(req.params.id, userId);
    if (!enquiry) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, data: enquiry });
}));
// DELETE /api/enquiries/:id - Delete enquiry (admin)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await enquiryService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Enquiry not found" });
    }
    res.json({ success: true, message: "Enquiry deleted" });
}));
export default router;
