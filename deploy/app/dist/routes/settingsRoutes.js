import { Router } from "express";
import { settingsService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";
const router = Router();
// GET /api/settings - Get all settings (admin)
router.get("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const settings = await settingsService.getAll();
    res.json({ success: true, data: settings });
}));
// GET /api/settings/:key - Get setting by key (public for some, admin for others)
router.get("/:key", asyncHandler(async (req, res) => {
    const value = await settingsService.get(req.params.key);
    if (value === null) {
        return res.status(404).json({ success: false, message: "Setting not found" });
    }
    res.json({ success: true, data: { key: req.params.key, value } });
}));
// PUT /api/settings/:key - Update setting (admin)
router.put("/:key", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { value, type, description } = req.body;
    const setting = await settingsService.set(req.params.key, value, type, description);
    res.json({ success: true, data: setting });
}));
// DELETE /api/settings/:key - Delete setting (admin)
router.delete("/:key", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await settingsService.delete(req.params.key);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Setting not found" });
    }
    res.json({ success: true, message: "Setting deleted" });
}));
// POST /api/settings/bulk - Get multiple settings
router.post("/bulk", asyncHandler(async (req, res) => {
    const { keys } = req.body;
    if (!Array.isArray(keys)) {
        return res.status(400).json({ success: false, message: "keys array required" });
    }
    const settings = await settingsService.getMultiple(keys);
    res.json({ success: true, data: settings });
}));
export default router;
