import { Router } from "express";
import { testimonialService } from "../services";
import { asyncHandler, requireAuth, requireAdmin } from "../middleware";

const router = Router();

// GET /api/testimonials - Get all testimonials (public)
router.get("/", asyncHandler(async (req, res) => {
    const testimonials = await testimonialService.getAll();
    res.json({ success: true, data: testimonials });
}));

// GET /api/testimonials/:id - Get testimonial by ID
router.get("/:id", asyncHandler(async (req, res) => {
    const testimonial = await testimonialService.getById(req.params.id);
    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, data: testimonial });
}));

// POST /api/testimonials - Create testimonial (admin)
router.post("/", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const testimonial = await testimonialService.create(req.body);
    res.status(201).json({ success: true, data: testimonial });
}));

// PUT /api/testimonials/:id - Update testimonial (admin)
router.put("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const testimonial = await testimonialService.update(req.params.id, req.body);
    if (!testimonial) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, data: testimonial });
}));

// DELETE /api/testimonials/:id - Delete testimonial (admin)
router.delete("/:id", requireAuth, requireAdmin, asyncHandler(async (req, res) => {
    const deleted = await testimonialService.delete(req.params.id);
    if (!deleted) {
        return res.status(404).json({ success: false, message: "Testimonial not found" });
    }
    res.json({ success: true, message: "Testimonial deleted" });
}));

export default router;
