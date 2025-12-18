import { Router } from 'express';
import { studioService } from '../services/studioService';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();

// ==================== PUBLIC ROUTES ====================

// Get all active floor plans
router.get('/floor-plans', async (req, res) => {
    try {
        const floorPlans = await studioService.getAllFloorPlans(true);
        res.json({ success: true, data: floorPlans });
    } catch (error) {
        console.error('Error fetching floor plans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch floor plans' });
    }
});

// Get floor plan by slug
router.get('/floor-plans/:slug', async (req, res) => {
    try {
        const floorPlan = await studioService.getFloorPlanBySlug(req.params.slug);
        if (!floorPlan) {
            return res.status(404).json({ success: false, error: 'Floor plan not found' });
        }
        res.json({ success: true, data: floorPlan });
    } catch (error) {
        console.error('Error fetching floor plan:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch floor plan' });
    }
});

// Get all active facades
router.get('/facades', async (req, res) => {
    try {
        const { type } = req.query;
        const facades = await studioService.getAllFacades(true, type as string | undefined);
        res.json({ success: true, data: facades });
    } catch (error) {
        console.error('Error fetching facades:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch facades' });
    }
});

// Get facade by slug
router.get('/facades/:slug', async (req, res) => {
    try {
        const facade = await studioService.getFacadeBySlug(req.params.slug);
        if (!facade) {
            return res.status(404).json({ success: false, error: 'Facade not found' });
        }
        res.json({ success: true, data: facade });
    } catch (error) {
        console.error('Error fetching facade:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch facade' });
    }
});

// Submit a design configuration (public)
router.post('/submissions', async (req, res) => {
    try {
        const { floorPlanId, facadeId, inclusionTier, customerName, customerEmail, customerPhone, landAddress, comments } = req.body;

        if (!customerName || !customerEmail) {
            return res.status(400).json({ success: false, error: 'Name and email are required' });
        }

        const submission = await studioService.createSubmission({
            floorPlanId,
            facadeId,
            inclusionTier,
            customerName,
            customerEmail,
            customerPhone,
            landAddress,
            comments,
            status: 'pending',
        });

        // TODO: Send email notification to admin
        // await sendAdminNotification(submission);

        res.status(201).json({ success: true, data: submission });
    } catch (error) {
        console.error('Error creating submission:', error);
        res.status(500).json({ success: false, error: 'Failed to submit configuration' });
    }
});

// ==================== ADMIN ROUTES ====================

// Get all floor plans (including inactive)
router.get('/admin/floor-plans', requireAuth, requireAdmin, async (req, res) => {
    try {
        const floorPlans = await studioService.getAllFloorPlans(false);
        res.json({ success: true, data: floorPlans });
    } catch (error) {
        console.error('Error fetching floor plans:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch floor plans' });
    }
});

// Create floor plan
router.post('/admin/floor-plans', requireAuth, requireAdmin, async (req, res) => {
    try {
        const floorPlan = await studioService.createFloorPlan(req.body);
        res.status(201).json({ success: true, data: floorPlan });
    } catch (error) {
        console.error('Error creating floor plan:', error);
        res.status(500).json({ success: false, error: 'Failed to create floor plan' });
    }
});

// Update floor plan
router.put('/admin/floor-plans/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const floorPlan = await studioService.updateFloorPlan(req.params.id, req.body);
        res.json({ success: true, data: floorPlan });
    } catch (error) {
        console.error('Error updating floor plan:', error);
        res.status(500).json({ success: false, error: 'Failed to update floor plan' });
    }
});

// Delete floor plan
router.delete('/admin/floor-plans/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await studioService.deleteFloorPlan(req.params.id);
        res.json({ success: true, message: 'Floor plan deleted' });
    } catch (error) {
        console.error('Error deleting floor plan:', error);
        res.status(500).json({ success: false, error: 'Failed to delete floor plan' });
    }
});

// Get all facades (including inactive)
router.get('/admin/facades', requireAuth, requireAdmin, async (req, res) => {
    try {
        const facades = await studioService.getAllFacades(false);
        res.json({ success: true, data: facades });
    } catch (error) {
        console.error('Error fetching facades:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch facades' });
    }
});

// Create facade
router.post('/admin/facades', requireAuth, requireAdmin, async (req, res) => {
    try {
        const facade = await studioService.createFacade(req.body);
        res.status(201).json({ success: true, data: facade });
    } catch (error) {
        console.error('Error creating facade:', error);
        res.status(500).json({ success: false, error: 'Failed to create facade' });
    }
});

// Update facade
router.put('/admin/facades/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const facade = await studioService.updateFacade(req.params.id, req.body);
        res.json({ success: true, data: facade });
    } catch (error) {
        console.error('Error updating facade:', error);
        res.status(500).json({ success: false, error: 'Failed to update facade' });
    }
});

// Delete facade
router.delete('/admin/facades/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await studioService.deleteFacade(req.params.id);
        res.json({ success: true, message: 'Facade deleted' });
    } catch (error) {
        console.error('Error deleting facade:', error);
        res.status(500).json({ success: false, error: 'Failed to delete facade' });
    }
});

// Get all submissions
router.get('/admin/submissions', requireAuth, requireAdmin, async (req, res) => {
    try {
        const { status } = req.query;
        const submissions = await studioService.getAllSubmissions(status as string | undefined);
        res.json({ success: true, data: submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch submissions' });
    }
});

// Get submission by ID
router.get('/admin/submissions/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const submission = await studioService.getSubmissionById(req.params.id);
        if (!submission) {
            return res.status(404).json({ success: false, error: 'Submission not found' });
        }
        res.json({ success: true, data: submission });
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch submission' });
    }
});

// Update submission status
router.put('/admin/submissions/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        const submission = await studioService.updateSubmission(req.params.id, req.body);
        res.json({ success: true, data: submission });
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({ success: false, error: 'Failed to update submission' });
    }
});

// Delete submission
router.delete('/admin/submissions/:id', requireAuth, requireAdmin, async (req, res) => {
    try {
        await studioService.deleteSubmission(req.params.id);
        res.json({ success: true, message: 'Submission deleted' });
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ success: false, error: 'Failed to delete submission' });
    }
});

export default router;
