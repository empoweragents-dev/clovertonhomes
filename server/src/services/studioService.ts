import { db } from '../config/database';
import { studioFloorPlans, studioFacades, studioSubmissions, NewStudioFloorPlan, NewStudioFacade, NewStudioSubmission } from '../db/schema';
import { eq, desc, asc, and } from 'drizzle-orm';

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
        const result = await db.insert(studioFloorPlans).values(data).returning();
        return result[0];
    },

    async updateFloorPlan(id: string, data: Partial<NewStudioFloorPlan>) {
        const result = await db.update(studioFloorPlans)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(studioFloorPlans.id, id))
            .returning();
        return result[0];
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
        const result = await db.insert(studioFacades).values(data).returning();
        return result[0];
    },

    async updateFacade(id: string, data: Partial<NewStudioFacade>) {
        const result = await db.update(studioFacades)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(studioFacades.id, id))
            .returning();
        return result[0];
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
        const result = await db.insert(studioSubmissions).values(data).returning();
        return result[0];
    },

    async updateSubmission(id: string, data: Partial<NewStudioSubmission>) {
        const result = await db.update(studioSubmissions)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(studioSubmissions.id, id))
            .returning();
        return result[0];
    },

    async deleteSubmission(id: string) {
        await db.delete(studioSubmissions).where(eq(studioSubmissions.id, id));
    },
};
