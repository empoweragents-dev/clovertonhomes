import { z } from "zod";
import { Request, Response, NextFunction } from "express";
export declare const validate: (schema: z.ZodSchema) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const schemas: {
    pagination: z.ZodObject<{
        query: z.ZodObject<{
            limit: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
            offset: z.ZodEffects<z.ZodOptional<z.ZodString>, number, string | undefined>;
        }, "strip", z.ZodTypeAny, {
            limit: number;
            offset: number;
        }, {
            limit?: string | undefined;
            offset?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        query: {
            limit: number;
            offset: number;
        };
    }, {
        query: {
            limit?: string | undefined;
            offset?: string | undefined;
        };
    }>;
    idParam: z.ZodObject<{
        params: z.ZodObject<{
            id: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            id: string;
        }, {
            id: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            id: string;
        };
    }, {
        params: {
            id: string;
        };
    }>;
    slugParam: z.ZodObject<{
        params: z.ZodObject<{
            slug: z.ZodString;
        }, "strip", z.ZodTypeAny, {
            slug: string;
        }, {
            slug: string;
        }>;
    }, "strip", z.ZodTypeAny, {
        params: {
            slug: string;
        };
    }, {
        params: {
            slug: string;
        };
    }>;
    createEnquiry: z.ZodObject<{
        body: z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["general", "property", "design", "custom_build"]>>;
            firstName: z.ZodString;
            lastName: z.ZodOptional<z.ZodString>;
            email: z.ZodString;
            phone: z.ZodOptional<z.ZodString>;
            interestType: z.ZodOptional<z.ZodString>;
            homeType: z.ZodOptional<z.ZodString>;
            designPreference: z.ZodOptional<z.ZodString>;
            message: z.ZodOptional<z.ZodString>;
            propertyId: z.ZodOptional<z.ZodString>;
            designId: z.ZodOptional<z.ZodString>;
            source: z.ZodOptional<z.ZodString>;
        }, "strip", z.ZodTypeAny, {
            email: string;
            firstName: string;
            designId?: string | undefined;
            type?: "design" | "property" | "general" | "custom_build" | undefined;
            phone?: string | undefined;
            propertyId?: string | undefined;
            lastName?: string | undefined;
            interestType?: string | undefined;
            homeType?: string | undefined;
            designPreference?: string | undefined;
            message?: string | undefined;
            source?: string | undefined;
        }, {
            email: string;
            firstName: string;
            designId?: string | undefined;
            type?: "design" | "property" | "general" | "custom_build" | undefined;
            phone?: string | undefined;
            propertyId?: string | undefined;
            lastName?: string | undefined;
            interestType?: string | undefined;
            homeType?: string | undefined;
            designPreference?: string | undefined;
            message?: string | undefined;
            source?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            email: string;
            firstName: string;
            designId?: string | undefined;
            type?: "design" | "property" | "general" | "custom_build" | undefined;
            phone?: string | undefined;
            propertyId?: string | undefined;
            lastName?: string | undefined;
            interestType?: string | undefined;
            homeType?: string | undefined;
            designPreference?: string | undefined;
            message?: string | undefined;
            source?: string | undefined;
        };
    }, {
        body: {
            email: string;
            firstName: string;
            designId?: string | undefined;
            type?: "design" | "property" | "general" | "custom_build" | undefined;
            phone?: string | undefined;
            propertyId?: string | undefined;
            lastName?: string | undefined;
            interestType?: string | undefined;
            homeType?: string | undefined;
            designPreference?: string | undefined;
            message?: string | undefined;
            source?: string | undefined;
        };
    }>;
    designData: z.ZodObject<{
        body: z.ZodObject<{
            name: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            priceFrom: z.ZodOptional<z.ZodNumber>;
            bedrooms: z.ZodOptional<z.ZodNumber>;
            bathrooms: z.ZodOptional<z.ZodNumber>;
            garages: z.ZodOptional<z.ZodNumber>;
            storeys: z.ZodOptional<z.ZodEnum<["single", "double", "split"]>>;
            category: z.ZodOptional<z.ZodEnum<["popular", "single_storey", "double_storey", "acreage", "dual_occupancy"]>>;
            squareMeters: z.ZodOptional<z.ZodNumber>;
            featuredImage: z.ZodOptional<z.ZodString>;
            badge: z.ZodOptional<z.ZodString>;
            isFeatured: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            name?: string | undefined;
            description?: string | undefined;
            storeys?: "split" | "single" | "double" | undefined;
            priceFrom?: number | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            category?: "popular" | "single_storey" | "double_storey" | "acreage" | "dual_occupancy" | undefined;
            squareMeters?: number | undefined;
            featuredImage?: string | undefined;
            badge?: string | undefined;
            isFeatured?: boolean | undefined;
        }, {
            name?: string | undefined;
            description?: string | undefined;
            storeys?: "split" | "single" | "double" | undefined;
            priceFrom?: number | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            category?: "popular" | "single_storey" | "double_storey" | "acreage" | "dual_occupancy" | undefined;
            squareMeters?: number | undefined;
            featuredImage?: string | undefined;
            badge?: string | undefined;
            isFeatured?: boolean | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            name?: string | undefined;
            description?: string | undefined;
            storeys?: "split" | "single" | "double" | undefined;
            priceFrom?: number | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            category?: "popular" | "single_storey" | "double_storey" | "acreage" | "dual_occupancy" | undefined;
            squareMeters?: number | undefined;
            featuredImage?: string | undefined;
            badge?: string | undefined;
            isFeatured?: boolean | undefined;
        };
    }, {
        body: {
            name?: string | undefined;
            description?: string | undefined;
            storeys?: "split" | "single" | "double" | undefined;
            priceFrom?: number | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            category?: "popular" | "single_storey" | "double_storey" | "acreage" | "dual_occupancy" | undefined;
            squareMeters?: number | undefined;
            featuredImage?: string | undefined;
            badge?: string | undefined;
            isFeatured?: boolean | undefined;
        };
    }>;
    propertyData: z.ZodObject<{
        body: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            description: z.ZodOptional<z.ZodString>;
            regionId: z.ZodOptional<z.ZodString>;
            estateId: z.ZodOptional<z.ZodString>;
            designId: z.ZodOptional<z.ZodString>;
            consultantId: z.ZodOptional<z.ZodString>;
            housePrice: z.ZodOptional<z.ZodNumber>;
            landPrice: z.ZodOptional<z.ZodNumber>;
            bedrooms: z.ZodOptional<z.ZodNumber>;
            bathrooms: z.ZodOptional<z.ZodNumber>;
            garages: z.ZodOptional<z.ZodNumber>;
            squareMeters: z.ZodOptional<z.ZodNumber>;
            address: z.ZodOptional<z.ZodString>;
            lotNumber: z.ZodOptional<z.ZodString>;
            badge: z.ZodOptional<z.ZodEnum<["new", "fixed", "sold", "under_offer"]>>;
            isLandReady: z.ZodOptional<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            regionId?: string | undefined;
            description?: string | undefined;
            address?: string | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            squareMeters?: number | undefined;
            badge?: "fixed" | "new" | "sold" | "under_offer" | undefined;
            designId?: string | undefined;
            title?: string | undefined;
            estateId?: string | undefined;
            lotNumber?: string | undefined;
            housePrice?: number | undefined;
            landPrice?: number | undefined;
            isLandReady?: boolean | undefined;
            consultantId?: string | undefined;
        }, {
            regionId?: string | undefined;
            description?: string | undefined;
            address?: string | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            squareMeters?: number | undefined;
            badge?: "fixed" | "new" | "sold" | "under_offer" | undefined;
            designId?: string | undefined;
            title?: string | undefined;
            estateId?: string | undefined;
            lotNumber?: string | undefined;
            housePrice?: number | undefined;
            landPrice?: number | undefined;
            isLandReady?: boolean | undefined;
            consultantId?: string | undefined;
        }>;
    }, "strip", z.ZodTypeAny, {
        body: {
            regionId?: string | undefined;
            description?: string | undefined;
            address?: string | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            squareMeters?: number | undefined;
            badge?: "fixed" | "new" | "sold" | "under_offer" | undefined;
            designId?: string | undefined;
            title?: string | undefined;
            estateId?: string | undefined;
            lotNumber?: string | undefined;
            housePrice?: number | undefined;
            landPrice?: number | undefined;
            isLandReady?: boolean | undefined;
            consultantId?: string | undefined;
        };
    }, {
        body: {
            regionId?: string | undefined;
            description?: string | undefined;
            address?: string | undefined;
            bedrooms?: number | undefined;
            bathrooms?: number | undefined;
            garages?: number | undefined;
            squareMeters?: number | undefined;
            badge?: "fixed" | "new" | "sold" | "under_offer" | undefined;
            designId?: string | undefined;
            title?: string | undefined;
            estateId?: string | undefined;
            lotNumber?: string | undefined;
            housePrice?: number | undefined;
            landPrice?: number | undefined;
            isLandReady?: boolean | undefined;
            consultantId?: string | undefined;
        };
    }>;
};
