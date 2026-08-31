/**
 * Clause numbering (§11).
 *
 * Ordering is the truth; clause numbers are derived. `sortOrder` within a section
 * decides position, and the number is recomputed from scratch on every structural
 * change — so insert-between, delete, move, reorder, cross-section move and
 * duplication all collapse into one operation: reassign order, then renumber.
 *
 * Two numbers are produced per item:
 *   clauseNumber        counts every item — the stable internal reference used by
 *                       the editor and audit log
 *   displayClauseNumber counts only client-visible items — what the PDF prints
 *
 * Without the second, hiding 2.2 would print "2.1, 2.3, 2.4" to the client and read
 * as a defect rather than a deliberate omission.
 *
 * Pure and dependency-free so the editor can run the identical function for instant
 * optimistic preview while the server stays authoritative.
 */

export interface NumberableSection {
    id: string;
    sortOrder: number;
    sectionNumber?: number;
    numberingStyle?: string;
}

export interface NumberableItem {
    id: string;
    sectionId: string;
    parentItemId?: string | null;
    sortOrder: number;
    isClientVisible?: boolean;
    clauseNumber?: string | null;
    displayClauseNumber?: string | null;
}

export interface RenumberResult<S, I> {
    sections: (S & { sectionNumber: number; sortOrder: number })[];
    items: (I & { clauseNumber: string; displayClauseNumber: string | null; sortOrder: number })[];
    /** Ids whose stored values actually changed — lets callers skip no-op writes. */
    changedSectionIds: string[];
    changedItemIds: string[];
}

/** Deterministic ordering: sortOrder, then id so equal values never shuffle. */
function byOrder<T extends { sortOrder: number; id: string }>(a: T, b: T): number {
    return a.sortOrder - b.sortOrder || a.id.localeCompare(b.id);
}

export function renumber<S extends NumberableSection, I extends NumberableItem>(
    sections: S[],
    items: I[],
): RenumberResult<S, I> {
    const orderedSections = [...sections].sort(byOrder);

    const outSections = orderedSections.map((section, index) => ({
        ...section,
        sectionNumber: index + 1,
        // Dense 0..n-1 ordering: no gaps, no fractional indices, no drift over time.
        sortOrder: index,
    }));

    const changedSectionIds = outSections
        .filter((s, i) => s.sectionNumber !== orderedSections[i].sectionNumber || s.sortOrder !== orderedSections[i].sortOrder)
        .map((s) => s.id);

    const outItems: (I & { clauseNumber: string; displayClauseNumber: string | null; sortOrder: number })[] = [];
    const changedItemIds: string[] = [];

    for (const section of outSections) {
        const sectionItems = items.filter((i) => i.sectionId === section.id);

        // Children keyed by parent ("" = top level) so subsections number as 2.13.1.
        const childrenOf = new Map<string, I[]>();
        for (const item of sectionItems) {
            const key = item.parentItemId ?? "";
            const list = childrenOf.get(key) ?? [];
            list.push(item);
            childrenOf.set(key, list);
        }
        for (const list of childrenOf.values()) list.sort(byOrder);

        // Separate counters: visible-only numbering must not skip on hidden items.
        const walk = (parentId: string, prefix: string, displayPrefix: string | null) => {
            const children = childrenOf.get(parentId) ?? [];
            let visibleIndex = 0;

            children.forEach((item, index) => {
                const clauseNumber = `${prefix}.${index + 1}`;

                let displayClauseNumber: string | null = null;
                const visible = item.isClientVisible !== false;
                if (visible && displayPrefix !== null) {
                    visibleIndex += 1;
                    displayClauseNumber = `${displayPrefix}.${visibleIndex}`;
                }

                const next = { ...item, clauseNumber, displayClauseNumber, sortOrder: index };
                outItems.push(next);

                if (
                    item.clauseNumber !== clauseNumber ||
                    item.displayClauseNumber !== displayClauseNumber ||
                    item.sortOrder !== index
                ) {
                    changedItemIds.push(item.id);
                }

                // Hidden parents pass null down so their children get no display number.
                walk(item.id, clauseNumber, displayClauseNumber);
            });
        };

        walk("", String(section.sectionNumber), String(section.sectionNumber));
    }

    return { sections: outSections, items: outItems, changedSectionIds, changedItemIds };
}

/** Moves an item to a position (and possibly another section), returning new orders. */
export function applyMove<I extends NumberableItem>(
    items: I[],
    itemId: string,
    targetSectionId: string,
    targetIndex: number,
): I[] {
    const moving = items.find((i) => i.id === itemId);
    if (!moving) return items;

    const siblings = items
        .filter((i) => i.sectionId === targetSectionId && i.id !== itemId && (i.parentItemId ?? "") === (moving.parentItemId ?? ""))
        .sort(byOrder);

    const clamped = Math.max(0, Math.min(targetIndex, siblings.length));
    const reordered = [...siblings.slice(0, clamped), { ...moving, sectionId: targetSectionId }, ...siblings.slice(clamped)];

    const newOrder = new Map(reordered.map((item, index) => [item.id, index]));

    return items.map((item) => {
        if (item.id === itemId) {
            return { ...item, sectionId: targetSectionId, sortOrder: newOrder.get(item.id) ?? item.sortOrder };
        }
        return newOrder.has(item.id) ? { ...item, sortOrder: newOrder.get(item.id)! } : item;
    });
}
