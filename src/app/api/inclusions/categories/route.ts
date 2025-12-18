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
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
