import { config } from "dotenv";
import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypai        tx.moveCall({
          target: `${packageId}::issuer::create_issuer_capability`,
          arguments: [
            tx.object(adminCapId),
            tx.pure.string(app.organization_name),
            tx.pure.string(app.contact_email || ''),
            tx.pure.address(app.user_address), // Use the wallet address from users table
          ],
        });9";
import { fromBase64 } from "@mysten/sui/utils";
import { Transaction } from "@mysten/sui/transactions";
import { neon } from "@neondatabase/serverless";

// Load environment variables from .env.local
config({ path: ".env.local" });

// Initialize database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is required");
}
const sql = neon(connectionString);

// Initialize Sui client
const rpcUrl =
  process.env.NEXT_PUBLIC_SUI_RPC_URL || "https://fullnode.devnet.sui.io:443";
const client = new SuiClient({ url: rpcUrl });

async function createNewIssuerCapabilities() {
  console.log(
    "🔄 Creating new issuer capabilities for problematic applications..."
  );

  const newAdminAddress = process.env.ADMIN_ADDRESS;
  console.log(`🎯 New Admin Address: ${newAdminAddress}`);

  // Get the problematic applications
  const problematicIssuerCaps = [
    "0x91f7510f880bbc3f769bdaa9d73f7b98c70cc6e50685d6ef6398791603d59528",
    "0xd74200e0d00c42f7c46a886dd25763671e0dc846b65ab345cba02d22e3cf2a6f",
  ];

  console.log(
    "\n🔍 Finding applications that need new issuer capabilities...\n"
  );

  // Query the database for applications with these issuer cap IDs
  const applications = await sql`
    SELECT a.id, a.organization_name, a.issuer_cap_id, a.transaction_digest, a.status, 
           a.applicant_id, a.contact_email, u.user_address
    FROM application a
    JOIN users u ON a.applicant_id = u.id
    WHERE a.issuer_cap_id = ANY(${problematicIssuerCaps})
    AND a.status = 'pending'
  `;

  console.log(
    `Found ${applications.length} applications that need new issuer capabilities:`
  );
  applications.forEach((app) => {
    console.log(
      `- ID: ${app.id}, Org: ${app.organization_name}, IssuerCap: ${app.issuer_cap_id}`
    );
    console.log(
      `  Applicant: ${app.applicant_id}, Email: ${app.contact_email}`
    );
  });

  if (applications.length === 0) {
    console.log(
      "✅ No pending applications found with the problematic issuer cap IDs"
    );
    return;
  }

  try {
    const packageId =
      process.env.NEXT_PUBLIC_PACKAGE_ID || process.env.PACKAGE_ID;
    const adminCapId =
      process.env.NEXT_PUBLIC_ADMIN_CAP || process.env.ADMIN_CAP;
    const privateKey =
      process.env.SUI_PRIVATE_KEY ||
      process.env.ADMIN_PRIVATE_KEY ||
      process.env.PRIVATE_KEY;

    if (!packageId || !adminCapId || !privateKey) {
      throw new Error(`Missing required environment variables:
        PACKAGE_ID: ${packageId ? "✓" : "✗"}
        ADMIN_CAP: ${adminCapId ? "✓" : "✗"} 
        PRIVATE_KEY: ${privateKey ? "✓" : "✗"}`);
    }

    // Create keypair from private key
    let keypair;
    if (privateKey.startsWith("suiprivkey1")) {
      console.log("🔐 Processing Sui private key format...");
      try {
        // Method 1: Try SDK direct import
        keypair = Ed25519Keypair.fromSecretKey(privateKey);
        console.log("✅ SDK direct import worked");
      } catch (sdkError) {
        console.log("❌ SDK direct import failed:", sdkError.message);
        try {
          // Method 2: Try decoding and using as-is
          const fullDecoded = fromBase64(privateKey.slice(11));
          keypair = Ed25519Keypair.fromSecretKey(fullDecoded);
          console.log("✅ Full decoded import worked");
        } catch (fullError) {
          console.log("❌ Full decoded import failed:", fullError.message);
          // Method 3: Manual parsing (fallback)
          const decoded = fromBase64(privateKey.slice(11));
          const privateKeyBytes = decoded.slice(1, 33); // Skip flag, take 32 bytes
          keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          console.log("✅ Using manual parsing as fallback");
        }
      }
    } else {
      keypair = Ed25519Keypair.fromSecretKey(fromBase64(privateKey));
    }

    const derivedAddress = keypair.getPublicKey().toSuiAddress();

    console.log(`\n🔑 Derived address from private key: ${derivedAddress}`);
    console.log(`🎯 Expected admin address: ${newAdminAddress}`);
    console.log(`✅ Address match: ${derivedAddress === newAdminAddress}\n`);

    if (derivedAddress !== newAdminAddress) {
      throw new Error("Private key does not match the expected admin address!");
    }

    for (const app of applications) {
      console.log(
        `🔄 Processing application ID ${app.id} (${app.organization_name})...`
      );

      try {
        // Create new issuer capability
        const tx = new Transaction();

        tx.moveCall({
          target: `${packageId}::issuer::create_issuer_capability`,
          arguments: [
            tx.object(adminCapId),
            tx.pure.string(app.organization_name),
            tx.pure.string(app.contact_email || ""),
            tx.pure.address(app.applicant_id),
          ],
        });

        // Execute transaction
        console.log("  📡 Executing blockchain transaction...");
        const result = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: tx,
          options: {
            showEffects: true,
            showObjectChanges: true,
          },
        });

        if (result.effects?.status?.status === "success") {
          // Find the new issuer capability object
          const createdObjects = result.objectChanges?.filter(
            (change) =>
              change.type === "created" &&
              change.objectType?.includes("issuer::IssuerCap")
          );

          if (createdObjects && createdObjects.length > 0) {
            const newIssuerCapId = createdObjects[0].objectId;
            const newTransactionDigest = result.digest;

            console.log(
              `  ✅ Created new issuer capability: ${newIssuerCapId}`
            );
            console.log(`  📝 Transaction digest: ${newTransactionDigest}`);

            // Update the database
            await sql`
              UPDATE application 
              SET issuer_cap_id = ${newIssuerCapId}, transaction_digest = ${newTransactionDigest}, update_at = NOW()
              WHERE id = ${app.id}
            `;
            console.log(`  ✅ Updated application ${app.id} in database`);

            // Verify the new object ownership
            const objectInfo = await client.getObject({
              id: newIssuerCapId,
              options: { showOwner: true },
            });

            if (
              objectInfo.data?.owner &&
              typeof objectInfo.data.owner === "object" &&
              "AddressOwner" in objectInfo.data.owner
            ) {
              const ownerAddress = objectInfo.data.owner.AddressOwner;
              console.log(`  🔍 New object owner: ${ownerAddress}`);
              console.log(
                `  ✅ Ownership verification: ${
                  ownerAddress === newAdminAddress ? "CORRECT" : "WRONG"
                }`
              );
            }
          } else {
            console.log(
              `  ❌ No issuer capability found in transaction result`
            );
            console.log(
              `  🔍 Object changes:`,
              JSON.stringify(result.objectChanges, null, 2)
            );
          }
        } else {
          console.log(`  ❌ Transaction failed:`, result.effects?.status);
        }
      } catch (error) {
        console.error(
          `  ❌ Error processing application ${app.id}:`,
          error.message
        );
      }

      console.log(""); // Add spacing between applications
    }
  } catch (error) {
    console.error("❌ Error in solution process:", error.message);
    return;
  }

  console.log("🎯 NEXT STEPS:");
  console.log(
    "1. The applications now have new issuer capabilities owned by your admin address"
  );
  console.log(
    "2. Try approving the applications again through the admin interface"
  );
  console.log(
    "3. The old issuer capability objects will become orphaned but harmless"
  );
  console.log("4. You can verify the fix by checking the admin panel");
}

createNewIssuerCapabilities().catch(console.error);
