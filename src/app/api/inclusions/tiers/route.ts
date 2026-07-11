import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
    try {
        const tiers = await query(
            `SELECT id, name, slug, description, sort_order AS sortOrder, is_active AS isActive
             FROM inclusion_tiers
             WHERE is_active = 1
             ORDER BY sort_order`
        );
        return NextResponse.json({ success: true, data: tiers });
    } catch (error: any) {
        console.error("Error fetching tiers:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch tiers" },
            { status: 500 }
        );
    }
}
