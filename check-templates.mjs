import { db } from "./src/db/db.ts";
import { certificateTemplates } from "./src/db/schema.ts";

async function checkTemplates() {
  try {
    const templates = await db.select().from(certificateTemplates).limit(5);
    console.log("📋 Available Templates (" + templates.length + " found):");
    templates.forEach((t, i) => {
      console.log(i + 1 + ". ID: " + t.id);
      console.log("   Name: " + t.name);
      console.log("   Template URL (onChainId): " + t.templateUrl);
      console.log("   Fields: " + JSON.stringify(t.fields));
      console.log("   Created: " + t.createdAt);
      console.log("   ---");
    });
  } catch (error) {
    console.error("❌ Error:", error);
  }
  process.exit(0);
}

checkTemplates();
