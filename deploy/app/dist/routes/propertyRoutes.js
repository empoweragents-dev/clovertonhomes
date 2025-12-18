import { Router } from "express";
import { propertyService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";
const router = Router();
// GET /api/properties - Get all properties with filters
router.get("/", asyncHandler(async (req, res) => {
    const { regionId, estateId, minPrice, maxPrice, bedrooms, bathrooms, garages, isLandReady, badge, search, limit, offset } = req.query;
    const filters = {
        regionId: regionId,
        estateId: estateId,
        minPrice: minPrice ? parseInt(minPrice) : undefined,
        maxPrice: maxPrice ? parseInt(maxPrice) : undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        garages: garages ? parseInt(garages) : undefined,
        isLandReady: isLandReady === "true",
        badge: badge,
        search: search,
        limit: limit ? parseInt(limit) : 20,
        offset: offset ? parseInt(offset) : 0,
    };
    const result = await propertyService.getAll(filters);
    res.json({ success: true, data: result.properties, total: result.total });
}));
// GET /api/properties/:slug - Get property by slug
router.get("/:slug", asyncHandler(async (req, res) => {
    const result = await propertyService.getBySlug(req.params.slug);
    if (!result) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, data: result });
}));
// POST /api/properties - Create property (admin only)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const property = await propertyService.create(req.body);
    res.status(201).json({ success: true, data: property });
}));
// PUT /api/properties/:id - Update property (admin only)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const property = await propertyService.update(req.params.id, req.body);
    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, data: property });
}));
// POST /api/properties/:id/images - Add image to property (admin only)
router.post("/:id/images", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const image = await propertyService.addImage(req.params.id, req.body);
    res.status(201).json({ success: true, data: image });
}));
// DELETE /api/properties/:id/images/:imageId - Delete image (admin only)
router.delete("/:id/images/:imageId", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await propertyService.deleteImage(req.params.imageId);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Image not found" });
    }
    res.json({ success: true, message: "Image deleted" });
}));
// DELETE /api/properties/:id - Delete property (admin only)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await propertyService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }
    res.json({ success: true, message: "Property deleted" });
}));
export default router;
