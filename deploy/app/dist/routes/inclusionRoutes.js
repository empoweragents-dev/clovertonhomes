import { Router } from "express";
import { inclusionService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";
const router = Router();
// === TIERS ===
// GET /api/inclusions/tiers - Get all tiers
router.get("/tiers", asyncHandler(async (req, res) => {
    const tiers = await inclusionService.getAllTiers();
    res.json({ success: true, data: tiers });
}));
// GET /api/inclusions/tiers/:slug - Get tier with full data
router.get("/tiers/:slug", asyncHandler(async (req, res) => {
    const result = await inclusionService.getFullTierData(req.params.slug);
    if (!result) {
        return res.status(404).json({ success: false, message: "Tier not found" });
    }
    res.json({ success: true, data: result });
}));
// POST /api/inclusions/tiers - Create tier (admin)
router.post("/tiers", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const tier = await inclusionService.createTier(req.body);
    res.status(201).json({ success: true, data: tier });
}));
// PUT /api/inclusions/tiers/:id - Update tier (admin)
router.put("/tiers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const tier = await inclusionService.updateTier(req.params.id, req.body);
    if (!tier) {
        return res.status(404).json({ success: false, message: "Tier not found" });
    }
    res.json({ success: true, data: tier });
}));
// DELETE /api/inclusions/tiers/:id - Delete tier (admin)
router.delete("/tiers/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await inclusionService.deleteTier(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Tier not found" });
    }
    res.json({ success: true, message: "Tier deleted" });
}));
// === CATEGORIES ===
// GET /api/inclusions/categories - Get all categories
router.get("/categories", asyncHandler(async (req, res) => {
    const categories = await inclusionService.getAllCategories();
    res.json({ success: true, data: categories });
}));
// POST /api/inclusions/categories - Create category (admin)
router.post("/categories", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const category = await inclusionService.createCategory(req.body);
    res.status(201).json({ success: true, data: category });
}));
// PUT /api/inclusions/categories/:id - Update category (admin)
router.put("/categories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const category = await inclusionService.updateCategory(req.params.id, req.body);
    if (!category) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, data: category });
}));
// DELETE /api/inclusions/categories/:id - Delete category (admin)
router.delete("/categories/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await inclusionService.deleteCategory(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category deleted" });
}));
// === ITEMS ===
// POST /api/inclusions/items - Create item (admin)
router.post("/items", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const item = await inclusionService.createItem(req.body);
    res.status(201).json({ success: true, data: item });
}));
// PUT /api/inclusions/items/:id - Update item (admin)
router.put("/items/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const item = await inclusionService.updateItem(req.params.id, req.body);
    if (!item) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, data: item });
}));
// DELETE /api/inclusions/items/:id - Delete item (admin)
router.delete("/items/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await inclusionService.deleteItem(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Item not found" });
    }
    res.json({ success: true, message: "Item deleted" });
}));
export default router;
