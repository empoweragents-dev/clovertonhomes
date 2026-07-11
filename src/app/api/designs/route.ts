import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
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

        const where: string[] = ["is_active = 1"];
        const params: any[] = [];

        if (category) { where.push("category = ?"); params.push(category); }
        if (storeys) { where.push("storeys = ?"); params.push(storeys); }
        if (minBedrooms) { where.push("bedrooms >= ?"); params.push(parseInt(minBedrooms)); }
        if (maxBedrooms) { where.push("bedrooms <= ?"); params.push(parseInt(maxBedrooms)); }
        if (minPrice) { where.push("price_from >= ?"); params.push(parseInt(minPrice)); }
        if (maxPrice) { where.push("price_from <= ?"); params.push(parseInt(maxPrice)); }
        if (search) { where.push("name LIKE ?"); params.push(`%${search}%`); }
        if (featured === "true") { where.push("is_featured = 1"); }

        const whereClause = where.join(" AND ");

        const designs = await query(
            `SELECT id, name, slug, description, price_from AS priceFrom, bedrooms, bathrooms, garages,
                    storeys, category, square_meters AS squareMeters, land_width AS landWidth,
                    land_depth AS landDepth, featured_image AS featuredImage, badge,
                    is_featured AS isFeatured, is_active AS isActive, sort_order AS sortOrder,
                    created_at AS createdAt, updated_at AS updatedAt
             FROM home_designs
             WHERE ${whereClause}
             ORDER BY sort_order, created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const countRows = await query<{ n: number }>(
            `SELECT COUNT(*) AS n FROM home_designs WHERE ${whereClause}`,
            params
        );

        return NextResponse.json({ success: true, data: designs, total: countRows[0]?.n ?? 0 });
    } catch (error: any) {
        console.error("Error fetching designs:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch designs" },
            { status: 500 }
        );
    }
}
