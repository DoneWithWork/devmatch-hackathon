import { db } from "./src/db/db.js";
import { issuerApplication } from "./src/db/schema.js";

async function testDatabase() {
  try {
    console.log("Testing database connection and schema...");

    // Try a simple select all
    const result = await db.select().from(issuerApplication).limit(1);
    console.log("Query result:", JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error:", error);
  }
}

testDatabase();
