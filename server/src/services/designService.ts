import { db } from "../config/database.js";
import { homeDesigns, designImages, designFloorplans, HomeDesign, NewHomeDesign, DesignImage, NewDesignImage } from "../db/schema/index.js";
import { eq, and, desc, like, gte, lte, inArray } from "drizzle-orm";
import slugify from "slugify";
import { insertReturning, updateReturning } from "../db/helpers.js";

export interface DesignFilters {
    category?: string;
    storeys?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
}

export const designService = {
    // Get all designs with filters
    async getAll(filters: DesignFilters = {}): Promise<{ designs: HomeDesign[]; total: number }> {
        const conditions = [eq(homeDesigns.isActive, true)];

        if (filters.category) {
            conditions.push(eq(homeDesigns.category, filters.category as any));
        }
        if (filters.storeys) {
            conditions.push(eq(homeDesigns.storeys, filters.storeys as any));
        }
        if (filters.minBedrooms) {
            conditions.push(gte(homeDesigns.bedrooms, filters.minBedrooms));
        }
        if (filters.maxBedrooms) {
            conditions.push(lte(homeDesigns.bedrooms, filters.maxBedrooms));
        }
        if (filters.minPrice) {
            conditions.push(gte(homeDesigns.priceFrom, filters.minPrice));
        }
        if (filters.maxPrice) {
            conditions.push(lte(homeDesigns.priceFrom, filters.maxPrice));
        }
        if (filters.search) {
            conditions.push(like(homeDesigns.name, `%${filters.search}%`));
        }
        if (filters.featured) {
            conditions.push(eq(homeDesigns.isFeatured, true));
        }

        const limit = filters.limit || 20;
        const offset = filters.offset || 0;

        const designs = await db.select()
            .from(homeDesigns)
            .where(and(...conditions))
            .orderBy(homeDesigns.sortOrder, desc(homeDesigns.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count (simplified - in production use COUNT)
        const allResults = await db.select({ id: homeDesigns.id })
            .from(homeDesigns)
            .where(and(...conditions));

        return { designs, total: allResults.length };
    },

    // Get featured designs for homepage
    async getFeatured(limit = 6): Promise<HomeDesign[]> {
        return db.select()
            .from(homeDesigns)
            .where(and(eq(homeDesigns.isActive, true), eq(homeDesigns.isFeatured, true)))
            .orderBy(homeDesigns.sortOrder)
            .limit(limit);
    },

    // Get design by ID with images and floorplans
    async getById(id: string): Promise<{ design: HomeDesign; images: DesignImage[]; floorplans: any[] } | null> {
        const result = await db.select().from(homeDesigns).where(eq(homeDesigns.id, id));
        if (!result[0]) return null;

        const images = await db.select().from(designImages)
            .where(eq(designImages.designId, id))
            .orderBy(designImages.sortOrder);

        const floorplans = await db.select().from(designFloorplans)
            .where(eq(designFloorplans.designId, id))
            .orderBy(designFloorplans.sortOrder);

        return { design: result[0], images, floorplans };
    },

    // Get design by slug
    async getBySlug(slug: string): Promise<{ design: HomeDesign; images: DesignImage[]; floorplans: any[] } | null> {
        const result = await db.select().from(homeDesigns).where(eq(homeDesigns.slug, slug));
        if (!result[0]) return null;

        const images = await db.select().from(designImages)
            .where(eq(designImages.designId, result[0].id))
            .orderBy(designImages.sortOrder);

        const floorplans = await db.select().from(designFloorplans)
            .where(eq(designFloorplans.designId, result[0].id))
            .orderBy(designFloorplans.sortOrder);

        return { design: result[0], images, floorplans };
    },

    // Create design
    async create(data: Omit<NewHomeDesign, "id" | "slug" | "createdAt" | "updatedAt">): Promise<HomeDesign> {
        const slug = slugify(data.name, { lower: true, strict: true });
        return insertReturning<HomeDesign>(homeDesigns, { ...data, slug });
    },

    // Update design
    async update(id: string, data: Partial<NewHomeDesign>): Promise<HomeDesign | undefined> {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        return updateReturning<HomeDesign>(homeDesigns, id, { ...data, updatedAt: new Date() });
    },

    // Add image to design
    async addImage(designId: string, imageData: Omit<NewDesignImage, "id" | "designId">): Promise<DesignImage> {
        return insertReturning<DesignImage>(designImages, { ...imageData, designId });
    },

    // Delete image
    async deleteImage(imageId: string): Promise<boolean> {
        const result: any = await db.delete(designImages).where(eq(designImages.id, imageId));
        return result[0].affectedRows > 0;
    },

    // Delete design (soft delete)
    async delete(id: string): Promise<boolean> {
        const result: any = await db.update(homeDesigns).set({ isActive: false }).where(eq(homeDesigns.id, id));
        return result[0].affectedRows > 0;
    },
};
