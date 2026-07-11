
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres"; // direct postgres usage for list tables
import * as dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString);

async function main() {
    try {
        console.log("Connecting to database...");
        const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

        console.log("Tables in database:");
        tables.forEach(row => {
            console.log(`- ${row.table_name}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error connecting to database:", error);
        process.exit(1);
    }
}

main();
