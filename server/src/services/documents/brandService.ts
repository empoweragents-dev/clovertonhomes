import { db } from "../../config/database.js";
import { documentBrandSettings, DocumentBrandSettings } from "../../db/schema/index.js";
import { eq } from "drizzle-orm";

/**
 * Builder identity and document appearance — a single logical row.
 *
 * Everything the PDF prints about Cloverton comes from here rather than from code,
 * and each issued revision snapshots these values so old documents keep the branding
 * they were issued with.
 */

// Only these may be written through the API; ids and timestamps are never client-set.
const EDITABLE_FIELDS = [
    "legalName", "tradingName", "abn", "acn", "builderLicence",
    "addressLine1", "addressLine2", "suburb", "state", "postcode", "poBox",
    "phone", "email", "website",
    "logoStorageKey", "logoLightStorageKey",
    "primaryColor", "secondaryColor", "accentColor",
    "footerText", "watermarkEnabled", "watermarkText",
    "ownerInitialLabel", "builderInitialLabel",
    "defaultValidityDays", "gstRateBp", "defaultGstMode",
] as const;

export const brandService = {
    /**
     * Returns the settings row, creating a blank one on first call. Seeded blank on
     * purpose — nothing about the builder is hard-coded, staff fill it in the UI.
     */
    async getOrCreate(): Promise<DocumentBrandSettings> {
        const existing = await db.select().from(documentBrandSettings).limit(1);
        if (existing[0]) return existing[0];

        await db.insert(documentBrandSettings).values({});
        const [created] = await db.select().from(documentBrandSettings).limit(1);
        return created;
    },

    async update(data: Record<string, unknown>, userId?: string): Promise<DocumentBrandSettings> {
        const current = await this.getOrCreate();

        const patch: Record<string, unknown> = {};
        for (const field of EDITABLE_FIELDS) {
            if (field in data) patch[field] = data[field];
        }

        // Integers arrive from form inputs as strings.
        for (const numeric of ["defaultValidityDays", "gstRateBp"] as const) {
            if (numeric in patch) {
                const parsed = parseInt(String(patch[numeric]), 10);
                if (Number.isNaN(parsed)) delete patch[numeric];
                else patch[numeric] = parsed;
            }
        }

        if (Object.keys(patch).length === 0) return current;

        patch.updatedByUserId = userId ?? null;
        patch.updatedAt = new Date();

        await db.update(documentBrandSettings)
            .set(patch)
            .where(eq(documentBrandSettings.id, current.id));

        const [updated] = await db.select().from(documentBrandSettings)
            .where(eq(documentBrandSettings.id, current.id));
        return updated;
    },

    /** Fields that must be present before a tender can be issued — they print on every page. */
    missingRequiredFields(brand: DocumentBrandSettings): string[] {
        const required: [keyof DocumentBrandSettings, string][] = [
            ["legalName", "Builder legal name"],
            ["abn", "ABN"],
            ["builderLicence", "Builder licence number"],
            ["phone", "Phone"],
            ["email", "Email"],
        ];
        return required.filter(([key]) => !String(brand[key] ?? "").trim()).map(([, label]) => label);
    },
};
