import { NewInteriorScheme, NewGalleryImage } from '../db/schema';
export declare const galleryService: {
    getAllSchemes(activeOnly?: boolean): Promise<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean | null;
        createdAt: Date | null;
        description: string | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        features: string[] | null;
        tagline: string | null;
        heroImage: string | null;
        colorPalette: {
            name: string;
            hex: string;
        }[] | null;
        materials: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
        rooms: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
    }[]>;
    getSchemeById(id: string): Promise<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean | null;
        createdAt: Date | null;
        description: string | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        features: string[] | null;
        tagline: string | null;
        heroImage: string | null;
        colorPalette: {
            name: string;
            hex: string;
        }[] | null;
        materials: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
        rooms: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
    }>;
    getSchemeBySlug(slug: string): Promise<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean | null;
        createdAt: Date | null;
        description: string | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        features: string[] | null;
        tagline: string | null;
        heroImage: string | null;
        colorPalette: {
            name: string;
            hex: string;
        }[] | null;
        materials: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
        rooms: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
    }>;
    createScheme(data: NewInteriorScheme): Promise<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean | null;
        createdAt: Date | null;
        description: string | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        features: string[] | null;
        tagline: string | null;
        heroImage: string | null;
        colorPalette: {
            name: string;
            hex: string;
        }[] | null;
        materials: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
        rooms: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
    }>;
    updateScheme(id: string, data: Partial<NewInteriorScheme>): Promise<{
        id: string;
        name: string;
        slug: string;
        tagline: string | null;
        description: string | null;
        heroImage: string | null;
        colorPalette: {
            name: string;
            hex: string;
        }[] | null;
        materials: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
        rooms: {
            name: string;
            imageUrl: string;
            description?: string;
        }[] | null;
        features: string[] | null;
        sortOrder: number | null;
        isActive: boolean | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    deleteScheme(id: string): Promise<void>;
    getAllImages(filters?: {
        category?: string;
        featured?: boolean;
        activeOnly?: boolean;
    }): Promise<{
        id: string;
        isActive: boolean | null;
        createdAt: Date | null;
        category: string | null;
        isFeatured: boolean | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        imageUrl: string;
        altText: string | null;
        title: string | null;
        thumbnailUrl: string | null;
        tags: string[] | null;
        projectName: string | null;
        location: string | null;
    }[]>;
    getImageById(id: string): Promise<{
        id: string;
        isActive: boolean | null;
        createdAt: Date | null;
        category: string | null;
        isFeatured: boolean | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        imageUrl: string;
        altText: string | null;
        title: string | null;
        thumbnailUrl: string | null;
        tags: string[] | null;
        projectName: string | null;
        location: string | null;
    }>;
    createImage(data: NewGalleryImage): Promise<{
        id: string;
        isActive: boolean | null;
        createdAt: Date | null;
        category: string | null;
        isFeatured: boolean | null;
        sortOrder: number | null;
        updatedAt: Date | null;
        imageUrl: string;
        altText: string | null;
        title: string | null;
        thumbnailUrl: string | null;
        tags: string[] | null;
        projectName: string | null;
        location: string | null;
    }>;
    updateImage(id: string, data: Partial<NewGalleryImage>): Promise<{
        id: string;
        title: string | null;
        imageUrl: string;
        thumbnailUrl: string | null;
        category: string | null;
        tags: string[] | null;
        altText: string | null;
        projectName: string | null;
        location: string | null;
        sortOrder: number | null;
        isActive: boolean | null;
        isFeatured: boolean | null;
        createdAt: Date | null;
        updatedAt: Date | null;
    }>;
    deleteImage(id: string): Promise<void>;
    getCategories(): Promise<(string | null)[]>;
};
