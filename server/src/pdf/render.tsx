import { renderToBuffer } from "@react-pdf/renderer";
import { TenderDocument } from "./TenderDocument.js";
import { registerPdfFonts } from "./fonts.js";
import { stampPageNumbers } from "./stampPageNumbers.js";
import type { DocumentSnapshot } from "../services/documents/snapshot.js";

/**
 * PDF rendering entry point.
 *
 * Renders are serialised through a single-slot queue: this runs on shared hosting,
 * and two staff generating long tenders at once would otherwise double peak memory.
 */

let queue: Promise<unknown> = Promise.resolve();
let depth = 0;
const MAX_DEPTH = 4;
const TIMEOUT_MS = 60_000;

export class RenderBusyError extends Error {
    statusCode = 429;
    constructor() { super("PDF generation is busy. Please try again in a moment."); }
}

export interface RenderResult {
    buffer: Buffer;
    pageCount: number | null;
    byteSize: number;
}

/** react-pdf does not report a page count, so derive it from the object stream. */
function countPages(buffer: Buffer): number | null {
    const matches = buffer.toString("latin1").match(/\/Type\s*\/Page[^s]/g);
    return matches ? matches.length : null;
}

export async function renderTenderPdf(snapshot: DocumentSnapshot): Promise<RenderResult> {
    if (depth >= MAX_DEPTH) throw new RenderBusyError();

    depth++;
    const job = queue.then(async () => {
        registerPdfFonts();

        const buffer = await Promise.race([
            renderToBuffer(<TenderDocument snapshot={snapshot} />),
            new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error("PDF render timed out after 60s")), TIMEOUT_MS)),
        ]);

        // A truncated or empty render must fail loudly rather than be stored as an
        // "immutable" document.
        if (!buffer || (buffer as Buffer).length < 1000) throw new Error("PDF render produced no usable output");

        // Page numbers are stamped afterwards; see stampPageNumbers for why.
        const stamped = await stampPageNumbers(buffer as Buffer, {
            prefix: snapshot.revisionLabel,
            watermark: snapshot.isPreview ? "PREVIEW - NOT FOR ISSUE" : undefined,
        });

        return { buffer: stamped.buffer, pageCount: stamped.pageCount, byteSize: stamped.buffer.length };
    });

    // Keep the chain alive even when a job fails, so one failure cannot wedge the queue.
    queue = job.catch(() => undefined);

    try {
        return await job;
    } finally {
        depth--;
    }
}
