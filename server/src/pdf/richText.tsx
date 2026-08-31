import { Text, View } from "@react-pdf/renderer";
import type { Style } from "@react-pdf/types";

/**
 * Maps the constrained HTML subset produced by services/documents/markup.ts onto
 * react-pdf primitives. Only p, br, strong, em, u, ul, ol and li can appear, because
 * our own converter is the sole producer of that HTML — so this needs no DOM library
 * and cannot be surprised by unexpected markup.
 */

interface RichTextStyles {
    paragraph: Style;
    listItem: Style;
    bullet: Style;
    listContent: Style;
}

/** Splits inline markup into styled <Text> runs. */
function inlineRuns(html: string, keyPrefix: string): React.ReactNode[] {
    const nodes: React.ReactNode[] = [];
    // One pass over the recognised inline tags; anything else was already stripped.
    const pattern = /<(strong|em|u)>([\s\S]*?)<\/\1>|<br\s*\/?>/gi;
    let cursor = 0, match: RegExpExecArray | null, index = 0;

    const decode = (text: string) =>
        text.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");

    while ((match = pattern.exec(html)) !== null) {
        if (match.index > cursor) nodes.push(decode(html.slice(cursor, match.index)));

        if (match[0].toLowerCase().startsWith("<br")) {
            nodes.push("\n");
        } else {
            const [, tag, inner] = match;
            const style: Style =
                tag === "strong" ? { fontWeight: 600 }
                    : tag === "em" ? { fontStyle: "italic" }
                        : { textDecoration: "underline" };
            nodes.push(
                <Text key={`${keyPrefix}-i${index++}`} style={style}>
                    {inlineRuns(inner, `${keyPrefix}-n${index}`)}
                </Text>,
            );
        }
        cursor = match.index + match[0].length;
    }
    if (cursor < html.length) nodes.push(decode(html.slice(cursor)));
    return nodes;
}

/** Renders the block structure: paragraphs and bullet/numbered lists. */
export function renderRichText(html: string | null | undefined, styles: RichTextStyles, keyPrefix = "rt"): React.ReactNode[] {
    if (!html || !html.trim()) return [];

    const blocks: React.ReactNode[] = [];
    const blockPattern = /<(p|ul|ol)>([\s\S]*?)<\/\1>/gi;
    let match: RegExpExecArray | null, index = 0;
    let matchedAnything = false;

    while ((match = blockPattern.exec(html)) !== null) {
        matchedAnything = true;
        const [, tag, inner] = match;

        if (tag.toLowerCase() === "p") {
            blocks.push(
                <Text key={`${keyPrefix}-p${index++}`} style={styles.paragraph}>
                    {inlineRuns(inner, `${keyPrefix}-p${index}`)}
                </Text>,
            );
        } else {
            const ordered = tag.toLowerCase() === "ol";
            const items = [...inner.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((m) => m[1]);
            blocks.push(
                <View key={`${keyPrefix}-l${index++}`}>
                    {items.map((item, i) => (
                        // Bullet and text sit in a row so wrapped lines stay indented
                        // rather than sliding back under the bullet.
                        <View key={`${keyPrefix}-li${i}`} style={styles.listItem}>
                            <Text style={styles.bullet}>{ordered ? `${i + 1}.` : "•"}</Text>
                            <Text style={styles.listContent}>{inlineRuns(item, `${keyPrefix}-li${i}`)}</Text>
                        </View>
                    ))}
                </View>,
            );
        }
    }

    // Bare text with no block tags still has to render.
    if (!matchedAnything) {
        blocks.push(
            <Text key={`${keyPrefix}-plain`} style={styles.paragraph}>
                {inlineRuns(html, `${keyPrefix}-plain`)}
            </Text>,
        );
    }
    return blocks;
}

/** Rough plain-text length, used to decide whether a clause can be kept unbroken. */
export function plainLength(html: string | null | undefined): number {
    return html ? html.replace(/<[^>]+>/g, "").length : 0;
}

/** Number of list items, the other half of the keep-together heuristic. */
export function countListItems(html: string | null | undefined): number {
    return html ? (html.match(/<li>/gi) ?? []).length : 0;
}
