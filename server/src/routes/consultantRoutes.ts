import { Router } from "express";
import { consultantService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";

const router = Router();

// GET /api/consultants - Get all consultants (public)
router.get("/", asyncHandler(async (req, res) => {
    const consultants = await consultantService.getAll();
    res.json({ success: true, data: consultants });
}));

// GET /api/consultants/:id - Get consultant by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const consultant = await consultantService.getById(req.params.id);
    if (!consultant) {
        return res.status(404).json({ success: false, message: "Consultant not found" });
    }
    res.json({ success: true, data: consultant });
}));

// POST /api/consultants - Create consultant (admin)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const consultant = await consultantService.create(req.body);
    res.status(201).json({ success: true, data: consultant });
}));

// PUT /api/consultants/:id - Update consultant (admin)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const consultant = await consultantService.update(req.params.id, req.body);
    if (!consultant) {
        return res.status(404).json({ success: false, message: "Consultant not found" });
    }
    res.json({ success: true, data: consultant });
}));

// DELETE /api/consultants/:id - Delete consultant (admin)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await consultantService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Consultant not found" });
    }
    res.json({ success: true, message: "Consultant deleted" });
}));

export default router;
