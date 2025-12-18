import { Router } from "express";
import { estateService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";
const router = Router();
// GET /api/estates - Get all estates
router.get("/", asyncHandler(async (req, res) => {
    const { regionId } = req.query;
    const estates = regionId
        ? await estateService.getByRegion(regionId)
        : await estateService.getAll();
    res.json({ success: true, data: estates });
}));
// GET /api/estates/:id - Get estate by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const estate = await estateService.getById(req.params.id);
    if (!estate) {
        return res.status(404).json({ success: false, message: "Estate not found" });
    }
    res.json({ success: true, data: estate });
}));
// POST /api/estates - Create estate (admin only)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const estate = await estateService.create(req.body);
    res.status(201).json({ success: true, data: estate });
}));
// PUT /api/estates/:id - Update estate (admin only)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const estate = await estateService.update(req.params.id, req.body);
    if (!estate) {
        return res.status(404).json({ success: false, message: "Estate not found" });
    }
    res.json({ success: true, data: estate });
}));
// DELETE /api/estates/:id - Delete estate (admin only)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await estateService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Estate not found" });
    }
    res.json({ success: true, message: "Estate deleted" });
}));
export default router;
