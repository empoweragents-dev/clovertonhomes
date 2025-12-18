import { Router } from "express";
import { designService } from "../services";
import { asyncHandler, requireAuth, requireAdmin, validate, schemas } from "../middleware";

const router = Router();

// GET /api/designs - Get all designs with filters
router.get("/", asyncHandler(async (req, res) => {
    const { category, storeys, minBedrooms, maxBedrooms, minPrice, maxPrice, search, featured, limit, offset } = req.query;

    const filters = {
        category: category as string,
        storeys: storeys as string,
        minBedrooms: minBedrooms ? parseInt(minBedrooms as string) : undefined,
        maxBedrooms: maxBedrooms ? parseInt(maxBedrooms as string) : undefined,
        minPrice: minPrice ? parseInt(minPrice as string) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice as string) : undefined,
        search: search as string,
        featured: featured === "true",
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0,
    };

    const result = await designService.getAll(filters);
    res.json({ success: true, data: result.designs, total: result.total });
}));

// GET /api/designs/featured - Get featured designs for homepage
router.get("/featured", asyncHandler(async (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 6;
    const designs = await designService.getFeatured(limit);
    res.json({ success: true, data: designs });
}));

// GET /api/designs/:slug - Get design by slug
router.get("/:slug", asyncHandler(async (req, res) => {
    const result = await designService.getBySlug(req.params.slug);
    if (!result) {
        return res.status(404).json({ success: false, message: "Design not found" });
    }
    res.json({ success: true, data: result });
}));

// POST /api/designs - Create design (admin only)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const design = await designService.create(req.body);
    res.status(201).json({ success: true, data: design });
}));

// PUT /api/designs/:id - Update design (admin only)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const design = await designService.update(req.params.id, req.body);
    if (!design) {
        return res.status(404).json({ success: false, message: "Design not found" });
    }
    res.json({ success: true, data: design });
}));

// POST /api/designs/:id/images - Add image to design (admin only)
router.post("/:id/images", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const image = await designService.addImage(req.params.id, req.body);
    res.status(201).json({ success: true, data: image });
}));

// DELETE /api/designs/:id/images/:imageId - Delete image (admin only)
router.delete("/:id/images/:imageId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await designService.deleteImage(req.params.imageId);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Image not found" });
    }
    res.json({ success: true, message: "Image deleted" });
}));

// DELETE /api/designs/:id - Delete design (admin only)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await designService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Design not found" });
    }
    res.json({ success: true, message: "Design deleted" });
}));

export default router;
