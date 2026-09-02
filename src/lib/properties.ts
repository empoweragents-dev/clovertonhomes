import { query } from "@/lib/db";

/**
 * Property listing query, shared by the REST route and by server components.
 *
 * Server components must call this directly rather than fetching /api/properties
 * over HTTP. The app serves its own API from the same single Node process, so a
 * server-side self-request competes with the render that issued it and times out
 * (Next reports it as a 504), leaving the page with an empty list. Going straight
 * to the database removes the round-trip, the CDN, and the deadlock.
 */

export interface PropertyFilters {
    regionId?: string;
    estateId?: string;
    minPrice?: string;
    maxPrice?: string;
    bedrooms?: string;
    bathrooms?: string;
    garages?: string;
    isLandReady?: string;
    badge?: string;
    search?: string;
    limit?: string;
    offset?: string;
}

const PROPERTY_COLUMNS = `
    id, title, slug, design_id AS designId, estate_id AS estateId, region_id AS regionId,
    description, address, lot_number AS lotNumber, house_price AS housePrice,
    land_price AS landPrice, total_price AS totalPrice, bedrooms, bathrooms, garages,
    square_meters AS squareMeters, land_width AS landWidth, land_depth AS landDepth,
    land_area AS landArea, featured_image AS featuredImage, badge,
    titles_expected AS titlesExpected, is_land_ready AS isLandReady,
    is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt
`;

export async function listProperties(filters: PropertyFilters = {}): Promise<{ data: any[]; total: number }> {
    const where: string[] = ["is_active = 1"];
    const params: any[] = [];

    if (filters.regionId) { where.push("region_id = ?"); params.push(filters.regionId); }
    if (filters.estateId) { where.push("estate_id = ?"); params.push(filters.estateId); }
    if (filters.minPrice) { where.push("total_price >= ?"); params.push(parseInt(filters.minPrice)); }
    if (filters.maxPrice) { where.push("total_price <= ?"); params.push(parseInt(filters.maxPrice)); }
    if (filters.bedrooms) { where.push("bedrooms = ?"); params.push(parseInt(filters.bedrooms)); }
    if (filters.bathrooms) { where.push("bathrooms = ?"); params.push(parseInt(filters.bathrooms)); }
    if (filters.garages) { where.push("garages = ?"); params.push(parseInt(filters.garages)); }
    if (filters.isLandReady === "true") { where.push("is_land_ready = 1"); }
    if (filters.badge) { where.push("badge = ?"); params.push(filters.badge); }
    if (filters.search) {
        where.push("(title LIKE ? OR address LIKE ?)");
        params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    const whereClause = where.join(" AND ");
    const limit = parseInt(filters.limit || "20");
    const offset = parseInt(filters.offset || "0");

    const data = await query<any>(
        `SELECT ${PROPERTY_COLUMNS}
         FROM properties
         WHERE ${whereClause}
         ORDER BY created_at DESC
         LIMIT ? OFFSET ?`,
        [...params, limit, offset],
    );

    const countRows = await query<{ n: number }>(
        `SELECT COUNT(*) AS n FROM properties WHERE ${whereClause}`,
        params,
    );

    return { data, total: countRows[0]?.n ?? 0 };
}
