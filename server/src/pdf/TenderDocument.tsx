import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";
import { FONT_BODY, FONT_HEADING } from "./fonts.js";
import { readAsset } from "./assets.js";
import { renderRichText, plainLength, countListItems } from "./richText.js";
import type { DocumentSnapshot, SnapshotItem } from "../services/documents/snapshot.js";

/**
 * The Cloverton tender PDF.
 *
 * Renders exclusively from a DocumentSnapshot, so preview, first issue and a
 * re-download of an old revision all follow one code path and produce identical
 * output for identical input.
 */

const A4_PADDING = { top: 92, bottom: 68, horizontal: 44 };

function makeStyles(brand: DocumentSnapshot["brand"]) {
    const primary = brand.primaryColor || "#234252";
    return StyleSheet.create({
        page: {
            paddingTop: A4_PADDING.top,
            paddingBottom: A4_PADDING.bottom,
            paddingHorizontal: A4_PADDING.horizontal,
            fontFamily: FONT_BODY,
            fontSize: 9.5,
            color: "#222222",
            lineHeight: 1.45,
        },
        // Fixed header/footer repeat on every page; page padding reserves their space
        // so content can never overlap them however long a clause runs.
        header: {
            position: "absolute", top: 26, left: 44, right: 44,
            flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start",
            paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
        },
        headerLogo: { width: 92 },
        headerName: { fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 11, color: primary },
        headerMeta: { fontSize: 7.5, color: "#6B7280", textAlign: "right", lineHeight: 1.4 },
        footer: {
            position: "absolute", bottom: 22, left: 44, right: 44,
            flexDirection: "row", justifyContent: "space-between",
        },
        initial: { fontSize: 8, color: "#374151" },
        footerMeta: { fontSize: 7, color: "#9CA3AF" },

        coverTitle: { fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 26, color: primary, letterSpacing: 1 },
        coverRule: { height: 3, width: 64, backgroundColor: primary, marginTop: 8, marginBottom: 18 },
        label: { fontSize: 7.5, color: "#6B7280", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 },
        value: { fontSize: 10, color: "#111827" },
        metaGrid: { flexDirection: "row", flexWrap: "wrap", marginBottom: 14 },
        metaCell: { width: "25%", marginBottom: 10 },
        block: { marginBottom: 14 },
        intro: { fontSize: 9.5, lineHeight: 1.55, color: "#374151" },

        priceCard: {
            backgroundColor: primary, borderRadius: 6, padding: 18, marginVertical: 16,
            flexDirection: "row", justifyContent: "space-between", alignItems: "center",
        },
        priceLabel: { color: "#FFFFFF", fontSize: 9, letterSpacing: 1, textTransform: "uppercase", opacity: 0.85 },
        priceValue: { color: "#FFFFFF", fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 24 },
        priceNote: { color: "#FFFFFF", fontSize: 8, opacity: 0.85, textAlign: "right" },

        summaryRow: {
            flexDirection: "row", justifyContent: "space-between",
            paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
        },
        summaryLabel: { fontSize: 9.5, color: "#374151" },
        summaryValue: { fontSize: 9.5, color: "#111827", fontWeight: 600 },

        sectionHeading: {
            backgroundColor: primary, color: "#FFFFFF",
            paddingVertical: 6, paddingHorizontal: 10, borderRadius: 3,
            marginTop: 16, marginBottom: 10,
        },
        sectionHeadingText: { fontFamily: FONT_HEADING, fontWeight: 700, fontSize: 11, color: "#FFFFFF", letterSpacing: 0.5 },

        item: { marginBottom: 11 },
        itemHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: 3 },
        clauseNo: { width: 34, fontSize: 9, color: "#6B7280" },
        itemTitle: { flex: 1, fontSize: 9.5, fontWeight: 600, color: "#111827" },
        itemBody: { paddingLeft: 34 },
        paragraph: { fontSize: 9, color: "#374151", marginBottom: 3, lineHeight: 1.45 },
        listItem: { flexDirection: "row", marginBottom: 1.5 },
        bullet: { width: 10, fontSize: 9, color: "#6B7280" },
        listContent: { flex: 1, fontSize: 9, color: "#374151", lineHeight: 1.45 },
        signRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 34 },
        signBox: { width: "45%" },
        signLine: { borderBottomWidth: 1, borderBottomColor: "#9CA3AF", height: 26 },
    });
}

/**
 * Status badge (§17). Meaning is carried by the word, the border weight AND the fill,
 * so it survives a black-and-white print rather than relying on colour alone.
 */
function StatusBadge({ item }: { item: SnapshotItem }) {
    const tone = {
        included: { bg: "#ECFDF5", border: "#059669", color: "#065F46", width: 1 },
        excluded: { bg: "#374151", border: "#111827", color: "#FFFFFF", width: 1.5 },
        partial: { bg: "#FFFBEB", border: "#B45309", color: "#92400E", width: 1.5 },
        money: { bg: "#EFF6FF", border: "#1D4ED8", color: "#1E3A8A", width: 1 },
        neutral: { bg: "#FFFFFF", border: "#6B7280", color: "#374151", width: 1 },
    }[item.statusTreatment] ?? { bg: "#FFFFFF", border: "#6B7280", color: "#374151", width: 1 };

    return (
        <View style={{
            backgroundColor: tone.bg, borderWidth: tone.width, borderColor: tone.border,
            borderRadius: 2, paddingHorizontal: 5, paddingVertical: 1.5, marginLeft: 6,
        }}>
            <Text style={{ fontSize: 6.8, fontWeight: 700, color: tone.color, letterSpacing: 0.5 }}>
                {(item.statusLabel || item.statusCode).toUpperCase()}
            </Text>
        </View>
    );
}

function formatDate(value: string | null): string {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
}

function money(cents: number): string {
    return (cents / 100).toLocaleString("en-AU", { style: "currency", currency: "AUD" });
}

export function TenderDocument({ snapshot }: { snapshot: DocumentSnapshot }) {
    const styles = makeStyles(snapshot.brand);
    const b = snapshot.brand;
    const gstWord = snapshot.pricing.gstMode === "inclusive" ? "Including GST" : "Plus GST";

    // Read once per render; cached across renders by the assets module.
    let logo: Buffer | null = null;
    try {
        logo = readAsset("images/logo-dark.png");
    } catch {
        logo = null;
    }

    const builderAddress = [b.poBox, b.addressLine1, [b.suburb, b.state, b.postcode].filter(Boolean).join(" ")]
        .filter(Boolean).join(", ");

    // Called as functions, not rendered as <Header/> / <Footer/> components.
    // react-pdf stops repeating a `fixed` View across pages when it sits behind a
    // component boundary AND contains a `render` prop — the footer then appears on
    // the last page only. Inlining the element tree avoids that entirely.
    const header = () => (
        <View style={styles.header} fixed>
            <View>
                {logo
                    ? <Image src={{ data: logo, format: "png" }} style={styles.headerLogo} />
                    : <Text style={styles.headerName}>{b.legalName || "Cloverton Homes"}</Text>}
                <Text style={{ fontSize: 7, color: "#9CA3AF", marginTop: 3 }}>
                    {/* ABN only. The builder licence appears once, in the cover's
                        contact block — repeating it on all 10 pages is clutter. */}
                    {b.abn ? `ABN ${b.abn}` : ""}
                </Text>
            </View>
            <Text style={styles.headerMeta}>
                {snapshot.revisionLabel}
                {"\n"}{snapshot.clientSurname ?? snapshot.clientDisplayName ?? ""}
                {"\n"}{snapshot.project.suburb ?? ""}
            </Text>
        </View>
    );

    /**
     * Footer structure is load-bearing and easy to break:
     *  - `fixed` goes on the wrapping View ONLY. Adding `fixed` to a child as well
     *    stops the parent repeating, so the footer lands on the last page alone.
     *  - The page-number Text must be a DIRECT child of that View. Nesting it inside
     *    layout Views leaves the render prop unevaluated and the number blank.
     * Both failure modes are silent, so keep this flat: one fixed row, three Texts.
     */
    /**
     * The footer is split in two on purpose.
     *
     * A `fixed` View that CONTAINS a `render` prop stops repeating and lands on the
     * last page only — a silent failure. Keeping the static initials in one fixed
     * View, and the per-page number in its own sibling fixed Text, lets both repeat.
     * Verified by page-by-page extraction; do not merge these back together.
     */
    const footer = () => (
        <View style={styles.footer} fixed>
            <Text style={styles.initial}>{b.ownerInitialLabel} ____________</Text>
            <Text style={styles.initial}>{b.builderInitialLabel} ____________</Text>
        </View>
    );

    return (
        <Document
            title={`${snapshot.revisionLabel} — ${snapshot.clientDisplayName ?? "Tender"}`}
            author={b.legalName ?? "Cloverton Homes"}
            subject="Building Tender"
        >
            <Page size="A4" style={styles.page}>
                {header()}
                {footer()}

                <Text style={styles.coverTitle}>BUILDING TENDER</Text>
                <View style={styles.coverRule} />

                <View style={styles.metaGrid}>
                    {[
                        ["Tender number", snapshot.documentNumber],
                        ["Revision", `R${snapshot.revisionNumber}`],
                        ["Date", formatDate(snapshot.documentDate)],
                        ["Valid until", formatDate(snapshot.expiryDate)],
                    ].map(([label, value]) => (
                        <View key={label} style={styles.metaCell}>
                            <Text style={styles.label}>{label}</Text>
                            <Text style={styles.value}>{value}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.block}>
                    <Text style={styles.label}>Prepared for</Text>
                    <Text style={[styles.value, { fontSize: 13, fontFamily: FONT_HEADING, fontWeight: 600 }]}>
                        {snapshot.clientDisplayName ?? "—"}
                    </Text>
                    {snapshot.parties[0]?.currentAddress && (
                        <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 2 }}>{snapshot.parties[0].currentAddress}</Text>
                    )}
                </View>

                <View style={styles.block}>
                    <Text style={styles.label}>Project</Text>
                    <Text style={[styles.value, { fontSize: 11 }]}>{snapshot.project.address ?? "—"}</Text>
                    <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 2 }}>
                        {[
                            snapshot.project.lotNumber && `Lot ${snapshot.project.lotNumber}`,
                            snapshot.project.constructionType,
                            snapshot.project.designName,
                            snapshot.project.facade,
                            snapshot.project.squares && `approx. ${snapshot.project.squares} squares`,
                        ].filter(Boolean).join("  ·  ")}
                    </Text>
                </View>

                {snapshot.introHtml && (
                    <View style={styles.block}>
                        {renderRichText(snapshot.introHtml, {
                            paragraph: styles.intro, listItem: styles.listItem,
                            bullet: styles.bullet, listContent: styles.listContent,
                        }, "intro")}
                    </View>
                )}

                <View style={styles.priceCard}>
                    <View>
                        <Text style={styles.priceLabel}>Total tender price</Text>
                        <Text style={styles.priceValue}>{money(snapshot.pricing.totalCents)}</Text>
                    </View>
                    <Text style={styles.priceNote}>
                        {gstWord}
                        {"\n"}GST {money(snapshot.pricing.gstCents)}
                    </Text>
                </View>

                <View style={styles.block}>
                    <Text style={[styles.label, { marginBottom: 6 }]}>Summary</Text>
                    {snapshot.pricing.coverSummary.map((row, i) => (
                        <View key={i} style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>{row.label}</Text>
                            <Text style={styles.summaryValue}>{row.value}</Text>
                        </View>
                    ))}
                    {snapshot.pricing.optionalTotalCents > 0 && (
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Optional upgrades (not in total)</Text>
                            <Text style={styles.summaryValue}>{money(snapshot.pricing.optionalTotalCents)}</Text>
                        </View>
                    )}
                    <Text style={{ fontSize: 8.5, color: "#6B7280", marginTop: 8 }}>
                        Full inclusions are listed on the following pages.
                    </Text>
                </View>

                <Text style={{ fontSize: 9, color: "#374151", marginTop: 10 }}>
                    We confirm this tender will remain fixed for {snapshot.validityDays ?? 30} days from the date
                    of this quote{snapshot.expiryDate ? `, expiring ${formatDate(snapshot.expiryDate)}` : ""}.
                </Text>

                {snapshot.preparedByName && (
                    <Text style={{ fontSize: 9, color: "#6B7280", marginTop: 12 }}>
                        Prepared by {snapshot.preparedByName}
                    </Text>
                )}
                <Text style={{ fontSize: 8, color: "#9CA3AF", marginTop: 4 }}>
                    {/* The one place the builder licence is printed. */}
                    {[
                        b.legalName,
                        b.builderLicence && `Builder Licence ${b.builderLicence}`,
                        builderAddress, b.phone, b.email,
                    ].filter(Boolean).join("  ·  ")}
                </Text>
            </Page>

            <Page size="A4" style={styles.page}>
                {header()}
                {footer()}

                {snapshot.sections.map((section) => (
                    <View key={section.sectionNumber} break={section.pageBreakBefore}>
                        {/* minPresenceAhead pulls the first clause onto the same page, so a
                            section heading can never be stranded at the foot of a page. */}
                        <View style={styles.sectionHeading} minPresenceAhead={80}>
                            <Text style={styles.sectionHeadingText}>
                                {section.sectionNumber}. {section.title.toUpperCase()}
                            </Text>
                        </View>

                        {section.items.map((item, i) => {
                            // Short clauses are kept whole; long ones must be allowed to
                            // wrap, because wrap={false} on content taller than a page
                            // silently clips in react-pdf.
                            const keepTogether = plainLength(item.bodyHtml) < 900 && countListItems(item.bodyHtml) <= 8;
                            return (
                                <View key={`${section.sectionNumber}-${i}`} style={styles.item} wrap={!keepTogether}>
                                    {/* The head row is its own unbreakable unit so a status
                                        badge can never separate from its description. */}
                                    <View style={styles.itemHead} wrap={false} minPresenceAhead={40}>
                                        <Text style={styles.clauseNo}>{item.clauseNumber}</Text>
                                        <Text style={styles.itemTitle}>{item.title}</Text>
                                        <StatusBadge item={item} />
                                    </View>
                                    <View style={styles.itemBody}>
                                        {renderRichText(item.bodyHtml, {
                                            paragraph: styles.paragraph, listItem: styles.listItem,
                                            bullet: styles.bullet, listContent: styles.listContent,
                                        }, `s${section.sectionNumber}i${i}`)}
                                        {item.allowanceCents ? (
                                            <Text style={{ fontSize: 8.5, color: "#1E3A8A", marginTop: 2 }}>
                                                Allowance: {money(item.allowanceCents)}
                                            </Text>
                                        ) : null}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                ))}

                <View style={styles.signRow} wrap={false}>
                    <View style={styles.signBox}>
                        <View style={styles.signLine} />
                        <Text style={{ fontSize: 8, color: "#6B7280", marginTop: 3 }}>Owner signature / date</Text>
                    </View>
                    <View style={styles.signBox}>
                        <View style={styles.signLine} />
                        <Text style={{ fontSize: 8, color: "#6B7280", marginTop: 3 }}>Builder signature / date</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}
