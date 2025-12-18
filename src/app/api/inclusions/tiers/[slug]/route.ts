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
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch tier data" },
            { status: 500 }
        );
    }
}
