import { db } from "../config/database";
import { inclusionTiers, inclusionCategories, inclusionItems } from "../db/schema";
import { eq } from "drizzle-orm";
import slugify from "slugify";
export const inclusionService = {
    // === TIERS ===
    async getAllTiers() {
        return db.select()
            .from(inclusionTiers)
            .where(eq(inclusionTiers.isActive, true))
            .orderBy(inclusionTiers.sortOrder);
    },
    async getTierBySlug(slug) {
        const result = await db.select().from(inclusionTiers).where(eq(inclusionTiers.slug, slug));
        return result[0];
    },
    async createTier(data) {
        const slug = slugify(data.name, { lower: true, strict: true });
        const result = await db.insert(inclusionTiers).values({ ...data, slug }).returning();
        return result[0];
    },
    async updateTier(id, data) {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(inclusionTiers).set(data).where(eq(inclusionTiers.id, id)).returning();
        return result[0];
    },
    async deleteTier(id) {
        const result = await db.update(inclusionTiers).set({ isActive: false }).where(eq(inclusionTiers.id, id));
        return result.length > 0;
    },
    // === CATEGORIES ===
    async getAllCategories() {
        return db.select().from(inclusionCategories).orderBy(inclusionCategories.sortOrder);
    },
    async getCategoryBySlug(slug) {
        const result = await db.select().from(inclusionCategories).where(eq(inclusionCategories.slug, slug));
        return result[0];
    },
    async createCategory(data) {
        const slug = slugify(data.name, { lower: true, strict: true });
        const result = await db.insert(inclusionCategories).values({ ...data, slug }).returning();
        return result[0];
    },
    async updateCategory(id, data) {
        if (data.name) {
            data.slug = slugify(data.name, { lower: true, strict: true });
        }
        const result = await db.update(inclusionCategories).set(data).where(eq(inclusionCategories.id, id)).returning();
        return result[0];
    },
    async deleteCategory(id) {
        const result = await db.delete(inclusionCategories).where(eq(inclusionCategories.id, id));
        return result.length > 0;
    },
    // === ITEMS ===
    async getItemsByTier(tierId) {
        return db.select()
            .from(inclusionItems)
            .where(eq(inclusionItems.tierId, tierId))
            .orderBy(inclusionItems.sortOrder);
    },
    async getItemsByCategory(categoryId) {
        return db.select()
            .from(inclusionItems)
            .where(eq(inclusionItems.categoryId, categoryId))
            .orderBy(inclusionItems.sortOrder);
    },
    async createItem(data) {
        const result = await db.insert(inclusionItems).values(data).returning();
        return result[0];
    },
    async updateItem(id, data) {
        const result = await db.update(inclusionItems).set(data).where(eq(inclusionItems.id, id)).returning();
        return result[0];
    },
    async deleteItem(id) {
        const result = await db.delete(inclusionItems).where(eq(inclusionItems.id, id));
        return result.length > 0;
    },
    // Get full inclusion data for a tier (with categories and items)
    async getFullTierData(tierSlug) {
        const tier = await this.getTierBySlug(tierSlug);
        if (!tier)
            return null;
        const categories = await this.getAllCategories();
        const items = await this.getItemsByTier(tier.id);
        const categoriesWithItems = categories.map(cat => ({
            ...cat,
            items: items.filter(item => item.categoryId === cat.id),
        }));
        return { tier, categories: categoriesWithItems };
    },
};
