import { Property, NewProperty, PropertyImage, NewPropertyImage } from "../db/schema";
export interface PropertyFilters {
    regionId?: string;
    estateId?: string;
    minPrice?: number;
    maxPrice?: number;
    bedrooms?: number;
    bathrooms?: number;
    garages?: number;
    isLandReady?: boolean;
    badge?: string;
    search?: string;
    limit?: number;
    offset?: number;
}
export declare const propertyService: {
    getAll(filters?: PropertyFilters): Promise<{
        properties: Property[];
        total: number;
    }>;
    getById(id: string): Promise<{
        property: Property;
        images: PropertyImage[];
        design?: any;
        estate?: any;
        region?: any;
        consultant?: any;
    } | null>;
    getBySlug(slug: string): Promise<any>;
    create(data: Omit<NewProperty, "id" | "slug" | "createdAt" | "updatedAt">): Promise<Property>;
    update(id: string, data: Partial<NewProperty>): Promise<Property | undefined>;
    addImage(propertyId: string, imageData: Omit<NewPropertyImage, "id" | "propertyId">): Promise<PropertyImage>;
    deleteImage(imageId: string): Promise<boolean>;
    delete(id: string): Promise<boolean>;
};
