import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq, and, desc, ilike, gte, lte, or } from "drizzle-orm";
import { pgTable, uuid, varchar, text, boolean, timestamp, integer, decimal, date, pgEnum } from "drizzle-orm/pg-core";

// Define enum inline
const propertyBadgeEnum = pgEnum("property_badge", ["new", "fixed", "sold", "under_offer"]);

// Define schema inline for Next.js API route
const properties = pgTable("properties", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull().unique(),
    designId: uuid("design_id"),
    estateId: uuid("estate_id"),
    regionId: uuid("region_id").notNull(),
    description: text("description"),
    address: text("address"),
    lotNumber: varchar("lot_number", { length: 20 }),
    housePrice: integer("house_price"),
    landPrice: integer("land_price"),
    totalPrice: integer("total_price"),
    bedrooms: integer("bedrooms").notNull(),
    bathrooms: integer("bathrooms").notNull(),
    garages: integer("garages").notNull(),
    squareMeters: integer("square_meters"),
    landWidth: decimal("land_width", { precision: 5, scale: 2 }),
    landDepth: decimal("land_depth", { precision: 5, scale: 2 }),
    landArea: integer("land_area"),
    featuredImage: text("featured_image"),
    badge: propertyBadgeEnum("badge"),
    titlesExpected: date("titles_expected"),
    isLandReady: boolean("is_land_ready").default(false),
    latitude: decimal("latitude", { precision: 10, scale: 8 }),
    longitude: decimal("longitude", { precision: 11, scale: 8 }),
    isActive: boolean("is_active").default(true).notNull(),
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
        const regionId = searchParams.get("regionId");
        const estateId = searchParams.get("estateId");
        const minPrice = searchParams.get("minPrice");
        const maxPrice = searchParams.get("maxPrice");
        const bedrooms = searchParams.get("bedrooms");
        const bathrooms = searchParams.get("bathrooms");
        const garages = searchParams.get("garages");
        const isLandReady = searchParams.get("isLandReady");
        const badge = searchParams.get("badge");
        const search = searchParams.get("search");
        const limit = parseInt(searchParams.get("limit") || "20");
        const offset = parseInt(searchParams.get("offset") || "0");

        const db = getDb();

        // Build conditions
        const conditions: any[] = [eq(properties.isActive, true)];

        if (regionId) {
            conditions.push(eq(properties.regionId, regionId));
        }
        if (estateId) {
            conditions.push(eq(properties.estateId, estateId));
        }
        if (minPrice) {
            conditions.push(gte(properties.totalPrice, parseInt(minPrice)));
        }
        if (maxPrice) {
            conditions.push(lte(properties.totalPrice, parseInt(maxPrice)));
        }
        if (bedrooms) {
            conditions.push(eq(properties.bedrooms, parseInt(bedrooms)));
        }
        if (bathrooms) {
            conditions.push(eq(properties.bathrooms, parseInt(bathrooms)));
        }
        if (garages) {
            conditions.push(eq(properties.garages, parseInt(garages)));
        }
        if (isLandReady === "true") {
            conditions.push(eq(properties.isLandReady, true));
        }
        if (badge) {
            conditions.push(eq(properties.badge, badge as any));
        }
        if (search) {
            conditions.push(
                or(
                    ilike(properties.title, `%${search}%`),
                    ilike(properties.address, `%${search}%`)
                )!
            );
        }

        const result = await db.select()
            .from(properties)
            .where(and(...conditions))
            .orderBy(desc(properties.createdAt))
            .limit(limit)
            .offset(offset);

        // Get total count
        const allResults = await db.select({ id: properties.id })
            .from(properties)
            .where(and(...conditions));

        return NextResponse.json({
            success: true,
            data: result,
            total: allResults.length
        });
    } catch (error: any) {
        console.error("Error fetching properties:", error);

        // Return demo data when database is unavailable for development
        if (error.message === "DATABASE_URL is not set") {
            const { searchParams } = new URL(request.url);
            const bedrooms = searchParams.get("bedrooms");
            const bathrooms = searchParams.get("bathrooms");
            const garages = searchParams.get("garages");
            const minPrice = searchParams.get("minPrice");
            const maxPrice = searchParams.get("maxPrice");
            const isLandReady = searchParams.get("isLandReady");
            const badge = searchParams.get("badge");
            const search = searchParams.get("search");

            let DEMO_PROPERTIES: any[] = [
                {
                    id: "demo-prop-1",
                    title: "The Hamptons 32",
                    slug: "the-hamptons-32",
                    description: "A stunning 4-bedroom family home with modern coastal design",
                    address: "Lot 142, Oceanview Estate, Gold Coast QLD",
                    lotNumber: "142",
                    housePrice: 45000000,
                    landPrice: 35000000,
                    totalPrice: 80000000,
                    bedrooms: 4,
                    bathrooms: 2,
                    garages: 2,
                    squareMeters: 285,
                    landArea: 450,
                    featuredImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800",
                    badge: "new",
                    isLandReady: true,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: "demo-prop-2",
                    title: "The Monarch 28",
                    slug: "the-monarch-28",
                    description: "Contemporary single-storey design perfect for first home buyers",
                    address: "Lot 89, Sunrise Heights, Brisbane QLD",
                    lotNumber: "89",
                    housePrice: 38000000,
                    landPrice: 28000000,
                    totalPrice: 66000000,
                    bedrooms: 3,
                    bathrooms: 2,
                    garages: 2,
                    squareMeters: 220,
                    landArea: 375,
                    featuredImage: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800",
                    badge: "fixed",
                    isLandReady: false,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
                {
                    id: "demo-prop-3",
                    title: "The Grandview 38",
                    slug: "the-grandview-38",
                    description: "Luxurious double-storey home with premium inclusions",
                    address: "Lot 201, Hilltop Estate, Sunshine Coast QLD",
                    lotNumber: "201",
                    housePrice: 62000000,
                    landPrice: 48000000,
                    totalPrice: 110000000,
                    bedrooms: 5,
                    bathrooms: 3,
                    garages: 2,
                    squareMeters: 380,
                    landArea: 600,
                    featuredImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800",
                    badge: null,
                    isLandReady: true,
                    isActive: true,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                },
            ];

            // Apply filters to demo data
            if (bedrooms) {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.bedrooms === parseInt(bedrooms));
            }
            if (bathrooms) {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.bathrooms === parseInt(bathrooms));
            }
            if (garages) {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.garages === parseInt(garages));
            }
            if (minPrice) {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.totalPrice >= parseInt(minPrice));
            }
            if (maxPrice) {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.totalPrice <= parseInt(maxPrice));
            }
            if (isLandReady === "true") {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.isLandReady === true);
            }
            if (badge) {
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p => p.badge === badge);
            }
            if (search) {
                const searchLower = search.toLowerCase();
                DEMO_PROPERTIES = DEMO_PROPERTIES.filter(p =>
                    p.title.toLowerCase().includes(searchLower) ||
                    p.address.toLowerCase().includes(searchLower)
                );
            }

            console.log("📦 Returning demo property data (DATABASE_URL not configured)");
            return NextResponse.json({
                success: true,
                data: DEMO_PROPERTIES,
                total: DEMO_PROPERTIES.length,
                demo: true,
                warning: "Using demo data - configure DATABASE_URL for real data"
            });
        }

        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch properties" },
            { status: 500 }
        );
    }
}
