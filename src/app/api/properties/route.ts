import { NextResponse } from "next/server";
import { listProperties, type PropertyFilters } from "@/lib/properties";

const FILTER_KEYS = [
    "regionId", "estateId", "minPrice", "maxPrice", "bedrooms", "bathrooms",
    "garages", "isLandReady", "badge", "search", "limit", "offset",
] as const;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filters: PropertyFilters = {};
        for (const key of FILTER_KEYS) {
            const value = searchParams.get(key);
            if (value !== null) filters[key] = value;
        }

        const { data, total } = await listProperties(filters);
        return NextResponse.json({ success: true, data, total });
    } catch (error: any) {
        console.error("Error fetching properties:", error);
        return NextResponse.json(
            { success: false, message: error?.message || "Failed to fetch properties" },
            { status: 500 }
        );
    }
}
