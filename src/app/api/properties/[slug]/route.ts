import { NextResponse } from "next/server";
import { query } from "@/lib/db";

/**
 * Single property by slug, for the public detail page.
 *
 * This mirrors the Express route in server/src/routes/propertyRoutes.ts. Both are
 * needed because the two deployment shapes serve different API layers: the unified
 * Express+Next server answers /api/* from Express, while a Next-standalone deploy
 * only has these route handlers. Without this file the detail page 404s in
 * production even though the list page works.
 *
 * The response shape must stay identical to the Express one — the client reads
 * json.data.property and json.data.images.
 */

const PROPERTY_COLUMNS = `
    id, title, slug, design_id AS designId, estate_id AS estateId, region_id AS regionId,
    description, address, lot_number AS lotNumber, house_price AS housePrice,
    land_price AS landPrice, total_price AS totalPrice, bedrooms, bathrooms, garages,
    square_meters AS squareMeters, land_width AS landWidth, land_depth AS landDepth,
    land_area AS landArea, featured_image AS featuredImage, badge,
    titles_expected AS titlesExpected, is_land_ready AS isLandReady,
    is_active AS isActive, created_at AS createdAt, updated_at AS updatedAt
`;

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ slug: string }> },
) {
    try {
        const { slug } = await params;

        // Accept either the slug or the raw id, so older links and any admin
        // deep-link by id keep resolving.
        const rows = await query<any>(
            `SELECT ${PROPERTY_COLUMNS} FROM properties WHERE slug = ? OR id = ? LIMIT 1`,
            [slug, slug],
        );

        const property = rows[0];
        if (!property) {
            return NextResponse.json(
                { success: false, message: "Property not found" },
                { status: 404 },
            );
        }

        const images = await query<any>(
            `SELECT id, property_id AS propertyId, image_url AS imageUrl,
                    alt_text AS altText, sort_order AS sortOrder
             FROM property_images
             WHERE property_id = ?
             ORDER BY sort_order ASC`,
            [property.id],
        );

        // Related records are optional: a house-and-land package need not belong to
        // an estate or reference a catalogue design.
        const [design] = property.designId
            ? await query<any>("SELECT id, name, slug FROM home_designs WHERE id = ? LIMIT 1", [property.designId])
            : [];
        const [estate] = property.estateId
            ? await query<any>("SELECT id, name, slug FROM estates WHERE id = ? LIMIT 1", [property.estateId])
            : [];
        const [region] = property.regionId
            ? await query<any>("SELECT id, name, state FROM regions WHERE id = ? LIMIT 1", [property.regionId])
            : [];

        return NextResponse.json({
            success: true,
            data: { property, images, design, estate, region },
        });
    } catch (error: any) {
        console.error("Error fetching property:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch property" },
            { status: 500 },
        );
    }
}
