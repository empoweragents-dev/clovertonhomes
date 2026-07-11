import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

// MariaDB reports JSON as LONGTEXT, so mysql2 may hand it back as a string.
function parseFeatures(v: any): string[] {
    if (Array.isArray(v)) return v;
    if (typeof v === "string") {
        try { return JSON.parse(v); } catch { return []; }
    }
    return [];
}

export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const tierRows = await query(
            `SELECT id, name, slug, description, sort_order AS sortOrder, is_active AS isActive
             FROM inclusion_tiers WHERE slug = ? LIMIT 1`,
            [slug]
        );
        const tier = tierRows[0];
        if (!tier) {
            return NextResponse.json({ success: false, message: "Tier not found" }, { status: 404 });
        }

        const categories = await query(
            `SELECT id, name, slug, headline, description, icon, image_url AS imageUrl, sort_order AS sortOrder
             FROM inclusion_categories ORDER BY sort_order`
        );

        const items = await query(
            `SELECT id, tier_id AS tierId, category_id AS categoryId, title, description,
                    image_url AS imageUrl, badge, features, sort_order AS sortOrder
             FROM inclusion_items WHERE tier_id = ? ORDER BY sort_order`,
            [tier.id]
        );

        const categoriesWithItems = categories.map((cat: any) => ({
            ...cat,
            items: items
                .filter((item: any) => item.categoryId === cat.id)
                .map((item: any) => ({ ...item, features: parseFeatures(item.features) })),
        }));

        return NextResponse.json({
            success: true,
            data: { tier, categories: categoriesWithItems },
        });
    } catch (error: any) {
        console.error("Error fetching tier data:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch tier data" },
            { status: 500 }
        );
    }
}
