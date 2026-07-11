import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const categories = await query(
            `SELECT id, name, slug, headline, description, icon, image_url AS imageUrl, sort_order AS sortOrder
             FROM inclusion_categories
             ORDER BY sort_order`
        );
        return NextResponse.json({ success: true, data: categories });
    } catch (error: any) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch categories" },
            { status: 500 }
        );
    }
}
