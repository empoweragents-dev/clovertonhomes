import { Router } from "express";
import { regionService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";

const router = Router();

// GET /api/regions - Get all regions
router.get("/", asyncHandler(async (req, res) => {
    const regions = await regionService.getAll();
    res.json({ success: true, data: regions });
}));

// GET /api/regions/:id - Get region by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const region = await regionService.getById(req.params.id);
    if (!region) {
        return res.status(404).json({ success: false, message: "Region not found" });
    }
    res.json({ success: true, data: region });
}));

// POST /api/regions - Create region (admin only)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const region = await regionService.create(req.body);
    res.status(201).json({ success: true, data: region });
}));

// PUT /api/regions/:id - Update region (admin only)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const region = await regionService.update(req.params.id, req.body);
    if (!region) {
        return res.status(404).json({ success: false, message: "Region not found" });
    }
    res.json({ success: true, data: region });
}));

// DELETE /api/regions/:id - Delete region (admin only)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await regionService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Region not found" });
    }
    res.json({ success: true, message: "Region deleted" });
}));

export default router;
