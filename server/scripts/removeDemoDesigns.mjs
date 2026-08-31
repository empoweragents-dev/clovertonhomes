/**
 * Removes the seeded demo home designs (Avalon 42, Bronte 30, Hampton 24,
 * Windsor 36, Ascot 28) — stock Unsplash photography and invented "from" prices
 * that were showing publicly on the landing page carousel and /designs.
 *
 * These live in home_designs, which is a different table from the property
 * listings: properties are house-and-land packages, designs are the builder's
 * catalogue. Clearing the listings did not touch these.
 *
 * Dry run by default; the app talks to the live Hostinger database.
 *
 *   node server/scripts/removeDemoDesigns.mjs            show the plan
 *   node server/scripts/removeDemoDesigns.mjs --commit   apply
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(serverRoot, ".env") });

const commit = process.argv.includes("--commit");

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
const [[{ db }]] = await conn.query("SELECT DATABASE() AS db");

const [designs] = await conn.query(
    "SELECT id, name, price_from AS priceFrom, featured_image AS img FROM home_designs",
);
const [[{ n: imageCount }]] = await conn.query("SELECT COUNT(*) AS n FROM design_images");
const [[{ n: planCount }]] = await conn.query("SELECT COUNT(*) AS n FROM design_floorplans");

// Anything still pointing at a design has to be unlinked first, or the delete
// fails on the foreign key.
const [linkedProps] = await conn.query(
    "SELECT id, title FROM properties WHERE design_id IS NOT NULL",
);

console.log(`Database : ${db}\n`);
console.log(`Will DELETE ${designs.length} home designs:`);
for (const d of designs) {
    const src = String(d.img || "").includes("unsplash") ? "unsplash stock" : (d.img ? "custom" : "no image");
    console.log(`  - ${d.name}  ($${((d.priceFrom ?? 0) / 100).toLocaleString("en-AU")} from, ${src})`);
}
console.log(`\nCascading: ${imageCount} design images, ${planCount} floorplans`);
console.log(`Properties linked to a design: ${linkedProps.length}${linkedProps.length ? " (design_id will be cleared)" : ""}`);
for (const p of linkedProps) console.log(`  · ${p.title}`);

if (!commit) {
    console.log("\nDRY RUN — nothing changed. Re-run with --commit to apply.");
    await conn.end();
    process.exit(0);
}

if (linkedProps.length) {
    await conn.execute("UPDATE properties SET design_id = NULL WHERE design_id IS NOT NULL");
}
await conn.execute("DELETE FROM design_images");
await conn.execute("DELETE FROM design_floorplans");
const [del] = await conn.execute("DELETE FROM home_designs");

console.log(`\nDeleted ${del.affectedRows} designs.`);
console.log("Add real designs in Admin -> Designs; the homepage carousel and");
console.log("/designs both read from this table, so they will populate automatically.");
await conn.end();
