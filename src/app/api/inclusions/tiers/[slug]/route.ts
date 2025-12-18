import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { pgTable, uuid, varchar, text, boolean, integer } from "drizzle-orm/pg-core";

// Define schemas inline for Next.js API route
const inclusionTiers = pgTable("inclusion_tiers", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    colorHex: varchar("color_hex", { length: 7 }),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
});

const inclusionCategories = pgTable("inclusion_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
    sortOrder: integer("sort_order").default(0),
});

const inclusionItems = pgTable("inclusion_items", {
    id: uuid("id").primaryKey().defaultRandom(),
    tierId: uuid("tier_id").notNull(),
    categoryId: uuid("category_id").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    description: text("description"),
    imageUrl: varchar("image_url", { length: 500 }),
    sortOrder: integer("sort_order").default(0),
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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;
        const db = getDb();

        // Get tier by slug
        const tierResult = await db.select()
            .from(inclusionTiers)
            .where(eq(inclusionTiers.slug, slug));

        const tier = tierResult[0];
        if (!tier) {
            return NextResponse.json(
                { success: false, message: "Tier not found" },
                { status: 404 }
            );
        }

        // Get all categories
        const categories = await db.select()
            .from(inclusionCategories)
            .orderBy(inclusionCategories.sortOrder);

        // Get items for this tier
        const items = await db.select()
            .from(inclusionItems)
            .where(eq(inclusionItems.tierId, tier.id))
            .orderBy(inclusionItems.sortOrder);

        // Map items to categories
        const categoriesWithItems = categories.map(cat => ({
            ...cat,
            items: items.filter(item => item.categoryId === cat.id),
        }));

        return NextResponse.json({
            success: true,
            data: {
                tier,
                categories: categoriesWithItems,
            },
        });
    } catch (error: any) {
        console.error("Error fetching tier data:", error);

        // Return demo data when database is unavailable for development
        if (error.message === "DATABASE_URL is not set") {
            const { slug } = await params;
            const DEMO_TIERS: Record<string, any> = {
                designer: { id: "demo-tier-1", name: "Designer", slug: "designer", description: "Our entry-level inclusion tier", colorHex: "#4A5568" },
                elegance: { id: "demo-tier-2", name: "Elegance", slug: "elegance", description: "Mid-range premium inclusions", colorHex: "#2C5282" },
                signature: { id: "demo-tier-3", name: "Signature", slug: "signature", description: "Our top-tier luxury inclusions", colorHex: "#1A365D" },
            };
            const tier = DEMO_TIERS[slug] || DEMO_TIERS.designer;

            const DEMO_CATEGORIES = [
                {
                    id: "demo-cat-1", name: "Kitchen & Appliances", slug: "kitchen", headline: "Culinary Excellence", icon: "countertops", sortOrder: 1,
                    items: [
                        { id: "demo-item-1", title: "Stone Benchtops", description: "20mm Caesarstone or equivalent engineered stone benchtops", imageUrl: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800", badge: "Popular", features: ["20mm thickness", "Multiple color options", "Stain resistant"] },
                        { id: "demo-item-2", title: "Stainless Steel Appliances", description: "600mm electric oven, gas cooktop, and rangehood", imageUrl: "https://images.unsplash.com/photo-1556909172-8c2f041fca1e?w=800", badge: "", features: ["Energy efficient", "Modern design", "5-year warranty"] },
                    ]
                },
                {
                    id: "demo-cat-2", name: "Bathroom & Ensuite", slug: "bathroom", headline: "Spa-Inspired Luxury", icon: "bathroom", sortOrder: 2,
                    items: [
                        { id: "demo-item-3", title: "Floor to Ceiling Tiles", description: "Porcelain tiles to wet areas", imageUrl: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", badge: "", features: ["Premium porcelain", "Easy to clean", "Water resistant"] },
                        { id: "demo-item-4", title: "Frameless Shower Screen", description: "Semi-frameless pivot or sliding shower screen", imageUrl: "https://images.unsplash.com/photo-1620626011761-996317b8d101?w=800", badge: "Premium", features: ["10mm toughened glass", "Chrome hardware", "Modern elegance"] },
                    ]
                },
                {
                    id: "demo-cat-3", name: "Flooring", slug: "flooring", headline: "Foundation of Style", icon: "floor", sortOrder: 3,
                    items: [
                        { id: "demo-item-5", title: "Hybrid Flooring", description: "Timber-look hybrid flooring to living areas", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800", badge: "", features: ["Water resistant", "Scratch resistant", "Easy installation"] },
                    ]
                },
            ];

            console.log("📦 Returning demo tier detail data (DATABASE_URL not configured)");
            return NextResponse.json({
                success: true,
                data: { tier, categories: DEMO_CATEGORIES },
                demo: true,
                warning: "Using demo data - configure DATABASE_URL for real data"
            });
        }

        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch tier data" },
            { status: 500 }
        );
    }
}
