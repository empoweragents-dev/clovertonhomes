import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { pgTable, uuid, varchar, text, integer } from "drizzle-orm/pg-core";

// Define schema inline for Next.js API route
const inclusionCategories = pgTable("inclusion_categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    headline: varchar("headline", { length: 200 }),
    description: text("description"),
    icon: varchar("icon", { length: 50 }),
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

export async function GET() {
    try {
        const db = getDb();
        const categories = await db.select()
            .from(inclusionCategories)
            .orderBy(inclusionCategories.sortOrder);

        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        console.error("Error fetching categories:", error);

        // Return demo data when database is unavailable for development
        if (error.message === "DATABASE_URL is not set") {
            const DEMO_CATEGORIES = [
                { id: "demo-cat-1", name: "Kitchen & Appliances", slug: "kitchen", headline: "Culinary Excellence", description: "Premium kitchen finishes and appliances", icon: "countertops", sortOrder: 1 },
                { id: "demo-cat-2", name: "Bathroom & Ensuite", slug: "bathroom", headline: "Spa-Inspired Luxury", description: "High-end bathroom fixtures and fittings", icon: "bathroom", sortOrder: 2 },
                { id: "demo-cat-3", name: "Flooring", slug: "flooring", headline: "Foundation of Style", description: "Quality flooring throughout", icon: "floor", sortOrder: 3 },
                { id: "demo-cat-4", name: "Electrical & Lighting", slug: "electrical", headline: "Bright Ideas", description: "Modern electrical and lighting solutions", icon: "lightbulb", sortOrder: 4 },
                { id: "demo-cat-5", name: "External Finishes", slug: "external", headline: "Curb Appeal", description: "Premium external finishes and facades", icon: "home", sortOrder: 5 },
            ];
            console.log("📦 Returning demo category data (DATABASE_URL not configured)");
            return NextResponse.json({
                success: true,
                data: DEMO_CATEGORIES,
                demo: true,
                warning: "Using demo data - configure DATABASE_URL for real data"
            });
        }

        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

