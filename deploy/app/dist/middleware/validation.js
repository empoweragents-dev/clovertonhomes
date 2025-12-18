import { z } from "zod";
// Validation middleware factory
export const validate = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({
                    success: false,
                    message: "Validation error",
                    errors: error.errors.map(e => ({
                        field: e.path.join("."),
                        message: e.message,
                    })),
                });
            }
            next(error);
        }
    };
};
// Common validation schemas
export const schemas = {
    // Pagination
    pagination: z.object({
        query: z.object({
            limit: z.string().optional().transform(v => v ? parseInt(v) : 20),
            offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
        }),
    }),
    // UUID param
    idParam: z.object({
        params: z.object({
            id: z.string().uuid(),
        }),
    }),
    // Slug param
    slugParam: z.object({
        params: z.object({
            slug: z.string().min(1),
        }),
    }),
    // Enquiry creation
    createEnquiry: z.object({
        body: z.object({
            type: z.enum(["general", "property", "design", "custom_build"]).optional(),
            firstName: z.string().min(1, "First name is required"),
            lastName: z.string().optional(),
            email: z.string().email("Valid email is required"),
            phone: z.string().optional(),
            interestType: z.string().optional(),
            homeType: z.string().optional(),
            designPreference: z.string().optional(),
            message: z.string().optional(),
            propertyId: z.string().uuid().optional(),
            designId: z.string().uuid().optional(),
            source: z.string().optional(),
        }),
    }),
    // Design creation/update
    designData: z.object({
        body: z.object({
            name: z.string().min(1).optional(),
            description: z.string().optional(),
            priceFrom: z.number().optional(),
            bedrooms: z.number().int().min(1).optional(),
            bathrooms: z.number().int().min(1).optional(),
            garages: z.number().int().min(0).optional(),
            storeys: z.enum(["single", "double", "split"]).optional(),
            category: z.enum(["popular", "single_storey", "double_storey", "acreage", "dual_occupancy"]).optional(),
            squareMeters: z.number().optional(),
            featuredImage: z.string().optional(),
            badge: z.string().optional(),
            isFeatured: z.boolean().optional(),
        }),
    }),
    // Property creation/update
    propertyData: z.object({
        body: z.object({
            title: z.string().min(1).optional(),
            description: z.string().optional(),
            regionId: z.string().uuid().optional(),
            estateId: z.string().uuid().optional(),
            designId: z.string().uuid().optional(),
            consultantId: z.string().uuid().optional(),
            housePrice: z.number().optional(),
            landPrice: z.number().optional(),
            bedrooms: z.number().int().min(1).optional(),
            bathrooms: z.number().int().min(1).optional(),
            garages: z.number().int().min(0).optional(),
            squareMeters: z.number().optional(),
            address: z.string().optional(),
            lotNumber: z.string().optional(),
            badge: z.enum(["new", "fixed", "sold", "under_offer"]).optional(),
            isLandReady: z.boolean().optional(),
        }),
    }),
};
