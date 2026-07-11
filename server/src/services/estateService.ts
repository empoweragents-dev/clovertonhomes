import { db } from "../config/database";
import { estates, Estate, NewEstate, regions } from "../db/schema";
import { eq, and } from "drizzle-orm";
import slugify from "slugify";
import { insertReturning, updateReturning } from "../db/helpers";

export const estateService = {
    // Get all estates with region
    async getAll(): Promise<Estate[]> {
        return db.select().from(estates).where(eq(estates.isActive, true));
    },

    // Get estates by region
    async getByRegion(regionId: string): Promise<Estate[]> {
        return db.select().from(estates)
            .where(and(eq(estates.regionId, regionId), eq(estates.isActive, true)));
    },

    // Get estate by ID
    async getById(id: string): Promise<Estate | undefined> {
        const result = await db.select().from(estates).where(eq(estates.id, id));
        return result[0];
    },

    // Get estate by slug
    async getBySlug(slug: string): Promise<Estate | undefined> {
        const result = await db.select().from(estates).where(eq(estates.slug, slug));
        return result[0];
    },

    // Create estate
    async create(data: Omit<NewEstate, "id" | "slug" | "createdAt">): Promise<Estate> {
        const slug = slugify(data.name, { lower: true, strict: true });
        return insertReturning<Estate>(estates, { ...data, slug });
    },

    // Update estate
    async update(id: string, data: Partial<NewEstate>): Promise<Estate | undefined> {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        return updateReturning<Estate>(estates, id, data);
    },

    // Delete estate (soft delete)
    async delete(id: string): Promise<boolean> {
        const result: any = await db.update(estates).set({ isActive: false }).where(eq(estates.id, id));
        return result[0].affectedRows > 0;
    },
};
