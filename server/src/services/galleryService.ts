import { db } from '../config/database.js';
import { interiorSchemes, galleryImages, InteriorScheme, NewInteriorScheme, GalleryImage, NewGalleryImage } from '../db/schema/index.js';
import { eq, desc, asc, and } from 'drizzle-orm';
import { insertReturning, updateReturning } from '../db/helpers.js';

export const galleryService = {
    // Interior Schemes
    async getAllSchemes(activeOnly = true) {
        const conditions = activeOnly ? eq(interiorSchemes.isActive, true) : undefined;
        return db.select().from(interiorSchemes)
            .where(conditions)
            .orderBy(asc(interiorSchemes.sortOrder), asc(interiorSchemes.name));
    },

    async getSchemeById(id: string) {
        const result = await db.select().from(interiorSchemes).where(eq(interiorSchemes.id, id));
        return result[0] || null;
    },

    async getSchemeBySlug(slug: string) {
        const result = await db.select().from(interiorSchemes).where(eq(interiorSchemes.slug, slug));
        return result[0] || null;
    },

    async createScheme(data: NewInteriorScheme) {
        return insertReturning<InteriorScheme>(interiorSchemes, data as any);
    },

    async updateScheme(id: string, data: Partial<NewInteriorScheme>) {
        return updateReturning<InteriorScheme>(interiorSchemes, id, { ...data, updatedAt: new Date() });
    },

    async deleteScheme(id: string) {
        await db.delete(interiorSchemes).where(eq(interiorSchemes.id, id));
    },

    // Gallery Images
    async getAllImages(filters?: { category?: string; featured?: boolean; activeOnly?: boolean }) {
        const { category, featured, activeOnly = true } = filters || {};

        let conditions: any[] = [];

        if (activeOnly) {
            conditions.push(eq(galleryImages.isActive, true));
        }
        if (category) {
            conditions.push(eq(galleryImages.category, category));
        }
        if (featured !== undefined) {
            conditions.push(eq(galleryImages.isFeatured, featured));
        }

        let query = db.select().from(galleryImages);

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        return query.orderBy(asc(galleryImages.sortOrder), desc(galleryImages.createdAt));
    },

    async getImageById(id: string) {
        const result = await db.select().from(galleryImages).where(eq(galleryImages.id, id));
        return result[0] || null;
    },

    async createImage(data: NewGalleryImage) {
        return insertReturning<GalleryImage>(galleryImages, data as any);
    },

    async updateImage(id: string, data: Partial<NewGalleryImage>) {
        return updateReturning<GalleryImage>(galleryImages, id, { ...data, updatedAt: new Date() });
    },

    async deleteImage(id: string) {
        await db.delete(galleryImages).where(eq(galleryImages.id, id));
    },

    async getCategories() {
        const result = await db.selectDistinct({ category: galleryImages.category })
            .from(galleryImages)
            .where(eq(galleryImages.isActive, true));
        return result.map((r: { category: string | null }) => r.category).filter(Boolean);
    },
};
