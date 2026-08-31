import { db } from "../../config/database";
import { documentStatuses, DocumentItemStatus, statusTreatmentValues } from "../../db/schema";
import { eq, asc } from "drizzle-orm";
import { insertReturning, updateReturning } from "../../db/helpers";

/**
 * The inclusion-status vocabulary (§9). Extensible: staff can add their own beyond
 * the system set, which is why items store `status_code` as a plain string with no
 * foreign key — deleting a status must never cascade away tender content.
 */

/**
 * System statuses. The first four match the wording actually used in Cloverton's
 * tenders; the rest cover §9's list. `pdfTreatment` drives the badge styling, which
 * combines a word, a border and a fill so it stays readable in black and white.
 */
export const SYSTEM_STATUSES: {
    code: string; label: string; shortLabel: string;
    pdfTreatment: (typeof statusTreatmentValues)[number]; sortOrder: number;
}[] = [
    { code: "included", label: "Included", shortLabel: "INCLUDED", pdfTreatment: "included", sortOrder: 10 },
    { code: "excluded", label: "Excluded", shortLabel: "EXCLUDED", pdfTreatment: "excluded", sortOrder: 20 },
    { code: "part_included", label: "Partly Included", shortLabel: "PART INCL.", pdfTreatment: "partial", sortOrder: 30 },
    { code: "as_per_engineering", label: "As Per Engineering Plan", shortLabel: "PER ENG.", pdfTreatment: "neutral", sortOrder: 40 },
    { code: "as_per_plan", label: "As Per Plan", shortLabel: "PER PLAN", pdfTreatment: "neutral", sortOrder: 50 },
    { code: "optional", label: "Optional", shortLabel: "OPTIONAL", pdfTreatment: "money", sortOrder: 60 },
    { code: "allowance", label: "Allowance", shortLabel: "ALLOWANCE", pdfTreatment: "money", sortOrder: 70 },
    { code: "provisional_sum", label: "Provisional Sum", shortLabel: "PROV. SUM", pdfTreatment: "money", sortOrder: 80 },
    { code: "owner_supplied", label: "Owner Supplied", shortLabel: "OWNER SUP.", pdfTreatment: "neutral", sortOrder: 90 },
    { code: "owner_responsibility", label: "Owner Responsibility", shortLabel: "OWNER RESP.", pdfTreatment: "neutral", sortOrder: 100 },
    { code: "not_applicable", label: "Not Applicable", shortLabel: "N/A", pdfTreatment: "neutral", sortOrder: 110 },
];

export const statusService = {
    async getAll(includeInactive = false): Promise<DocumentItemStatus[]> {
        const rows = await db.select().from(documentStatuses).orderBy(asc(documentStatuses.sortOrder));
        return includeInactive ? rows : rows.filter((r) => r.isActive);
    },

    async getByCode(code: string): Promise<DocumentItemStatus | undefined> {
        const [row] = await db.select().from(documentStatuses).where(eq(documentStatuses.code, code));
        return row;
    },

    async create(data: Partial<DocumentItemStatus>): Promise<DocumentItemStatus> {
        return insertReturning<DocumentItemStatus>(documentStatuses, {
            code: data.code,
            label: data.label,
            shortLabel: (data.shortLabel || data.label || "").toUpperCase().slice(0, 16),
            pdfTreatment: data.pdfTreatment ?? "neutral",
            description: data.description,
            isSystem: false,
            sortOrder: data.sortOrder ?? 500,
        });
    },

    async update(id: string, data: Partial<DocumentItemStatus>): Promise<DocumentItemStatus | undefined> {
        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const field of ["label", "shortLabel", "pdfTreatment", "description", "sortOrder", "isActive"] as const) {
            if (field in data) patch[field] = data[field];
        }
        // `code` is deliberately immutable: items reference it by value, so changing it
        // would silently orphan every item already using it.
        return updateReturning<DocumentItemStatus>(documentStatuses, id, patch);
    },

    /** System statuses are deactivated rather than deleted. */
    async remove(id: string): Promise<{ ok: boolean; reason?: string }> {
        const [row] = await db.select().from(documentStatuses).where(eq(documentStatuses.id, id));
        if (!row) return { ok: false, reason: "not_found" };
        if (row.isSystem) return { ok: false, reason: "system" };
        const result: any = await db.delete(documentStatuses).where(eq(documentStatuses.id, id));
        return { ok: result[0].affectedRows > 0 };
    },

    /** Inserts any missing system statuses. Idempotent — safe to re-run. */
    async ensureSystemStatuses(): Promise<{ created: number; existing: number }> {
        const existing = await db.select().from(documentStatuses);
        const byCode = new Set(existing.map((r) => r.code));

        const missing = SYSTEM_STATUSES.filter((s) => !byCode.has(s.code));
        if (missing.length) {
            await db.insert(documentStatuses).values(missing.map((s) => ({ ...s, isSystem: true })));
        }
        return { created: missing.length, existing: existing.length };
    },
};
