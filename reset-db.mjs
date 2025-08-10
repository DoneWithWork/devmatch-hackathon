import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

async function resetDatabase() {
  try {
    console.log("Dropping all tables...");

    // Get all table names
    const tables = await sql`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public'
    `;

    console.log(
      "Tables found:",
      tables.map((t) => t.tablename)
    );

    // Drop all tables
    for (const table of tables) {
      console.log(`Dropping table: ${table.tablename}`);
      await sql`DROP TABLE IF EXISTS ${sql.unsafe(
        '"' + table.tablename + '"'
      )} CASCADE`;
      console.log(`Dropped table: ${table.tablename}`);
    }

    // Drop all types
    const types = await sql`
      SELECT typname FROM pg_type 
      WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND typtype = 'e'
    `;

    console.log(
      "Types found:",
      types.map((t) => t.typname)
    );

    for (const type of types) {
      console.log(`Dropping type: ${type.typname}`);
      await sql`DROP TYPE IF EXISTS ${sql.unsafe(
        '"' + type.typname + '"'
      )} CASCADE`;
      console.log(`Dropped type: ${type.typname}`);
    }

    console.log("Database reset complete!");
  } catch (error) {
    console.error("Reset failed:", error);
  }
}

resetDatabase();
