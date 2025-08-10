import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
const sql = neon(connectionString);

async function cleanupNewProblematicApplication() {
  console.log("🔄 Cleaning up new problematic issuer application...");

  // The new problematic issuer cap ID from the latest error
  const problematicIssuerCapId =
    "0x3cd0fd5f604204a00905c4fd2fcd9a91b1d50275835b2b6bef3437b3ec3f5ac6";

  console.log("\n🔍 Finding application with problematic IssuerCap...\n");

  // Query the database for the application with this issuer cap ID
  const applications = await sql`
    SELECT a.id, a.organization_name, a.issuer_cap_id, a.status, 
           a.applicant_id, a.contact_email, u.user_address, u.email, u.username
    FROM application a
    JOIN users u ON a.applicant_id = u.id
    WHERE a.issuer_cap_id = ${problematicIssuerCapId}
  `;

  console.log(`Found ${applications.length} problematic application:`);
  applications.forEach((app) => {
    console.log(
      `- ID: ${app.id}, Org: ${app.organization_name}, Status: ${app.status}`
    );
    console.log(
      `  User: ${app.username || "No username"} (${app.email || "No email"})`
    );
    console.log(`  Wallet: ${app.user_address}`);
    console.log(`  IssuerCap: ${app.issuer_cap_id}`);
    console.log("");
  });

  if (applications.length === 0) {
    console.log("✅ No problematic applications found");
    return;
  }

  console.log(
    "🗑️  Deleting this application so user can reapply with the fixed process..."
  );

  try {
    // Delete the problematic application
    const deleteResult = await sql`
      DELETE FROM application 
      WHERE issuer_cap_id = ${problematicIssuerCapId}
    `;

    console.log(`✅ Successfully deleted the problematic application`);
    console.log("");
    console.log("🎯 RESULT:");
    console.log("1. ✅ The problematic application has been removed");
    console.log("2. 📧 User can now reapply using the fixed process");
    console.log("3. 🔄 New applications will not have ownership issues");
    console.log("4. ✅ Admin can approve new applications normally");
  } catch (error) {
    console.error("❌ Error deleting application:", error.message);
  }
}

cleanupNewProblematicApplication().catch(console.error);
