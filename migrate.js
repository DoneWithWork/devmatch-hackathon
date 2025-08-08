const { neon } = require("@neondatabase/serverless");

const sql = neon(process.env.DATABASE_URL);

async function addColumns() {
  try {
    console.log("Adding issuerCapId column...");
    await sql`ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "issuerCapId" text`;

    console.log("Adding transactionDigest column...");
    await sql`ALTER TABLE "application" ADD COLUMN IF NOT EXISTS "transactionDigest" text`;

    console.log("Migration completed successfully!");
  } catch (error) {
    console.error("Migration failed:", error);
  }
}

addColumns();
