import { db } from "../../config/database.js";
import { auditLogs, AuditLog } from "../../db/schema/index.js";
import { eq, desc } from "drizzle-orm";

/**
 * Append-only audit trail (§35). Records who changed what, when, and the before/after
 * values for commercially meaningful edits.
 *
 * Never throws: an audit failure must not roll back or block the user's actual work.
 * A dropped log line is far less damaging than a blocked tender.
 */

export interface AuditEntry {
    entityType: string;
    entityId?: string;
    documentId?: string;
    revisionNumber?: number;
    action: string;
    field?: string;
    previousValue?: string | null;
    newValue?: string | null;
    summary?: string;
    actor?: { id?: string; email?: string; ip?: string };
    metadata?: Record<string, unknown>;
}

export const auditService = {
    async log(entry: AuditEntry): Promise<void> {
        try {
            await db.insert(auditLogs).values({
                entityType: entry.entityType,
                entityId: entry.entityId,
                documentId: entry.documentId,
                revisionNumber: entry.revisionNumber,
                action: entry.action,
                field: entry.field,
                previousValue: entry.previousValue ?? null,
                newValue: entry.newValue ?? null,
                summary: entry.summary?.slice(0, 255),
                userId: entry.actor?.id,
                userEmail: entry.actor?.email,
                ipAddress: entry.actor?.ip,
                metadata: entry.metadata,
            });
        } catch (err) {
            console.error("Audit log write failed:", (err as Error).message);
        }
    },

    async getForDocument(documentId: string, limit = 100): Promise<AuditLog[]> {
        return db.select().from(auditLogs)
            .where(eq(auditLogs.documentId, documentId))
            .orderBy(desc(auditLogs.createdAt))
            .limit(limit);
    },
};
