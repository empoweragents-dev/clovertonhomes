import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import { pgTable, uuid, varchar, text, boolean, integer } from "drizzle-orm/pg-core";

// Define schema inline for Next.js API route
const inclusionTiers = pgTable("inclusion_tiers", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    colorHex: varchar("color_hex", { length: 7 }),
    sortOrder: integer("sort_order").default(0),
    isActive: boolean("is_active").default(true),
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
        const tiers = await db.select()
            .from(inclusionTiers)
            .where(eq(inclusionTiers.isActive, true))
            .orderBy(inclusionTiers.sortOrder);

        return NextResponse.json({ success: true, data: tiers });
    } catch (error: any) {
        console.error("Error fetching tiers:", error);

        // Return demo data when database is unavailable for development
        if (error.message === "DATABASE_URL is not set") {
            const DEMO_TIERS = [
                { id: "demo-tier-1", name: "Designer", slug: "designer", description: "Our entry-level inclusion tier with quality finishes", colorHex: "#4A5568", sortOrder: 1, isActive: true },
                { id: "demo-tier-2", name: "Elegance", slug: "elegance", description: "Mid-range premium inclusions for elevated living", colorHex: "#2C5282", sortOrder: 2, isActive: true },
                { id: "demo-tier-3", name: "Signature", slug: "signature", description: "Our top-tier luxury inclusions for discerning buyers", colorHex: "#1A365D", sortOrder: 3, isActive: true },
            ];
            console.log("📦 Returning demo tier data (DATABASE_URL not configured)");
            return NextResponse.json({
                success: true,
                data: DEMO_TIERS,
                demo: true,
                warning: "Using demo data - configure DATABASE_URL for real data"
            });
        }

        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch tiers" },
            { status: 500 }
        );
    }
}

