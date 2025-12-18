import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, ilike, gte, lte } from "drizzle-orm";
import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, pgEnum } from "drizzle-orm/pg-core";

// Define enums inline for Next.js API route
const storeysEnum = pgEnum("storeys", ["single", "double", "split"]);
const designCategoryEnum = pgEnum("design_category", ["popular", "single_storey", "double_storey", "acreage", "dual_occupancy"]);

// Define schema inline for Next.js API route
const homeDesigns = pgTable("home_designs", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 150 }).notNull(),
    slug: varchar("slug", { length: 150 }).notNull().unique(),
    description: text("description"),
    priceFrom: integer("price_from"),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    garages: integer("garages").notNull(),
    storeys: storeysEnum("storeys").default("single").notNull(),
    category: designCategoryEnum("category").default("popular").notNull(),
    squareMeters: integer("square_meters"),
    landWidth: decimal("land_width", { precision: 5, scale: 2 }),
    landDepth: decimal("land_depth", { precision: 5, scale: 2 }),
    featuredImage: text("featured_image"),
    badge: varchar("badge", { length: 50 }),
    isFeatured: boolean("is_featured").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    sortOrder: integer("sort_order").default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Get database connection
function getDb() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error("DATABASE_URL is not set");
    }
    const client = postgres(connectionString, { prepare: false });
    return drizzle(client);
}

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Parse query parameters
        const category = searchParams.get("category");
        const storeys = searchParams.get("storeys");
        const minBedrooms = searchParams.get("minBedrooms");
        const maxBedrooms = searchParams.get("maxBedrooms");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const search = searchParams.get("search");
        const featured = searchParams.get("featured");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const db = getDb();

        // Build conditions
        const conditions: any[] = [eq(homeDesigns.isActive, true)];

        if (category) {
            conditions.push(eq(homeDesigns.category, category as any));
        }
        if (storeys) {
            conditions.push(eq(homeDesigns.storeys, storeys as any));
        }
        if (minBedrooms) {
            conditions.push(gte(homeDesigns.bedrooms, parseInt(minBedrooms)));
        }
        if (maxBedrooms) {
            conditions.push(lte(homeDesigns.bedrooms, parseInt(maxBedrooms)));
        }
        if (minPrice) {
            conditions.push(gte(homeDesigns.priceFrom, parseInt(minPrice)));
        }
        if (maxPrice) {
            conditions.push(lte(homeDesigns.priceFrom, parseInt(maxPrice)));
        }
        if (search) {
            conditions.push(ilike(homeDesigns.name, `%${search}%`));
        }
        if (featured === "true") {
            conditions.push(eq(homeDesigns.isFeatured, true));
        }

        const designs = await db.select()
            .from(homeDesigns)
            .where(and(...conditions))
            .orderBy(homeDesigns.sortOrder, desc(homeDesigns.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count
        const allResults = await db.select({ id: homeDesigns.id })
            .from(homeDesigns)
            .where(and(...conditions));

        return NextResponse.json({
            success: true,
            data: designs,
            total: allResults.length
        });
    } catch (error: any) {
        console.error("Error fetching designs:", error);

        // Return demo data when database is unavailable for development
        if (error.message === "DATABASE_URL is not set") {
            const { searchParams } = new URL(request.url);
            const category = searchParams.get("category");
            const storeys = searchParams.get("storeys");
            const minBedrooms = searchParams.get("minBedrooms");
            const maxBedrooms = searchParams.get("maxBedrooms");
            const minPrice = searchParams.get("minPrice");
            const maxPrice = searchParams.get("maxPrice");
            const search = searchParams.get("search");
            const featured = searchParams.get("featured");

            let DEMO_DESIGNS: any[] = [
                {
                    id: "demo-design-1",
                    name: "The Hamptons",
                    slug: "the-hamptons",
                    description: "Coastal elegance meets modern living in this stunning family home",
                    priceFrom: 35000000,
                    bedrooms: 4,
                    bathrooms: 2,
                    garages: 2,
                    storeys: "single",
                    category: "popular",
                    squareMeters: 285,
                    featuredImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                    badge: "Popular",
                    isFeatured: true,
                    isActive: true,
                    sortOrder: 1,
                },
                {
                    id: "demo-design-2",
                    name: "The Monarch",
                    slug: "the-monarch",
                    description: "Contemporary design with open-plan living and premium finishes",
                    priceFrom: 28000000,
                    bedrooms: 3,
                    bathrooms: 2,
                    garages: 2,
                    storeys: "single",
                    category: "single_storey",
                    squareMeters: 220,
                    featuredImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
                    badge: null,
                    isFeatured: true,
                    isActive: true,
                    sortOrder: 2,
                },
                {
                    id: "demo-design-3",
                    name: "The Grandview",
                    slug: "the-grandview",
                    description: "Spacious double-storey design with commanding street presence",
                    priceFrom: 48000000,
                    bedrooms: 5,
                    bathrooms: 3,
                    garages: 2,
                    storeys: "double",
                    category: "double_storey",
                    squareMeters: 380,
                    featuredImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                    badge: "New",
                    isFeatured: true,
                    isActive: true,
                    sortOrder: 3,
                },
                {
                    id: "demo-design-4",
                    name: "The Acacia",
                    slug: "the-acacia",
                    description: "Perfect for acreage blocks with wide frontage and wrap-around verandah",
                    priceFrom: 42000000,
                    bedrooms: 4,
                    bathrooms: 2,
                    garages: 3,
                    storeys: "single",
                    category: "acreage",
                    squareMeters: 310,
                    featuredImage: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800",
                    badge: null,
                    isFeatured: false,
                    isActive: true,
                    sortOrder: 4,
                },
            ];

            // Apply filters to demo data
            if (category) {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.category === category);
            }
            if (storeys) {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.storeys === storeys);
            }
            if (minBedrooms) {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.bedrooms >= parseInt(minBedrooms));
            }
            if (maxBedrooms) {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.bedrooms <= parseInt(maxBedrooms));
            }
            if (minPrice) {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.priceFrom >= parseInt(minPrice));
            }
            if (maxPrice) {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.priceFrom <= parseInt(maxPrice));
            }
            if (search) {
                const searchLower = search.toLowerCase();
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.name.toLowerCase().includes(searchLower));
            }
            if (featured === "true") {
                DEMO_DESIGNS = DEMO_DESIGNS.filter(d => d.isFeatured === true);
            }

            console.log("📦 Returning demo design data (DATABASE_URL not configured)");
            return NextResponse.json({
                success: true,
                data: DEMO_DESIGNS,
                total: DEMO_DESIGNS.length,
                demo: true,
                warning: "Using demo data - configure DATABASE_URL for real data"
            });
        }

        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch designs" },
            { status: 500 }
        );
    }
}
