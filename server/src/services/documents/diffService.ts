import { db } from "../../config/database";
import { documentRevisions } from "../../db/schema";
import { eq, and } from "drizzle-orm";
import { snapshotService, DocumentSnapshot } from "./snapshot";
import { formatCents } from "./pricing";

/**
 * Revision comparison (§25).
 *
 * Diffs two frozen snapshots rather than the live tables, which is what makes the
 * comparison trustworthy: each side is exactly what was issued, so the result cannot
 * drift as the working copy is edited.
 */

export type ChangeKind = "added" | "removed" | "status" | "wording" | "price" | "field";

export interface Change {
    kind: ChangeKind;
    section: string | null;
    clause: string | null;
    label: string;
    before: string | null;
    after: string | null;
}

export interface RevisionDiff {
    from: { revision: number; label: string; totalCents: number | null; issuedAt: string | null };
    to: { revision: number; label: string; totalCents: number | null; issuedAt: string | null };
    changes: Change[];
    summary: { added: number; removed: number; status: number; wording: number; price: number; field: number };
}

/**
 * Normalises a value for comparison. A frozen snapshot stores dates as ISO strings
 * while a live one still holds Date objects, so an unchanged date would otherwise
 * be reported as a change on every diff.
 */
function norm(value: unknown): string {
    if (value === null || value === undefined) return "";
    if (value instanceof Date) return value.toISOString().slice(0, 10);
    const text = String(value);
    const isoDate = text.match(/^(\d{4}-\d{2}-\d{2})T/);
    return isoDate ? isoDate[1] : text.trim();
}

/** Tags stripped so a formatting-only change is not reported as changed wording. */
function plain(html: string | null | undefined): string {
    return (html ?? "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function diffSnapshots(a: DocumentSnapshot, b: DocumentSnapshot): Change[] {
    const changes: Change[] = [];

    // Header-level fields a client would notice.
    const fields: [string, string | null, string | null][] = [
        ["Client", a.clientDisplayName, b.clientDisplayName],
        ["Project address", a.project.address, b.project.address],
        ["House design", a.project.designName, b.project.designName],
        ["Facade", a.project.facade, b.project.facade],
        ["Tender date", a.documentDate, b.documentDate],
        ["Expiry date", a.expiryDate, b.expiryDate],
        ["GST mode", a.pricing.gstMode, b.pricing.gstMode],
    ];
    for (const [label, before, after] of fields) {
        if (norm(before) !== norm(after)) {
            changes.push({ kind: "field", section: null, clause: null, label, before: norm(before), after: norm(after) });
        }
    }

    if (a.pricing.totalCents !== b.pricing.totalCents) {
        changes.push({
            kind: "price", section: null, clause: null, label: "Tender total",
            before: formatCents(a.pricing.totalCents), after: formatCents(b.pricing.totalCents),
        });
    }

    // Pricing lines, keyed by label — the only stable identifier across revisions.
    const linesA = new Map(a.pricing.lines.map((l) => [l.label, l]));
    const linesB = new Map(b.pricing.lines.map((l) => [l.label, l]));
    for (const [label, lineA] of linesA) {
        const lineB = linesB.get(label);
        if (!lineB) {
            changes.push({ kind: "removed", section: "Pricing", clause: null, label, before: formatCents(lineA.amountCents), after: null });
        } else if (lineA.amountCents !== lineB.amountCents) {
            changes.push({ kind: "price", section: "Pricing", clause: null, label, before: formatCents(lineA.amountCents), after: formatCents(lineB.amountCents) });
        } else if (lineA.treatment !== lineB.treatment) {
            changes.push({ kind: "status", section: "Pricing", clause: null, label, before: lineA.treatment, after: lineB.treatment });
        }
    }
    for (const [label, lineB] of linesB) {
        if (!linesA.has(label)) {
            changes.push({ kind: "added", section: "Pricing", clause: null, label, before: null, after: formatCents(lineB.amountCents) });
        }
    }

    // Clauses, keyed by section title + clause title. Clause NUMBERS shift when items
    // are inserted or removed, so matching on them would report every later clause as
    // changed; the title is what a reader actually recognises.
    const key = (sectionTitle: string, itemTitle: string) => `${sectionTitle}||${itemTitle}`;
    const itemsA = new Map<string, { section: string; item: DocumentSnapshot["sections"][0]["items"][0] }>();
    const itemsB = new Map<string, { section: string; item: DocumentSnapshot["sections"][0]["items"][0] }>();
    for (const s of a.sections) for (const i of s.items) itemsA.set(key(s.title, i.title), { section: s.title, item: i });
    for (const s of b.sections) for (const i of s.items) itemsB.set(key(s.title, i.title), { section: s.title, item: i });

    for (const [k, { section, item }] of itemsA) {
        const other = itemsB.get(k);
        if (!other) {
            changes.push({ kind: "removed", section, clause: item.clauseNumber, label: item.title, before: item.statusLabel, after: null });
            continue;
        }
        if (item.statusCode !== other.item.statusCode) {
            changes.push({ kind: "status", section, clause: other.item.clauseNumber, label: item.title, before: item.statusLabel, after: other.item.statusLabel });
        }
        const beforeText = plain(item.bodyHtml), afterText = plain(other.item.bodyHtml);
        if (beforeText !== afterText) {
            changes.push({ kind: "wording", section, clause: other.item.clauseNumber, label: item.title, before: beforeText, after: afterText });
        }
        if ((item.allowanceCents ?? 0) !== (other.item.allowanceCents ?? 0)) {
            changes.push({
                kind: "price", section, clause: other.item.clauseNumber, label: `${item.title} allowance`,
                before: formatCents(item.allowanceCents ?? 0), after: formatCents(other.item.allowanceCents ?? 0),
            });
        }
    }
    for (const [k, { section, item }] of itemsB) {
        if (!itemsA.has(k)) {
            changes.push({ kind: "added", section, clause: item.clauseNumber, label: item.title, before: null, after: item.statusLabel });
        }
    }

    return changes;
}

export const diffService = {
    async compare(documentId: string, fromRevision: number, toRevision: number): Promise<RevisionDiff> {
        const load = async (revisionNumber: number) => {
            const [row] = await db.select().from(documentRevisions).where(and(
                eq(documentRevisions.documentId, documentId),
                eq(documentRevisions.revisionNumber, revisionNumber),
            ));
            if (!row) throw Object.assign(new Error(`Revision R${revisionNumber} not found`), { statusCode: 404 });

            // An issued revision has a frozen snapshot; the open draft does not, so it
            // is built live — the comparison is still against real current content.
            const snapshot = row.snapshotJson
                ? (row.snapshotJson as unknown as DocumentSnapshot)
                : (await snapshotService.build(documentId, { isPreview: true })).snapshot;

            return { row, snapshot };
        };

        const [from, to] = await Promise.all([load(fromRevision), load(toRevision)]);
        const changes = diffSnapshots(from.snapshot, to.snapshot);

        const summary = { added: 0, removed: 0, status: 0, wording: 0, price: 0, field: 0 };
        for (const c of changes) summary[c.kind]++;

        return {
            from: {
                revision: fromRevision,
                label: from.row.revisionLabel ?? `R${fromRevision}`,
                totalCents: from.row.totalCents ?? from.snapshot.pricing.totalCents,
                issuedAt: from.row.issuedAt ? new Date(from.row.issuedAt).toISOString() : null,
            },
            to: {
                revision: toRevision,
                label: to.row.revisionLabel ?? `R${toRevision}`,
                totalCents: to.row.totalCents ?? to.snapshot.pricing.totalCents,
                issuedAt: to.row.issuedAt ? new Date(to.row.issuedAt).toISOString() : null,
            },
            changes,
            summary,
        };
    },
};
