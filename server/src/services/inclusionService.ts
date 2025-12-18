import { db } from "../config/database";
import {
    inclusionTiers, inclusionCategories, inclusionItems,
    InclusionTier, NewInclusionTier,
    InclusionCategory, NewInclusionCategory,
    InclusionItem, NewInclusionItem
} from "../db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";

export const inclusionService = {
    // === TIERS ===
    async getAllTiers(): Promise<InclusionTier[]> {
        return db.select()
            .from(inclusionTiers)
            .where(eq(inclusionTiers.isActive, true))
            .orderBy(inclusionTiers.sortOrder);
    },

    async getTierBySlug(slug: string): Promise<InclusionTier | undefined> {
        const result = await db.select().from(inclusionTiers).where(eq(inclusionTiers.slug, slug));
        return result[0];
    },

    async createTier(data: Omit<NewInclusionTier, "id" | "slug">): Promise<InclusionTier> {
        const slug = slugify(data.name, { lower: true, strict: true });
        const result = await db.insert(inclusionTiers).values({ ...data, slug }).returning();
        return result[0];
    },

    async updateTier(id: string, data: Partial<NewInclusionTier>): Promise<InclusionTier | undefined> {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(inclusionTiers).set(data).where(eq(inclusionTiers.id, id)).returning();
        return result[0];
    },

    async deleteTier(id: string): Promise<boolean> {
        const result = await db.update(inclusionTiers).set({ isActive: false }).where(eq(inclusionTiers.id, id));
        return result.length > 0;
    },

    // === CATEGORIES ===
    async getAllCategories(): Promise<InclusionCategory[]> {
        return db.select().from(inclusionCategories).orderBy(inclusionCategories.sortOrder);
    },

    async getCategoryBySlug(slug: string): Promise<InclusionCategory | undefined> {
        const result = await db.select().from(inclusionCategories).where(eq(inclusionCategories.slug, slug));
        return result[0];
    },

    async createCategory(data: Omit<NewInclusionCategory, "id" | "slug">): Promise<InclusionCategory> {
        const slug = slugify(data.name, { lower: true, strict: true });
        const result = await db.insert(inclusionCategories).values({ ...data, slug }).returning();
        return result[0];
    },

    async updateCategory(id: string, data: Partial<NewInclusionCategory>): Promise<InclusionCategory | undefined> {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(inclusionCategories).set(data).where(eq(inclusionCategories.id, id)).returning();
        return result[0];
    },

    async deleteCategory(id: string): Promise<boolean> {
        const result = await db.delete(inclusionCategories).where(eq(inclusionCategories.id, id));
        return result.length > 0;
    },

    // === ITEMS ===
    async getItemsByTier(tierId: string): Promise<InclusionItem[]> {
        return db.select()
            .from(inclusionItems)
            .where(eq(inclusionItems.tierId, tierId))
            .orderBy(inclusionItems.sortOrder);
    },

    async getItemsByCategory(categoryId: string): Promise<InclusionItem[]> {
        return db.select()
            .from(inclusionItems)
            .where(eq(inclusionItems.categoryId, categoryId))
            .orderBy(inclusionItems.sortOrder);
    },

    async createItem(data: Omit<NewInclusionItem, "id">): Promise<InclusionItem> {
        const result = await db.insert(inclusionItems).values(data).returning();
        return result[0];
    },

    async updateItem(id: string, data: Partial<NewInclusionItem>): Promise<InclusionItem | undefined> {
        const result = await db.update(inclusionItems).set(data).where(eq(inclusionItems.id, id)).returning();
        return result[0];
    },

    async deleteItem(id: string): Promise<boolean> {
        const result = await db.delete(inclusionItems).where(eq(inclusionItems.id, id));
        return result.length > 0;
    },

    // Get full inclusion data for a tier (with categories and items)
    async getFullTierData(tierSlug: string): Promise<{
        tier: InclusionTier;
        categories: (InclusionCategory & { items: InclusionItem[] })[];
    } | null> {
        const tier = await this.getTierBySlug(tierSlug);
        if (!tier) return null;

        const categories = await this.getAllCategories();
        const items = await this.getItemsByTier(tier.id);

        const categoriesWithItems = categories.map(cat => ({
            ...cat,
            items: items.filter(item => item.categoryId === cat.id),
        }));

        return { tier, categories: categoriesWithItems };
    },
};
