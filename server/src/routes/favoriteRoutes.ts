import { Router } from "express";
import { favoriteService } from "../services";
import { asyncHandler, requireAuth } from "../middleware";

const router = Router();

// GET /api/favorites - Get user's favorites
router.get("/", requireAuth, asyncHandler(async (req, res) => {
    const favorites = await favoriteService.getUserFavorites(req.user!.id);
    res.json({ success: true, data: favorites });
}));

// POST /api/favorites - Add favorite
router.post("/", requireAuth, asyncHandler(async (req, res) => {
    const { propertyId, designId } = req.body;
    if (!propertyId && !designId) {
        return res.status(400).json({ success: false, message: "propertyId or designId required" });
    }
    const favorite = await favoriteService.addFavorite(req.user!.id, propertyId, designId);
    res.status(201).json({ success: true, data: favorite });
}));

// GET /api/favorites/check - Check if item is favorited
router.get("/check", requireAuth, asyncHandler(async (req, res) => {
    const { propertyId, designId } = req.query;
    const isFavorited = await favoriteService.isFavorited(
        req.user!.id,
        propertyId as string,
        designId as string
    );
    res.json({ success: true, data: { isFavorited } });
}));

// DELETE /api/favorites/:id - Remove favorite
router.delete("/:id", requireAuth, asyncHandler(async (req, res) => {
    const deleted = await favoriteService.removeFavorite(req.params.id, req.user!.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Favorite not found" });
    }
    res.json({ success: true, message: "Favorite removed" });
}));

export default router;
