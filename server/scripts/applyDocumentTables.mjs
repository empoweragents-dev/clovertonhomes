/**
 * Applies the document-engine DDL to MySQL, statement by statement.
 *
 * Used instead of `drizzle-kit push` on purpose: dev and production share one remote
 * Hostinger database, so the schema change must be provably additive. This script
 * refuses to run anything that is not a CREATE TABLE / CREATE INDEX targeting one of
 * the known-new tables, which makes it impossible to alter or drop existing data.
 *
 * Usage: node server/scripts/applyDocumentTables.mjs <path-to.sql> [--commit]
 *        (dry run unless --commit is passed)
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { readFileSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(serverRoot, ".env") });

const NEW_TABLES = new Set([
    "document_brand_settings", "document_number_sequences", "document_statuses",
    "clause_library", "clause_library_versions",
    "document_templates", "template_sections", "template_items", "template_terms",
    "clients", "client_contacts",
    "documents", "document_parties", "document_sections", "document_items",
    "document_terms", "document_pricing_lines", "document_revisions", "document_files",
    "audit_logs",
]);

const sqlPath = process.argv[2];
const commit = process.argv.includes("--commit");
if (!sqlPath) {
    console.error("Usage: node applyDocumentTables.mjs <path-to.sql> [--commit]");
    process.exit(1);
}

const statements = readFileSync(sqlPath, "utf8")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

// Guard: classify every statement before touching the database at all.
// Allowed shapes are only: CREATE TABLE on a new table, CREATE INDEX on a new table,
// and ADD CONSTRAINT ... FOREIGN KEY where BOTH sides are new tables. Anything else —
// any ALTER that changes a column, any DROP, any statement touching a pre-existing
// table — is rejected without a single query being sent.
const plan = statements.map((sql) => {
    const create = sql.match(/^CREATE TABLE `([^`]+)`/);
    const index = sql.match(/^CREATE (?:UNIQUE )?INDEX `[^`]+` ON `([^`]+)`/);
    const addFk = sql.match(/^ALTER TABLE `([^`]+)` ADD CONSTRAINT `[^`]+` FOREIGN KEY/);

    const table = create?.[1] ?? index?.[1] ?? addFk?.[1];
    const kind = create ? "table" : index ? "index" : addFk ? "fk" : "OTHER";

    let allowed = kind !== "OTHER" && !!table && NEW_TABLES.has(table);
    if (allowed && addFk) {
        // Every referenced table must also be new, so no existing table gains a
        // constraint and no existing row can be rejected or cascaded.
        const targets = [...sql.matchAll(/REFERENCES `([^`]+)`/g)].map((m) => m[1]);
        allowed = targets.length > 0 && targets.every((t) => NEW_TABLES.has(t));
    }
    return { sql, table, kind, allowed };
});

const rejected = plan.filter((p) => !p.allowed);
if (rejected.length) {
    console.error(`REFUSING TO RUN — ${rejected.length} statement(s) are not additive creates on new tables:`);
    for (const r of rejected) console.error(`  [${r.kind}] ${r.table ?? "?"}: ${r.sql.slice(0, 90)}`);
    process.exit(1);
}

console.log(`${plan.length} statements, all additive:`);
console.log(`  tables : ${plan.filter((p) => p.kind === "table").length}`);
console.log(`  indexes: ${plan.filter((p) => p.kind === "index").length}`);
console.log(`  fks    : ${plan.filter((p) => p.kind === "fk").length}`);

if (!commit) {
    console.log("\nDRY RUN — nothing applied. Re-run with --commit to execute.");
    process.exit(0);
}

const conn = await mysql.createConnection({ uri: process.env.DATABASE_URL });
const [[{ db }]] = await conn.query("SELECT DATABASE() AS db");
console.log(`\nApplying to ${db}\n`);

let created = 0, existed = 0;
for (const { sql, table, kind } of plan) {
    try {
        await conn.query(sql);
        created++;
        console.log(`  + ${kind.padEnd(5)} ${table}`);
    } catch (err) {
        // Already-exists is treated as success so the script is re-runnable.
        if (["ER_TABLE_EXISTS_ERROR", "ER_DUP_KEYNAME", "ER_FK_DUP_NAME", "ER_DUP_CONSTRAINT_NAME"].includes(err.code) || err.errno === 1826) {
            existed++;
            console.log(`  = ${kind.padEnd(5)} ${table} (already exists)`);
        } else {
            console.error(`\n  ! ${kind} ${table} FAILED: ${err.code} ${err.message}`);
            console.error(`    ${sql.slice(0, 200)}`);
            await conn.end();
            process.exit(1);
        }
    }
}

console.log(`\nApplied ${created}, already present ${existed}.`);
await conn.end();
