import { Router } from "express";
import multer from "multer";
import { uploadService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";
import { STORAGE_BUCKETS } from "../config/supabase";
const router = Router();
// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});
// POST /api/upload - Upload image (admin)
router.post("/", requireAuth, requireAdmin, upload.single("file"), asyncHandler(async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
    }
    // Validate file
    const validation = uploadService.validateFile({
        mimetype: req.file.mimetype,
        size: req.file.size,
    });
    if (!validation.valid) {
        return res.status(400).json({ success: false, message: validation.error });
    }
    // Get bucket from query or default to GENERAL
    const bucketKey = req.query.bucket?.toUpperCase() || "GENERAL";
    const bucket = bucketKey;
    if (!STORAGE_BUCKETS[bucket]) {
        return res.status(400).json({
            success: false,
            message: `Invalid bucket. Available: ${Object.keys(STORAGE_BUCKETS).join(", ")}`
        });
    }
    const folder = req.query.folder;
    const result = await uploadService.uploadImage(req.file.buffer, req.file.originalname, bucket, folder);
    res.json({ success: true, data: result });
}));
// DELETE /api/upload - Delete image (admin)
router.delete("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const { bucket, path } = req.body;
    if (!bucket || !path) {
        return res.status(400).json({ success: false, message: "bucket and path required" });
    }
    const deleted = await uploadService.deleteImage(bucket, path);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "File not found or delete failed" });
    }
    res.json({ success: true, message: "File deleted" });
}));
export default router;
