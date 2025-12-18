import { HomeDesign, NewHomeDesign, DesignImage, NewDesignImage } from "../db/schema";
export interface DesignFilters {
    category?: string;
    storeys?: string;
    minBedrooms?: number;
    maxBedrooms?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
}
export declare const designService: {
    getAll(filters?: DesignFilters): Promise<{
        designs: HomeDesign[];
        total: number;
    }>;
    getFeatured(limit?: number): Promise<HomeDesign[]>;
    getById(id: string): Promise<{
        design: HomeDesign;
        images: DesignImage[];
        floorplans: any[];
    } | null>;
    getBySlug(slug: string): Promise<{
        design: HomeDesign;
        images: DesignImage[];
        floorplans: any[];
    } | null>;
    create(data: Omit<NewHomeDesign, "id" | "slug" | "createdAt" | "updatedAt">): Promise<HomeDesign>;
    update(id: string, data: Partial<NewHomeDesign>): Promise<HomeDesign | undefined>;
    addImage(designId: string, imageData: Omit<NewDesignImage, "id" | "designId">): Promise<DesignImage>;
    deleteImage(imageId: string): Promise<boolean>;
    delete(id: string): Promise<boolean>;
};
