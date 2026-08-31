/**
 * Seeds the Cloverton Standard tender template, the item-status vocabulary and the
 * blank branding row.
 *
 * DRY RUN BY DEFAULT. The app's DATABASE_URL points at the live Hostinger MySQL, so
 * this script prints its plan and exits unless --create is passed. It only ever
 * INSERTs into the document-engine tables; it never touches pre-existing tables and
 * never deletes anything.
 *
 *   npm run db:seed:documents            show the plan
 *   npm run db:seed:documents -- --create   insert if the template is absent
 */
import { db } from "../../config/database.js";
import { documentTemplates, templateSections, templateItems } from "../schema/index.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { statusService, brandService } from "../../services/documents/index.js";
import { toHtml } from "../../services/documents/markup.js";
import {
    clovertonStandardSections, CLOVERTON_STANDARD_SLUG, EXPECTED_ITEM_COUNT,
} from "./data/clovertonStandardTemplate.js";

const commit = process.argv.includes("--create");

async function main() {
    const allItems = clovertonStandardSections.flatMap((s) => s.items);

    // Guard against a transcription slip silently shipping a short template.
    if (allItems.length !== EXPECTED_ITEM_COUNT) {
        throw new Error(`Seed data has ${allItems.length} items, expected ${EXPECTED_ITEM_COUNT}`);
    }

    console.log("Cloverton document seed");
    console.log("=======================");
    console.log(`Template : ${CLOVERTON_STANDARD_SLUG}`);
    console.log(`Sections : ${clovertonStandardSections.length}`);
    console.log(`Clauses  : ${allItems.length}`);
    for (const section of clovertonStandardSections) {
        const first = section.items[0]?.clause, last = section.items.at(-1)?.clause;
        console.log(`   ${section.number}. ${section.title} — ${section.items.length} (${first}–${last})`);
    }

    const existing = await db.select().from(documentTemplates)
        .where(eq(documentTemplates.slug, CLOVERTON_STANDARD_SLUG));

    if (existing.length) {
        const itemRows = await db.select({ id: templateItems.id }).from(templateItems)
            .where(eq(templateItems.templateId, existing[0].id));
        console.log(`\nTemplate already exists (${itemRows.length} clauses). Nothing to do.`);
        console.log("Edit it in the admin UI, or delete it there first to re-seed.");
        return;
    }

    if (!commit) {
        console.log("\nDRY RUN — nothing written. Re-run with --create to insert.");
        return;
    }

    // Statuses first: items reference them by code.
    const statuses = await statusService.ensureSystemStatuses();
    console.log(`\nStatuses : +${statuses.created} created, ${statuses.existing} already present`);

    const brand = await brandService.getOrCreate();
    console.log(`Branding : row ${brand.id} ready`);

    const templateId = randomUUID();
    await db.insert(documentTemplates).values({
        id: templateId,
        docType: "tender",
        name: "Cloverton Standard — Single Storey",
        slug: CLOVERTON_STANDARD_SLUG,
        description: "Standard inclusions schedule for a single storey home. Copied into each new tender, then edited per client.",
        storeyType: "Single Storey",
        isDefault: true,
        version: 1,
        defaultValidityDays: 30,
        defaultGstMode: "inclusive",
        coverIntroMarkup:
            "We are delighted to present our inclusions for the construction of your new home " +
            "({{project.description}}) at {{project.address}}.\n\n" +
            "This tender is based on what we have discussed to date and may be subject to revision " +
            "following development approval and the relevant conditions. Subject to site selection " +
            "and site conditions, and subject to soil test, geotechnical and survey reports.",
    });

    // IDs are generated up front so items can reference their section without a
    // round trip, and each section's items go in as one multi-row insert.
    let itemCount = 0;
    for (const section of clovertonStandardSections) {
        const sectionId = randomUUID();
        await db.insert(templateSections).values({
            id: sectionId,
            templateId,
            sectionNumber: section.number,
            title: section.title,
            coverSummaryLabel: section.coverSummaryLabel,
            showOnCoverSummary: section.showOnCoverSummary ?? false,
            sortOrder: section.number - 1,
        });

        await db.insert(templateItems).values(section.items.map((item, index) => ({
            id: randomUUID(),
            templateId,
            sectionId,
            clauseNumber: item.clause,
            title: item.title,
            bodyMarkup: item.body,
            bodyHtml: toHtml(item.body),
            statusCode: item.status,
            isClientVisible: true,
            sortOrder: index,
        })));

        itemCount += section.items.length;
        console.log(`  + ${section.number}. ${section.title} (${section.items.length} clauses)`);
    }

    console.log(`\nCreated template ${templateId} with ${itemCount} clauses.`);
}

main()
    .then(() => process.exit(0))
    .catch((err) => { console.error("\nSeed failed:", err); process.exit(1); });
