import { db } from "../config/database";
import { regions, Region, NewRegion } from "../db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";
import { insertReturning, updateReturning } from "../db/helpers";

export const regionService = {
    // Get all active regions
    async getAll(): Promise<Region[]> {
        return db.select().from(regions).where(eq(regions.isActive, true));
    },

    // Get region by ID
    async getById(id: string): Promise<Region | undefined> {
        const result = await db.select().from(regions).where(eq(regions.id, id));
        return result[0];
    },

    // Get region by slug
    async getBySlug(slug: string): Promise<Region | undefined> {
        const result = await db.select().from(regions).where(eq(regions.slug, slug));
        return result[0];
    },

    // Create region
    async create(data: Omit<NewRegion, "id" | "slug" | "createdAt">): Promise<Region> {
        const slug = slugify(data.name, { lower: true, strict: true });
        return insertReturning<Region>(regions, { ...data, slug });
    },

    // Update region
    async update(id: string, data: Partial<NewRegion>): Promise<Region | undefined> {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        return updateReturning<Region>(regions, id, data);
    },

    // Delete region (soft delete)
    async delete(id: string): Promise<boolean> {
        const result: any = await db.update(regions).set({ isActive: false }).where(eq(regions.id, id));
        return result[0].affectedRows > 0;
    },
};
