/**
 * The document mini-markup: a deliberately tiny format for clause bodies.
 *
 *   blank line      -> new paragraph
 *   "- " prefix     -> bullet item
 *   "1. " prefix    -> numbered item
 *   **bold**        -> <strong>
 *   *italic*        -> <em>
 *
 * Why not a WYSIWYG editor: real tender content is titles, bullets and the odd bold
 * run. Because this converter is the ONLY producer of HTML in the module, arbitrary
 * user HTML is structurally impossible rather than filtered out after the fact, and
 * the PDF renderer only ever has to handle a closed set of tags.
 *
 * `toHtml` is the single source of truth for both the on-screen preview and the PDF.
 */

/** Tags this module can produce, and therefore all the PDF renderer must support. */
export const ALLOWED_TAGS = ["p", "br", "strong", "em", "ul", "ol", "li"] as const;

function escapeHtml(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

/** Inline marks. Escaping happens first, so a user cannot inject a tag. */
function inline(text: string): string {
    return escapeHtml(text)
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>");
}

type Block =
    | { kind: "p"; lines: string[] }
    | { kind: "ul" | "ol"; items: string[] };

/** Groups lines into paragraphs and lists. */
function parseBlocks(markup: string): Block[] {
    const blocks: Block[] = [];
    let current: Block | null = null;

    const flush = () => { if (current) { blocks.push(current); current = null; } };

    for (const raw of markup.replace(/\r\n/g, "\n").split("\n")) {
        const line = raw.trim();

        if (!line) { flush(); continue; }

        const bullet = line.match(/^[-*•]\s+(.*)$/);
        const numbered = line.match(/^\d+[.)]\s+(.*)$/);

        if (bullet) {
            if (current?.kind !== "ul") { flush(); current = { kind: "ul", items: [] }; }
            (current as { kind: "ul"; items: string[] }).items.push(bullet[1]);
        } else if (numbered) {
            if (current?.kind !== "ol") { flush(); current = { kind: "ol", items: [] }; }
            (current as { kind: "ol"; items: string[] }).items.push(numbered[1]);
        } else {
            if (current?.kind !== "p") { flush(); current = { kind: "p", lines: [] }; }
            (current as { kind: "p"; lines: string[] }).lines.push(line);
        }
    }
    flush();
    return blocks;
}

/** Mini-markup -> the constrained HTML subset consumed by the PDF renderer. */
export function toHtml(markup: string | null | undefined): string {
    if (!markup || !markup.trim()) return "";

    return parseBlocks(markup)
        .map((block) => {
            if (block.kind === "p") {
                // A single newline inside a paragraph is a soft break.
                return `<p>${block.lines.map(inline).join("<br>")}</p>`;
            }
            const items = block.items.map((i) => `<li>${inline(i)}</li>`).join("");
            return `<${block.kind}>${items}</${block.kind}>`;
        })
        .join("");
}

/** Plain text, for validation, search and length heuristics. */
export function toPlainText(markup: string | null | undefined): string {
    if (!markup) return "";
    return markup
        .replace(/\r\n/g, "\n")
        .split("\n")
        .map((l) => l.trim().replace(/^[-*•]\s+/, "").replace(/^\d+[.)]\s+/, ""))
        .filter(Boolean)
        .join(" ")
        .replace(/\*\*([^*]+)\*\*/g, "$1")
        .replace(/\*([^*]+)\*/g, "$1");
}

/**
 * Defence in depth for HTML that did not come from toHtml (a future import path, or
 * a later switch to a rich editor): strips every tag outside the allowlist and every
 * attribute, so nothing unexpected can reach the PDF renderer.
 */
export function sanitizeHtml(html: string | null | undefined): string {
    if (!html) return "";
    return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) => {
        if (!(ALLOWED_TAGS as readonly string[]).includes(tag.toLowerCase())) return "";
        return match.startsWith("</") ? `</${tag.toLowerCase()}>` : `<${tag.toLowerCase()}>`;
    });
}
