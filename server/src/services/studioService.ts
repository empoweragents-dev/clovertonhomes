import { db } from '../config/database';
import { studioFloorPlans, studioFacades, studioSubmissions, StudioFloorPlan, NewStudioFloorPlan, StudioFacade, NewStudioFacade, StudioSubmission, NewStudioSubmission } from '../db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';
import { insertReturning, updateReturning } from '../db/helpers';

export const studioService = {
    // Floor Plans
    async getAllFloorPlans(activeOnly = true) {
        const conditions = activeOnly ? eq(studioFloorPlans.isActive, true) : undefined;
        return db.select().from(studioFloorPlans)
            .where(conditions)
            .orderBy(asc(studioFloorPlans.sortOrder), asc(studioFloorPlans.name));
    },

    async getFloorPlanById(id: string) {
        const result = await db.select().from(studioFloorPlans).where(eq(studioFloorPlans.id, id));
        return result[0] || null;
    },

    async getFloorPlanBySlug(slug: string) {
        const result = await db.select().from(studioFloorPlans).where(eq(studioFloorPlans.slug, slug));
        return result[0] || null;
    },

    async createFloorPlan(data: NewStudioFloorPlan) {
        return insertReturning<StudioFloorPlan>(studioFloorPlans, data as any);
    },

    async updateFloorPlan(id: string, data: Partial<NewStudioFloorPlan>) {
        return updateReturning<StudioFloorPlan>(studioFloorPlans, id, { ...data, updatedAt: new Date() });
    },

    async deleteFloorPlan(id: string) {
        await db.delete(studioFloorPlans).where(eq(studioFloorPlans.id, id));
    },

    // Facades
    async getAllFacades(activeOnly = true, type?: string) {
        let query = db.select().from(studioFacades);

        if (activeOnly && type) {
            query = query.where(and(eq(studioFacades.isActive, true), eq(studioFacades.type, type))) as any;
        } else if (activeOnly) {
            query = query.where(eq(studioFacades.isActive, true)) as any;
        } else if (type) {
            query = query.where(eq(studioFacades.type, type)) as any;
        }

        return query.orderBy(asc(studioFacades.sortOrder), asc(studioFacades.name));
    },

    async getFacadeById(id: string) {
        const result = await db.select().from(studioFacades).where(eq(studioFacades.id, id));
        return result[0] || null;
    },

    async getFacadeBySlug(slug: string) {
        const result = await db.select().from(studioFacades).where(eq(studioFacades.slug, slug));
        return result[0] || null;
    },

    async createFacade(data: NewStudioFacade) {
        return insertReturning<StudioFacade>(studioFacades, data as any);
    },

    async updateFacade(id: string, data: Partial<NewStudioFacade>) {
        return updateReturning<StudioFacade>(studioFacades, id, { ...data, updatedAt: new Date() });
    },

    async deleteFacade(id: string) {
        await db.delete(studioFacades).where(eq(studioFacades.id, id));
    },

    // Submissions
    async getAllSubmissions(status?: string) {
        let query = db.select({
            submission: studioSubmissions,
            floorPlan: studioFloorPlans,
            facade: studioFacades,
        })
            .from(studioSubmissions)
            .leftJoin(studioFloorPlans, eq(studioSubmissions.floorPlanId, studioFloorPlans.id))
            .leftJoin(studioFacades, eq(studioSubmissions.facadeId, studioFacades.id));

        if (status) {
            query = query.where(eq(studioSubmissions.status, status)) as any;
        }

        return query.orderBy(desc(studioSubmissions.createdAt));
    },

    async getSubmissionById(id: string) {
        const result = await db.select({
            submission: studioSubmissions,
            floorPlan: studioFloorPlans,
            facade: studioFacades,
        })
            .from(studioSubmissions)
            .leftJoin(studioFloorPlans, eq(studioSubmissions.floorPlanId, studioFloorPlans.id))
            .leftJoin(studioFacades, eq(studioSubmissions.facadeId, studioFacades.id))
            .where(eq(studioSubmissions.id, id));
        return result[0] || null;
    },

    async createSubmission(data: NewStudioSubmission) {
        return insertReturning<StudioSubmission>(studioSubmissions, data as any);
    },

    async updateSubmission(id: string, data: Partial<NewStudioSubmission>) {
        return updateReturning<StudioSubmission>(studioSubmissions, id, { ...data, updatedAt: new Date() });
    },

    async deleteSubmission(id: string) {
        await db.delete(studioSubmissions).where(eq(studioSubmissions.id, id));
    },
};
