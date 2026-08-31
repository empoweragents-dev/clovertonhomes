import { createHash } from "crypto";
import { tenderService } from "./tenderService.js";
import { brandService } from "./brandService.js";
import { calculateTotals, PRICING_TREATMENTS, formatCents } from "./pricing.js";

/**
 * Builds the frozen payload a PDF is rendered from (§30).
 *
 * Every placeholder is resolved here, so the snapshot contains finished text. Once
 * stored on an issued revision it is never touched again — which is what makes an
 * issued tender reproducible after templates, clauses, statuses or even the schema
 * have moved on.
 */

export interface SnapshotItem {
    clauseNumber: string;
    title: string;
    bodyHtml: string;
    statusCode: string;
    statusLabel: string;
    statusTreatment: string;
    allowanceCents: number | null;
    priceCents: number | null;
}

export interface SnapshotSection {
    sectionNumber: number;
    title: string;
    descriptionHtml: string | null;
    coverSummaryLabel: string | null;
    showOnCoverSummary: boolean;
    pageBreakBefore: boolean;
    items: SnapshotItem[];
}

export interface DocumentSnapshot {
    documentNumber: string;
    revisionLabel: string;
    revisionNumber: number;
    documentDate: string | null;
    expiryDate: string | null;
    validityDays: number | null;
    preparedByName: string | null;
    clientDisplayName: string | null;
    clientSurname: string | null;
    parties: { role: string; fullName: string | null; currentAddress: string | null }[];
    project: {
        address: string | null; lotNumber: string | null; suburb: string | null;
        state: string | null; postcode: string | null; constructionType: string | null;
        designName: string | null; facade: string | null; squares: string | null;
        bedrooms: number | null; bathrooms: number | null; garages: number | null;
    };
    introHtml: string | null;
    sections: SnapshotSection[];
    pricing: {
        gstMode: string; gstRateBp: number;
        subtotalCents: number; gstCents: number; totalCents: number;
        optionalTotalCents: number;
        lines: { label: string; amountCents: number; treatment: string; inTotal: boolean; showInSummary: boolean }[];
        coverSummary: { label: string; value: string }[];
    };
    brand: {
        legalName: string | null; tradingName: string | null; abn: string | null;
        builderLicence: string | null; addressLine1: string | null; suburb: string | null;
        state: string | null; postcode: string | null; poBox: string | null;
        phone: string | null; email: string | null; website: string | null;
        primaryColor: string; accentColor: string; footerText: string | null;
        ownerInitialLabel: string; builderInitialLabel: string;
        logoStorageKey: string | null;
    };
    generatedAt: string;
    generatedBy: string | null;
    isPreview?: boolean;
}

/** Tokens resolvable in clause bodies and the cover intro (§44). */
export function buildPlaceholderMap(snap: Omit<DocumentSnapshot, "sections" | "introHtml">): Record<string, string> {
    const b = snap.brand, p = snap.project;
    const addressParts = [b.addressLine1, b.suburb, b.state, b.postcode].filter(Boolean).join(" ");
    return {
        "client.full_name": snap.clientDisplayName ?? "",
        "client.surname": snap.clientSurname ?? "",
        "client.address": snap.parties[0]?.currentAddress ?? "",
        "project.address": p.address ?? "",
        "project.suburb": p.suburb ?? "",
        "project.lot_dp": p.lotNumber ?? "",
        "project.house_design": p.designName ?? "",
        "project.facade": p.facade ?? "",
        "project.squares": p.squares ?? "",
        "project.construction_type": p.constructionType ?? "",
        // Joins only the parts that exist, so an empty facade or design cannot leave
        // dangling connector words ("a  with ") in a client-facing sentence.
        "project.description": [
            p.constructionType,
            p.designName,
            p.facade && `${p.facade} facade`,
        ].filter(Boolean).join(", ") || "your new home",
        "tender.number": snap.documentNumber,
        "tender.revision": String(snap.revisionNumber),
        "tender.date": snap.documentDate ?? "",
        "tender.expiry_date": snap.expiryDate ?? "",
        "tender.validity_days": String(snap.validityDays ?? 30),
        "pricing.total": formatCents(snap.pricing.totalCents),
        "pricing.subtotal": formatCents(snap.pricing.subtotalCents),
        "pricing.gst": formatCents(snap.pricing.gstCents),
        "builder.company_name": b.legalName ?? "",
        "builder.abn": b.abn ?? "",
        "builder.licence": b.builderLicence ?? "",
        "builder.address": addressParts,
        "builder.phone": b.phone ?? "",
        "builder.email": b.email ?? "",
        "builder.website": b.website ?? "",
        "today": new Date().toISOString().slice(0, 10),
    };
}

/** Replaces {{tokens}}; reports any that had no resolver so issue can be blocked. */
export function resolveText(text: string | null, map: Record<string, string>): { text: string; unresolved: string[] } {
    if (!text) return { text: "", unresolved: [] };
    const unresolved: string[] = [];
    const out = text.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (match, token: string) => {
        if (token in map) return map[token];
        unresolved.push(token);
        return match;
    });
    return { text: out, unresolved };
}

export const snapshotService = {
    /** Assembles the snapshot. `unresolved` non-empty must block issuing. */
    async build(documentId: string, options: { isPreview?: boolean; generatedBy?: string } = {}):
        Promise<{ snapshot: DocumentSnapshot; unresolved: string[] }> {

        const tree = await tenderService.getTree(documentId);
        if (!tree) throw Object.assign(new Error("Document not found"), { statusCode: 404 });

        const brand = await brandService.getOrCreate();
        const doc = tree.document;

        const totals = calculateTotals(
            tree.pricingLines.map((l) => ({ amountCents: l.amountCents, treatment: l.treatment, isGstInclusive: l.isGstInclusive })),
            doc.gstMode, doc.gstRateBp,
        );

        const gstWord = doc.gstMode === "inclusive" ? "including GST" : "plus GST";

        // Cover summary: one row per section flagged for it, showing the dominant
        // status of its visible clauses — mirroring the reference tender's cover.
        const coverSummary = tree.sections
            .filter((s) => s.showOnCoverSummary)
            .map((s) => {
                const visible = s.items.filter((i) => i.isClientVisible);
                const included = visible.filter((i) => i.statusTreatment !== "excluded").length;
                // Coarse on purpose, matching Cloverton's existing tenders: the cover
                // says whether the category forms part of the tender at all. A handful
                // of excluded clauses inside a section (1.7 gas, 2.18 blinds) does not
                // make the whole category "part included" — the detail pages carry that.
                const value = visible.length === 0 ? "—"
                    : included === 0 ? "Excluded"
                    : included === visible.length ? "Included"
                    : "Included — refer full list";
                return { label: s.coverSummaryLabel ?? s.title, value };
            });

        const base = {
            documentNumber: doc.documentNumber,
            revisionLabel: `${doc.documentNumber}-R${doc.currentRevisionNumber}`,
            revisionNumber: doc.currentRevisionNumber,
            documentDate: doc.documentDate as string | null,
            expiryDate: doc.expiryDate as string | null,
            validityDays: doc.validityDays,
            preparedByName: doc.preparedByName,
            clientDisplayName: doc.clientDisplayName,
            clientSurname: (doc.clientDisplayName ?? "").trim().split(/\s+/).pop() ?? null,
            parties: tree.parties.map((p) => ({ role: p.role, fullName: p.fullName, currentAddress: p.currentAddress })),
            project: {
                address: doc.projectAddress, lotNumber: doc.lotNumber, suburb: doc.suburb,
                state: doc.state, postcode: doc.postcode, constructionType: doc.constructionType,
                designName: doc.designNameSnapshot, facade: doc.facadeSnapshot,
                squares: doc.squares as string | null,
                bedrooms: doc.bedrooms, bathrooms: doc.bathrooms, garages: doc.garages,
            },
            pricing: {
                gstMode: doc.gstMode, gstRateBp: doc.gstRateBp,
                subtotalCents: totals.subtotalCents,
                gstCents: totals.gstCents,
                totalCents: doc.totalOverrideCents ?? totals.totalCents,
                optionalTotalCents: totals.optionalTotalCents,
                lines: tree.pricingLines.filter((l) => l.isClientVisible).map((l) => ({
                    label: l.label, amountCents: l.amountCents, treatment: l.treatment,
                    inTotal: PRICING_TREATMENTS[l.treatment]?.inTotal ?? false,
                    showInSummary: l.showInSummary,
                })),
                coverSummary: [...coverSummary, { label: "Total", value: `${formatCents(doc.totalOverrideCents ?? totals.totalCents)} ${gstWord}` }],
            },
            brand: {
                legalName: brand.legalName, tradingName: brand.tradingName, abn: brand.abn,
                builderLicence: brand.builderLicence, addressLine1: brand.addressLine1,
                suburb: brand.suburb, state: brand.state, postcode: brand.postcode, poBox: brand.poBox,
                phone: brand.phone, email: brand.email, website: brand.website,
                primaryColor: brand.primaryColor ?? "#234252",
                accentColor: brand.accentColor ?? "#222222",
                footerText: brand.footerText,
                ownerInitialLabel: brand.ownerInitialLabel ?? "Owner's Initial",
                builderInitialLabel: brand.builderInitialLabel ?? "Builder's Initial",
                logoStorageKey: brand.logoStorageKey,
            },
            generatedAt: new Date().toISOString(),
            generatedBy: options.generatedBy ?? null,
            isPreview: options.isPreview ?? false,
        };

        const map = buildPlaceholderMap(base);
        const unresolved: string[] = [];

        const intro = resolveText(doc.introMarkup, map);
        unresolved.push(...intro.unresolved);

        const sections: SnapshotSection[] = tree.sections.map((s) => ({
            sectionNumber: s.sectionNumber,
            title: s.title,
            descriptionHtml: s.descriptionHtml,
            coverSummaryLabel: s.coverSummaryLabel,
            showOnCoverSummary: s.showOnCoverSummary,
            pageBreakBefore: s.pageBreakBefore,
            items: s.items
                // Internal-only clauses never reach the snapshot, so they cannot leak
                // into a client PDF even by accident (§36).
                .filter((i) => i.isClientVisible)
                .map((i) => {
                    const body = resolveText(i.bodyHtml, map);
                    unresolved.push(...body.unresolved);
                    const title = resolveText(i.title, map);
                    unresolved.push(...title.unresolved);
                    return {
                        clauseNumber: i.displayClauseNumber ?? i.clauseNumber ?? "",
                        title: title.text,
                        bodyHtml: body.text,
                        statusCode: i.statusCode,
                        statusLabel: i.statusLabel ?? i.statusCode,
                        statusTreatment: i.statusTreatment ?? "neutral",
                        allowanceCents: i.allowanceCents,
                        priceCents: i.priceCents,
                    };
                }),
        }));

        const snapshot: DocumentSnapshot = {
            ...base,
            introHtml: intro.text ? `<p>${intro.text.replace(/\n\n+/g, "</p><p>").replace(/\n/g, "<br>")}</p>` : null,
            sections,
        };

        return { snapshot, unresolved: [...new Set(unresolved)] };
    },

    /** Stable hash for §22's immutability check. Key order is normalised first. */
    hash(snapshot: DocumentSnapshot): string {
        const canonical = JSON.stringify(snapshot, Object.keys(snapshot).sort());
        return createHash("sha256").update(canonical).digest("hex");
    },
};
