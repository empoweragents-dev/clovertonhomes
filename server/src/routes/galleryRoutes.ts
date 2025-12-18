import { Router } from 'express';
import { galleryService } from '../services/galleryService';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Get all active interior schemes
router.get('/schemes', async (req, res) => {
    try {
        const schemes = await galleryService.getAllSchemes(true);
        res.json({ success: true, data: schemes });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch schemes' });
    }
});

// Get scheme by slug
router.get('/schemes/:slug', async (req, res) => {
    try {
        const scheme = await galleryService.getSchemeBySlug(req.params.slug);
        if (!scheme) {
            return res.status(404).json({ success: false, error: 'Scheme not found' });
        }
        res.json({ success: true, data: scheme });
    } catch (error) {
        console.error('Error fetching scheme:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch scheme' });
    }
});

// Get all gallery images with optional filters
router.get('/images', async (req, res) => {
    try {
        const { category, featured } = req.query;
        const images = await galleryService.getAllImages({
            category: category as string | undefined,
            featured: featured === 'true' ? true : featured === 'false' ? false : undefined,
            activeOnly: true,
        });
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch images' });
    }
});

// Get image categories
router.get('/categories', async (req, res) => {
    try {
        const categories = await galleryService.getCategories();
        res.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch categories' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get all schemes (including inactive)
router.get('/admin/schemes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const schemes = await galleryService.getAllSchemes(false);
        res.json({ success: true, data: schemes });
    } catch (error) {
        console.error('Error fetching schemes:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch schemes' });
    }
});

// Create scheme
router.post('/admin/schemes', requireAuth, requireAdmin, async (req, res) => {
    try {
        const scheme = await galleryService.createScheme(req.body);
        res.status(201).json({ success: true, data: scheme });
    } catch (error) {
        console.error('Error creating scheme:', error);
        res.status(500).json({ success: false, error: 'Failed to create scheme' });
    }
});

// Update scheme
router.put('/admin/schemes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const scheme = await galleryService.updateScheme(req.params.id, req.body);
        res.json({ success: true, data: scheme });
    } catch (error) {
        console.error('Error updating scheme:', error);
        res.status(500).json({ success: false, error: 'Failed to update scheme' });
    }
});

// Delete scheme
router.delete('/admin/schemes/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await galleryService.deleteScheme(req.params.id);
        res.json({ success: true, message: 'Scheme deleted' });
    } catch (error) {
        console.error('Error deleting scheme:', error);
        res.status(500).json({ success: false, error: 'Failed to delete scheme' });
    }
});

// Get all images (including inactive)
router.get('/admin/images', requireAuth, requireAdmin, async (req, res) => {
    try {
        const images = await galleryService.getAllImages({ activeOnly: false });
        res.json({ success: true, data: images });
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch images' });
    }
});

// Create image
router.post('/admin/images', requireAuth, requireAdmin, async (req, res) => {
    try {
        const image = await galleryService.createImage(req.body);
        res.status(201).json({ success: true, data: image });
    } catch (error) {
        console.error('Error creating image:', error);
        res.status(500).json({ success: false, error: 'Failed to create image' });
    }
});

// Update image
router.put('/admin/images/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const image = await galleryService.updateImage(req.params.id, req.body);
        res.json({ success: true, data: image });
    } catch (error) {
        console.error('Error updating image:', error);
        res.status(500).json({ success: false, error: 'Failed to update image' });
    }
});

// Delete image
router.delete('/admin/images/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await galleryService.deleteImage(req.params.id);
        res.json({ success: true, message: 'Image deleted' });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ success: false, error: 'Failed to delete image' });
    }
});

export default router;
