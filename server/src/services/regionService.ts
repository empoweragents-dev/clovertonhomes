import { db } from "../config/database";
import { regions, Region, NewRegion } from "../db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";

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
        const result = await db.insert(regions).values({ ...data, slug }).returning();
        return result[0];
    },

    // Update region
    async update(id: string, data: Partial<NewRegion>): Promise<Region | undefined> {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(regions).set(data).where(eq(regions.id, id)).returning();
        return result[0];
    },

    // Delete region (soft delete)
    async delete(id: string): Promise<boolean> {
        const result = await db.update(regions).set({ isActive: false }).where(eq(regions.id, id)).returning();
        return result.length > 0;
    },
};
