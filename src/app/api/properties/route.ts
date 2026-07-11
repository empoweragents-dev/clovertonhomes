import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
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

        const where: string[] = ["is_active = 1"];
        const params: any[] = [];

        if (regionId) { where.push("region_id = ?"); params.push(regionId); }
        if (estateId) { where.push("estate_id = ?"); params.push(estateId); }
        if (minPrice) { where.push("total_price >= ?"); params.push(parseInt(minPrice)); }
        if (maxPrice) { where.push("total_price <= ?"); params.push(parseInt(maxPrice)); }
        if (bedrooms) { where.push("bedrooms = ?"); params.push(parseInt(bedrooms)); }
        if (bathrooms) { where.push("bathrooms = ?"); params.push(parseInt(bathrooms)); }
        if (garages) { where.push("garages = ?"); params.push(parseInt(garages)); }
        if (isLandReady === "true") { where.push("is_land_ready = 1"); }
        if (badge) { where.push("badge = ?"); params.push(badge); }
        if (search) { where.push("(title LIKE ? OR address LIKE ?)"); params.push(`%${search}%`, `%${search}%`); }

        const whereClause = where.join(" AND ");

        const result = await query(
            `SELECT id, title, slug, design_id AS designId, estate_id AS estateId, region_id AS regionId,
                    description, address, lot_number AS lotNumber, house_price AS housePrice,
                    land_price AS landPrice, total_price AS totalPrice, bedrooms, bathrooms, garages,
                    square_meters AS squareMeters, land_width AS landWidth, land_depth AS landDepth,
                    land_area AS landArea, featured_image AS featuredImage, badge,
                    titles_expected AS titlesExpected, is_land_ready AS isLandReady,
                    is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt
             FROM properties
             WHERE ${whereClause}
             ORDER BY created_at DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        const countRows = await query<{ n: number }>(
            `SELECT COUNT(*) AS n FROM properties WHERE ${whereClause}`,
            params
        );

        return NextResponse.json({ success: true, data: result, total: countRows[0]?.n ?? 0 });
    } catch (error: any) {
        console.error("Error fetching properties:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch properties" },
            { status: 500 }
        );
    }
}
