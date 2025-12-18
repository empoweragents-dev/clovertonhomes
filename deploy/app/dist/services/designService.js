import { db } from "../config/database";
import { homeDesigns, designImages, designFloorplans } from "../db/schema";
import { eq, and, desc, ilike, gte, lte } from "drizzle-orm";
import slugify from "slugify";
export const designService = {
    // Get all designs with filters
    async getAll(filters = {}) {
        const conditions = [eq(homeDesigns.isActive, true)];
        if (filters.category) {
            conditions.push(eq(homeDesigns.category, filters.category));
        }
        if (filters.storeys) {
            conditions.push(eq(homeDesigns.storeys, filters.storeys));
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
            conditions.push(ilike(homeDesigns.name, `%${filters.search}%`));
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
    async getFeatured(limit = 6) {
        return db.select()
            .from(homeDesigns)
            .where(and(eq(homeDesigns.isActive, true), eq(homeDesigns.isFeatured, true)))
            .orderBy(homeDesigns.sortOrder)
            .limit(limit);
    },
    // Get design by ID with images and floorplans
    async getById(id) {
        const result = await db.select().from(homeDesigns).where(eq(homeDesigns.id, id));
        if (!result[0])
            return null;
        const images = await db.select().from(designImages)
            .where(eq(designImages.designId, id))
            .orderBy(designImages.sortOrder);
        const floorplans = await db.select().from(designFloorplans)
            .where(eq(designFloorplans.designId, id))
            .orderBy(designFloorplans.sortOrder);
        return { design: result[0], images, floorplans };
    },
    // Get design by slug
    async getBySlug(slug) {
        const result = await db.select().from(homeDesigns).where(eq(homeDesigns.slug, slug));
        if (!result[0])
            return null;
        const images = await db.select().from(designImages)
            .where(eq(designImages.designId, result[0].id))
            .orderBy(designImages.sortOrder);
        const floorplans = await db.select().from(designFloorplans)
            .where(eq(designFloorplans.designId, result[0].id))
            .orderBy(designFloorplans.sortOrder);
        return { design: result[0], images, floorplans };
    },
    // Create design
    async create(data) {
        const slug = slugify(data.name, { lower: true, strict: true });
        const result = await db.insert(homeDesigns).values({ ...data, slug }).returning();
        return result[0];
    },
    // Update design
    async update(id, data) {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(homeDesigns)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(homeDesigns.id, id))
            .returning();
        return result[0];
    },
    // Add image to design
    async addImage(designId, imageData) {
        const result = await db.insert(designImages).values({ ...imageData, designId }).returning();
        return result[0];
    },
    // Delete image
    async deleteImage(imageId) {
        const result = await db.delete(designImages).where(eq(designImages.id, imageId));
        return result.length > 0;
    },
    // Delete design (soft delete)
    async delete(id) {
        const result = await db.update(homeDesigns).set({ isActive: false }).where(eq(homeDesigns.id, id));
        return result.length > 0;
    },
};
