import type { PricingTreatment } from "../../db/schema/index.js";

/**
 * Pricing engine (§6). Integer cents throughout — no float ever touches money.
 *
 * Two rules carry most of the correctness:
 *   1. Only lines whose treatment contributes are summed into the total.
 *   2. GST is rounded ONCE at the aggregate, never per line. Per-line rounding is
 *      what makes a PDF's displayed lines fail to add up to its displayed total.
 */

export interface TreatmentRule {
    /** Counts toward the tender total. */
    inTotal: boolean;
    /** Listed in the cover summary block. */
    inSummary: boolean;
    group: "main" | "optional" | "info";
    label: string;
}

/** Single source of truth for §6's nine treatments. */
export const PRICING_TREATMENTS: Record<PricingTreatment, TreatmentRule> = {
    include_in_total: { inTotal: true, inSummary: false, group: "main", label: "Included in total" },
    display_and_include: { inTotal: true, inSummary: true, group: "main", label: "Displayed and included" },
    display_separately: { inTotal: false, inSummary: true, group: "info", label: "Displayed separately" },
    optional: { inTotal: false, inSummary: true, group: "optional", label: "Optional" },
    excluded: { inTotal: false, inSummary: true, group: "info", label: "Excluded" },
    // Allowances and provisional sums ARE part of the tender price, but stay flagged
    // so a build contract can lift them into its PC/PS schedule later.
    allowance: { inTotal: true, inSummary: true, group: "main", label: "Allowance" },
    provisional_sum: { inTotal: true, inSummary: true, group: "main", label: "Provisional sum" },
    client_supplied: { inTotal: false, inSummary: true, group: "info", label: "Client supplied" },
    owner_responsibility: { inTotal: false, inSummary: true, group: "info", label: "Owner responsibility" },
};

export interface PricingLineInput {
    id?: string;
    label?: string;
    amountCents: number;
    treatment: PricingTreatment;
    /** null/undefined = follow the document's gstMode. */
    isGstInclusive?: boolean | null;
}

export interface PricingTotals {
    /** Sum of contributing lines, on the document's GST basis. */
    subtotalCents: number;
    /** GST component of the total. */
    gstCents: number;
    /** Total excluding GST. */
    exGstCents: number;
    /** What the client pays. */
    totalCents: number;
    optionalTotalCents: number;
    displaySeparatelyTotalCents: number;
}

/** Integer half-up division; `b` must be positive. */
export function divRound(a: number, b: number): number {
    if (b === 0) return 0;
    // Math.round would go half-away-from-zero on negatives; discounts must round
    // consistently with positive lines, so normalise the sign explicitly.
    const sign = a < 0 ? -1 : 1;
    return sign * Math.floor((Math.abs(a) + Math.floor(b / 2)) / b);
}

/**
 * Converts a line to the document's GST basis so mixed-basis input can be summed.
 * A line entered ex-GST inside an inclusive document is grossed up, and vice versa.
 */
function toDocumentBasis(line: PricingLineInput, gstMode: "inclusive" | "exclusive", rateBp: number): number {
    if (line.isGstInclusive === null || line.isGstInclusive === undefined) return line.amountCents;

    const lineIsInclusive = line.isGstInclusive;
    const docIsInclusive = gstMode === "inclusive";
    if (lineIsInclusive === docIsInclusive) return line.amountCents;

    return lineIsInclusive
        // inclusive amount -> ex-GST
        ? line.amountCents - divRound(line.amountCents * rateBp, 10000 + rateBp)
        // ex-GST amount -> inclusive
        : line.amountCents + divRound(line.amountCents * rateBp, 10000);
}

export function calculateTotals(
    lines: PricingLineInput[],
    gstMode: "inclusive" | "exclusive",
    gstRateBp: number,
): PricingTotals {
    let contributing = 0;
    let optional = 0;
    let separate = 0;

    for (const line of lines) {
        const rule = PRICING_TREATMENTS[line.treatment] ?? PRICING_TREATMENTS.include_in_total;
        const amount = toDocumentBasis(line, gstMode, gstRateBp);

        if (rule.inTotal) contributing += amount;
        if (line.treatment === "optional") optional += amount;
        if (line.treatment === "display_separately") separate += amount;
    }

    let subtotalCents: number, gstCents: number, exGstCents: number, totalCents: number;

    if (gstMode === "inclusive") {
        // Lines already contain GST: back it out of the aggregate.
        subtotalCents = contributing;
        gstCents = divRound(contributing * gstRateBp, 10000 + gstRateBp);
        exGstCents = contributing - gstCents;
        totalCents = contributing;
    } else {
        subtotalCents = contributing;
        gstCents = divRound(contributing * gstRateBp, 10000);
        exGstCents = contributing;
        totalCents = contributing + gstCents;
    }

    return {
        subtotalCents,
        gstCents,
        exGstCents,
        totalCents,
        optionalTotalCents: optional,
        displaySeparatelyTotalCents: separate,
    };
}

/** "$428,000.00" from cents. */
export function formatCents(cents: number | null | undefined): string {
    return ((cents ?? 0) / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

/** Dollars-and-cents string ("428000.50") to integer cents, tolerating $ and commas. */
export function parseCents(input: string | number | null | undefined): number {
    if (input === null || input === undefined || input === "") return 0;
    if (typeof input === "number") return Math.round(input * 100);
    const cleaned = input.replace(/[$,\s]/g, "");
    const value = parseFloat(cleaned);
    return Number.isNaN(value) ? 0 : Math.round(value * 100);
}
