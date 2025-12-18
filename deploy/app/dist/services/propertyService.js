import { db } from "../config/database";
import { properties, propertyImages, homeDesigns, estates, regions } from "../db/schema";
import { eq, and, desc, ilike, gte, lte, or } from "drizzle-orm";
import slugify from "slugify";
export const propertyService = {
    // Get all properties with filters
    async getAll(filters = {}) {
        const conditions = [eq(properties.isActive, true)];
        if (filters.regionId) {
            conditions.push(eq(properties.regionId, filters.regionId));
        }
        if (filters.estateId) {
            conditions.push(eq(properties.estateId, filters.estateId));
        }
        if (filters.minPrice) {
            conditions.push(gte(properties.totalPrice, filters.minPrice));
        }
        if (filters.maxPrice) {
            conditions.push(lte(properties.totalPrice, filters.maxPrice));
        }
        if (filters.bedrooms) {
            conditions.push(eq(properties.bedrooms, filters.bedrooms));
        }
        if (filters.bathrooms) {
            conditions.push(eq(properties.bathrooms, filters.bathrooms));
        }
        if (filters.garages) {
            conditions.push(eq(properties.garages, filters.garages));
        }
        if (filters.isLandReady) {
            conditions.push(eq(properties.isLandReady, true));
        }
        if (filters.badge) {
            conditions.push(eq(properties.badge, filters.badge));
        }
        if (filters.search) {
            conditions.push(or(ilike(properties.title, `%${filters.search}%`), ilike(properties.address, `%${filters.search}%`)));
        }
        const limit = filters.limit || 20;
        const offset = filters.offset || 0;
        const result = await db.select()
            .from(properties)
            .where(and(...conditions))
            .orderBy(desc(properties.createdAt))
            .limit(limit)
            .offset(offset);
        // Get total count
        const allResults = await db.select({ id: properties.id })
            .from(properties)
            .where(and(...conditions));
        return { properties: result, total: allResults.length };
    },
    // Get property by ID with all relations
    async getById(id) {
        const result = await db.select().from(properties).where(eq(properties.id, id));
        if (!result[0])
            return null;
        const property = result[0];
        const images = await db.select().from(propertyImages)
            .where(eq(propertyImages.propertyId, id))
            .orderBy(propertyImages.sortOrder);
        // Get related entities
        let design, estate, region, consultant;
        if (property.designId) {
            const designResult = await db.select().from(homeDesigns).where(eq(homeDesigns.id, property.designId));
            design = designResult[0];
        }
        if (property.estateId) {
            const estateResult = await db.select().from(estates).where(eq(estates.id, property.estateId));
            estate = estateResult[0];
        }
        if (property.regionId) {
            const regionResult = await db.select().from(regions).where(eq(regions.id, property.regionId));
            region = regionResult[0];
        }
        return { property, images, design, estate, region, consultant };
    },
    // Get property by slug
    async getBySlug(slug) {
        const result = await db.select().from(properties).where(eq(properties.slug, slug));
        if (!result[0])
            return null;
        return this.getById(result[0].id);
    },
    // Create property
    async create(data) {
        const slug = slugify(data.title, { lower: true, strict: true });
        // Auto-calculate total price
        const totalPrice = (data.housePrice || 0) + (data.landPrice || 0);
        const result = await db.insert(properties)
            .values({ ...data, slug, totalPrice: totalPrice || data.totalPrice })
            .returning();
        return result[0];
    },
    // Update property
    async update(id, data) {
        if (data.title) {
            data.slug = slugify(data.title, { lower: true, strict: true });
        }
        // Recalculate total price if house or land price changed
        if (data.housePrice !== undefined || data.landPrice !== undefined) {
            const current = await db.select().from(properties).where(eq(properties.id, id));
            if (current[0]) {
                const housePrice = data.housePrice ?? current[0].housePrice ?? 0;
                const landPrice = data.landPrice ?? current[0].landPrice ?? 0;
                data.totalPrice = housePrice + landPrice;
            }
        }
        const result = await db.update(properties)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(properties.id, id))
            .returning();
        return result[0];
    },
    // Add image to property
    async addImage(propertyId, imageData) {
        const result = await db.insert(propertyImages).values({ ...imageData, propertyId }).returning();
        return result[0];
    },
    // Delete image
    async deleteImage(imageId) {
        const result = await db.delete(propertyImages).where(eq(propertyImages.id, imageId));
        return result.length > 0;
    },
    // Delete property (soft delete)
    async delete(id) {
        const result = await db.update(properties).set({ isActive: false }).where(eq(properties.id, id));
        return result.length > 0;
    },
};
