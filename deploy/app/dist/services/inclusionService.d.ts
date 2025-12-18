import { InclusionTier, NewInclusionTier, InclusionCategory, NewInclusionCategory, InclusionItem, NewInclusionItem } from "../db/schema";
export declare const inclusionService: {
    getAllTiers(): Promise<InclusionTier[]>;
    getTierBySlug(slug: string): Promise<InclusionTier | undefined>;
    createTier(data: Omit<NewInclusionTier, "id" | "slug">): Promise<InclusionTier>;
    updateTier(id: string, data: Partial<NewInclusionTier>): Promise<InclusionTier | undefined>;
    deleteTier(id: string): Promise<boolean>;
    getAllCategories(): Promise<InclusionCategory[]>;
    getCategoryBySlug(slug: string): Promise<InclusionCategory | undefined>;
    createCategory(data: Omit<NewInclusionCategory, "id" | "slug">): Promise<InclusionCategory>;
    updateCategory(id: string, data: Partial<NewInclusionCategory>): Promise<InclusionCategory | undefined>;
    deleteCategory(id: string): Promise<boolean>;
    getItemsByTier(tierId: string): Promise<InclusionItem[]>;
    getItemsByCategory(categoryId: string): Promise<InclusionItem[]>;
    createItem(data: Omit<NewInclusionItem, "id">): Promise<InclusionItem>;
    updateItem(id: string, data: Partial<NewInclusionItem>): Promise<InclusionItem | undefined>;
    deleteItem(id: string): Promise<boolean>;
    getFullTierData(tierSlug: string): Promise<{
        tier: InclusionTier;
        categories: (InclusionCategory & {
            items: InclusionItem[];
        })[];
    } | null>;
};
