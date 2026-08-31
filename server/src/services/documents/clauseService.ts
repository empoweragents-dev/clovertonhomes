import { db } from "../../config/database.js";
import {
    clauseLibrary, clauseLibraryVersions,
    ClauseLibraryEntry, ClauseLibraryVersion,
} from "../../db/schema/index.js";
import { eq, asc, desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import slugify from "slugify";
import { updateReturning } from "../../db/helpers.js";
import { toHtml } from "./markup.js";
import { auditService } from "./auditService.js";

/**
 * Terms & conditions library (§12) with version history (§13).
 *
 * Clause text is NEVER updated in place. Editing appends a new version row and
 * repoints `currentVersionId`, so the exact wording a tender was issued with stays
 * recoverable and a later legal change cannot rewrite history.
 */

export interface ClauseWithVersion extends ClauseLibraryEntry {
    currentVersion?: ClauseLibraryVersion;
    versionCount: number;
}

export const clauseService = {
    async getAll(includeInactive = false): Promise<ClauseWithVersion[]> {
        const clauses = await db.select().from(clauseLibrary).orderBy(asc(clauseLibrary.sortOrder), asc(clauseLibrary.name));
        const visible = includeInactive ? clauses : clauses.filter((c) => c.isActive);
        if (!visible.length) return [];

        const versions = await db.select().from(clauseLibraryVersions);

        return visible.map((c) => ({
            ...c,
            currentVersion: versions.find((v) => v.id === c.currentVersionId),
            versionCount: versions.filter((v) => v.clauseId === c.id).length,
        }));
    },

    async getVersions(clauseId: string): Promise<ClauseLibraryVersion[]> {
        return db.select().from(clauseLibraryVersions)
            .where(eq(clauseLibraryVersions.clauseId, clauseId))
            .orderBy(desc(clauseLibraryVersions.versionNumber));
    },

    /** Creates a clause and its first version together. */
    async create(data: {
        name: string; category?: string; bodyMarkup: string;
        isDefaultEnabled?: boolean; isRequired?: boolean; code?: string;
    }, actor?: { id?: string; email?: string }): Promise<ClauseWithVersion> {
        const clauseId = randomUUID();
        const versionId = randomUUID();
        const code = data.code || slugify(data.name, { lower: true, strict: true }).slice(0, 40);

        await db.insert(clauseLibrary).values({
            id: clauseId, code, name: data.name, category: data.category,
            currentVersionId: versionId,
            docTypes: ["tender"],
            isDefaultEnabled: data.isDefaultEnabled ?? false,
            isRequired: data.isRequired ?? false,
            createdByUserId: actor?.id,
        });

        await db.insert(clauseLibraryVersions).values({
            id: versionId, clauseId, versionNumber: 1,
            bodyMarkup: data.bodyMarkup, bodyHtml: toHtml(data.bodyMarkup),
            changeNote: "Initial version",
            createdByUserId: actor?.id, createdByEmail: actor?.email,
        });

        await auditService.log({
            entityType: "clause", entityId: clauseId, action: "clause_created",
            summary: `Created clause "${data.name}"`, actor,
        });

        const [clause] = await db.select().from(clauseLibrary).where(eq(clauseLibrary.id, clauseId));
        const [version] = await db.select().from(clauseLibraryVersions).where(eq(clauseLibraryVersions.id, versionId));
        return { ...clause, currentVersion: version, versionCount: 1 };
    },

    /**
     * Updates metadata, and — when the body changed — appends a new version rather
     * than overwriting the old one.
     */
    async update(id: string, data: {
        name?: string; category?: string; bodyMarkup?: string; changeNote?: string;
        isDefaultEnabled?: boolean; isRequired?: boolean; isActive?: boolean;
    }, actor?: { id?: string; email?: string }): Promise<ClauseWithVersion | undefined> {
        const [clause] = await db.select().from(clauseLibrary).where(eq(clauseLibrary.id, id));
        if (!clause) return undefined;

        const patch: Record<string, unknown> = { updatedAt: new Date() };
        for (const field of ["name", "category", "isDefaultEnabled", "isRequired", "isActive"] as const) {
            if (field in data) patch[field] = data[field];
        }

        if (data.bodyMarkup !== undefined) {
            const [current] = await db.select().from(clauseLibraryVersions)
                .where(eq(clauseLibraryVersions.id, clause.currentVersionId ?? ""));

            // Only version when the text actually changed — otherwise renaming a
            // clause would inflate its history with identical entries.
            if (!current || current.bodyMarkup !== data.bodyMarkup) {
                const versions = await this.getVersions(id);
                const nextNumber = (versions[0]?.versionNumber ?? 0) + 1;
                const versionId = randomUUID();

                await db.insert(clauseLibraryVersions).values({
                    id: versionId, clauseId: id, versionNumber: nextNumber,
                    bodyMarkup: data.bodyMarkup, bodyHtml: toHtml(data.bodyMarkup),
                    changeNote: data.changeNote || `Version ${nextNumber}`,
                    createdByUserId: actor?.id, createdByEmail: actor?.email,
                });
                patch.currentVersionId = versionId;

                await auditService.log({
                    entityType: "clause", entityId: id, action: "clause_version_created",
                    field: "bodyMarkup",
                    previousValue: current?.bodyMarkup?.slice(0, 500) ?? null,
                    newValue: data.bodyMarkup.slice(0, 500),
                    summary: `Clause "${clause.name}" updated to version ${nextNumber}`,
                    actor,
                });
            }
        }

        await updateReturning(clauseLibrary, id, patch);

        const [updated] = await db.select().from(clauseLibrary).where(eq(clauseLibrary.id, id));
        const [version] = await db.select().from(clauseLibraryVersions).where(eq(clauseLibraryVersions.id, updated.currentVersionId ?? ""));
        const versions = await this.getVersions(id);
        return { ...updated, currentVersion: version, versionCount: versions.length };
    },

    /** Deactivates rather than deletes — issued tenders reference these versions. */
    async deactivate(id: string, actor?: { id?: string; email?: string }): Promise<boolean> {
        const [clause] = await db.select().from(clauseLibrary).where(eq(clauseLibrary.id, id));
        if (!clause) return false;
        await db.update(clauseLibrary).set({ isActive: false, updatedAt: new Date() }).where(eq(clauseLibrary.id, id));
        await auditService.log({
            entityType: "clause", entityId: id, action: "clause_deactivated",
            summary: `Deactivated clause "${clause.name}"`, actor,
        });
        return true;
    },
};
