import { db } from "../config/database";
import { regions } from "../db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";
export const regionService = {
    // Get all active regions
    async getAll() {
        return db.select().from(regions).where(eq(regions.isActive, true));
    },
    // Get region by ID
    async getById(id) {
        const result = await db.select().from(regions).where(eq(regions.id, id));
        return result[0];
    },
    // Get region by slug
    async getBySlug(slug) {
        const result = await db.select().from(regions).where(eq(regions.slug, slug));
        return result[0];
    },
    // Create region
    async create(data) {
        const slug = slugify(data.name, { lower: true, strict: true });
        const result = await db.insert(regions).values({ ...data, slug }).returning();
        return result[0];
    },
    // Update region
    async update(id, data) {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(regions).set(data).where(eq(regions.id, id)).returning();
        return result[0];
    },
    // Delete region (soft delete)
    async delete(id) {
        const result = await db.update(regions).set({ isActive: false }).where(eq(regions.id, id)).returning();
        return result.length > 0;
    },
};
