/**
 * Minimal mysqldump replacement — Hostinger MySQL is remote and there is no local
 * mysql client. Writes schema + data for every table to backups/<db>-<timestamp>.sql.
 *
 * Usage:  node server/scripts/dumpDatabase.mjs [outputDir]
 *
 * Intended as the "take a backup first" step before any drizzle-kit push. Output
 * contains customer data, so backups/ is gitignored — keep it that way.
 */
import mysql from "mysql2/promise";
import dotenv from "dotenv";
import { mkdirSync, createWriteStream } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const serverRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(serverRoot, ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
    console.error("DATABASE_URL is not set (expected in server/.env)");
    process.exit(1);
}

const outDir = process.argv[2] || resolve(serverRoot, "..", "backups");
mkdirSync(outDir, { recursive: true });

const conn = await mysql.createConnection({ uri: url, multipleStatements: false });
const [[{ db }]] = await conn.query("SELECT DATABASE() AS db");

const stamp = new Date().toISOString().replace(/[:.]/g, "").replace("T", "-").slice(0, 15);
const outPath = resolve(outDir, `${db}-${stamp}.sql`);
const out = createWriteStream(outPath, { encoding: "utf8" });
const write = (s) => new Promise((res) => (out.write(s) ? res() : out.once("drain", res)));

const [tableRows] = await conn.query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
const tables = tableRows.map((r) => Object.values(r)[0]).sort();

await write(`-- Dump of \`${db}\` at ${new Date().toISOString()}\n`);
await write(`-- ${tables.length} tables\n`);
await write("SET FOREIGN_KEY_CHECKS=0;\nSET NAMES utf8mb4;\n\n");

let totalRows = 0;
for (const table of tables) {
    const [[createRow]] = await conn.query(`SHOW CREATE TABLE \`${table}\``);
    const createSql = createRow["Create Table"];

    await write(`\n-- ----------  ${table}  ----------\n`);
    await write(`DROP TABLE IF EXISTS \`${table}\`;\n${createSql};\n`);

    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    if (rows.length) {
        const columns = Object.keys(rows[0]);
        const colList = columns.map((c) => `\`${c}\``).join(", ");
        // Chunked multi-row INSERTs keep the file small without huge single statements.
        for (let i = 0; i < rows.length; i += 100) {
            const values = rows.slice(i, i + 100)
                .map((row) => `(${columns.map((c) => conn.escape(row[c])).join(", ")})`)
                .join(",\n  ");
            await write(`INSERT INTO \`${table}\` (${colList}) VALUES\n  ${values};\n`);
        }
    }
    totalRows += rows.length;
    console.log(`  ${table.padEnd(28)} ${String(rows.length).padStart(6)} rows`);
}

await write("\nSET FOREIGN_KEY_CHECKS=1;\n");
await new Promise((res) => out.end(res));
await conn.end();

console.log(`\nDatabase : ${db}`);
console.log(`Tables   : ${tables.length}`);
console.log(`Rows     : ${totalRows}`);
console.log(`Written  : ${outPath}`);
