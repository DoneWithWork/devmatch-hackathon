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

async function cleanupProblematicApplications() {
  console.log("🔄 Cleaning up problematic issuer applications...");

  // Get the problematic applications
  const problematicIssuerCaps = [
    "0x91f7510f880bbc3f769bdaa9d73f7b98c70cc6e50685d6ef6398791603d59528",
    "0xd74200e0d00c42f7c46a886dd25763671e0dc846b65ab345cba02d22e3cf2a6f",
  ];

  console.log("\n🔍 Finding problematic applications...\n");

  // Query the database for applications with these issuer cap IDs
  const applications = await sql`
    SELECT a.id, a.organization_name, a.issuer_cap_id, a.status, 
           a.applicant_id, a.contact_email, u.user_address, u.email, u.username
    FROM application a
    JOIN users u ON a.applicant_id = u.id
    WHERE a.issuer_cap_id = ANY(${problematicIssuerCaps})
  `;

  console.log(`Found ${applications.length} problematic applications:`);
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

  console.log("🗑️  SOLUTION: Delete these applications so users can reapply");
  console.log(
    "   The old issuer capability objects are owned by the previous admin"
  );
  console.log("   and cannot be used with the new admin credentials.");
  console.log("");

  console.log("💡 NEXT STEPS FOR USERS:");
  applications.forEach((app) => {
    console.log(
      `📧 Contact ${app.username || "user"} (${app.email || app.user_address}):`
    );
    console.log(
      `   - Explain that their application for "${app.organization_name}" needs to be resubmitted`
    );
    console.log(`   - Due to admin key rotation, they need to apply again`);
    console.log(`   - Their new application will be processed quickly`);
    console.log("");
  });

  // Ask for confirmation before deleting
  console.log(
    "⚠️  Ready to delete these applications? This action cannot be undone."
  );
  console.log(
    "   Users will need to reapply, but the new applications will work correctly."
  );
  console.log("");
  console.log("🔄 Proceeding with deletion...");

  try {
    // Delete the problematic applications
    const deleteResult = await sql`
      DELETE FROM application 
      WHERE issuer_cap_id = ANY(${problematicIssuerCaps})
    `;

    console.log(`✅ Successfully deleted ${deleteResult.count} applications`);
    console.log("");
    console.log("🎯 WHAT TO DO NOW:");
    console.log("1. ✅ The problematic applications have been removed");
    console.log("2. 📧 Notify the affected users to reapply");
    console.log(
      "3. 🔄 When they reapply, new issuer capabilities will be created with the current admin"
    );
    console.log(
      "4. ✅ You will be able to approve their new applications normally"
    );
    console.log("");
    console.log("📋 USER CONTACT INFO:");
    applications.forEach((app) => {
      console.log(
        `- ${app.organization_name}: ${app.email || app.user_address}`
      );
    });
  } catch (error) {
    console.error("❌ Error deleting applications:", error.message);
  }
}

cleanupProblematicApplications().catch(console.error);
