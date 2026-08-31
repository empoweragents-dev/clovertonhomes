import { PDFDocument, StandardFonts, degrees, rgb } from "pdf-lib";

/**
 * Stamps "Page X of Y" onto every page after rendering.
 *
 * §19 requires a page number in the footer of every page. react-pdf's `render`
 * prop is the documented way to do that, but in this document it emits on the last
 * page only — reproducibly, and not reproducible in isolation, so it is not
 * something we can rely on. A post-render pass is deterministic: the page count is
 * known for certain, every page is stamped, and it cannot silently regress.
 *
 * Helvetica is used rather than the vendored Inter because this is a 7pt line of
 * page furniture, and embedding a second copy of a 340KB font to set it would cost
 * far more than it gains.
 */

export interface StampOptions {
    /** Text before the page counter, e.g. the revision label. */
    prefix?: string;
    /** Distance from the bottom edge, in points. */
    bottom?: number;
    fontSize?: number;
    /**
     * Draws a diagonal watermark on every page. Stamped here rather than rendered as
     * a react-pdf `fixed` element for the same reason as the page number: fixed
     * elements in this document do not reliably repeat.
     */
    watermark?: string;
}

export async function stampPageNumbers(pdfBytes: Buffer, options: StampOptions = {}): Promise<{ buffer: Buffer; pageCount: number }> {
    const { prefix, bottom = 22, fontSize = 7 } = options;

    const pdfDoc = await PDFDocument.load(pdfBytes);
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const pages = pdfDoc.getPages();
    const total = pages.length;

    // Watermark first so page furniture stays legible on top of it.
    if (options.watermark) {
        const wmFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const wmSize = 46;
        const wmWidth = wmFont.widthOfTextAtSize(options.watermark, wmSize);
        for (const page of pages) {
            page.drawText(options.watermark, {
                x: (page.getWidth() - wmWidth * 0.82) / 2,
                y: page.getHeight() / 2 - 120,
                size: wmSize,
                font: wmFont,
                color: rgb(0.94, 0.27, 0.27),
                opacity: 0.13,
                rotate: degrees(32),
            });
        }
    }

    pages.forEach((page, index) => {
        const label = `${prefix ? `${prefix}   ·   ` : ""}Page ${index + 1} of ${total}`;
        const width = font.widthOfTextAtSize(label, fontSize);
        page.drawText(label, {
            x: (page.getWidth() - width) / 2,
            y: bottom,
            size: fontSize,
            font,
            color: rgb(0.61, 0.64, 0.69),
        });
    });

    const out = await pdfDoc.save();
    return { buffer: Buffer.from(out), pageCount: total };
}
