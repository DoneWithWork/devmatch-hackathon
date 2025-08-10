const { Client } = require("pg");

const client = new Client({
  connectionString:
    "postgresql://neondb_owner:npg_83VkRpwizojb@ep-cold-pine-a1e7ylfe-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require",
});

async function fixDatabase() {
  try {
    await client.connect();
    console.log("Connected to database");

    // Check if column exists
    const checkColumn = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'application' AND column_name = 'issuer_cap_id'
    `);

    console.log("Column check result:", checkColumn.rows);

    if (checkColumn.rows.length > 0) {
      console.log("issuer_cap_id column exists, removing it...");
      await client.query(
        'ALTER TABLE "application" DROP COLUMN "issuer_cap_id"'
      );
      console.log("Column removed successfully");
    } else {
      console.log("issuer_cap_id column does not exist");
    }

    // Check current table structure
    const columns = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'application'
      ORDER BY ordinal_position
    `);

    console.log("Current table structure:");
    columns.rows.forEach((row) => {
      console.log(`- ${row.column_name}: ${row.data_type}`);
    });
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await client.end();
  }
}

fixDatabase();
