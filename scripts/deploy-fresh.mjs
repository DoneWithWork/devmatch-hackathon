import { execSync } from "child_process";
import { writeFileSync } from "fs";
import path from "path";

// Configuration - UPDATE THESE WITH YOUR NEW CREDENTIALS
const NEW_PRIVATE_KEY =
  "suiprivkey1qquqnrlzdx5etv0m3g3vt72g8e9kghyp6rumk0hgrhhee42clyugx0ujf2m";
const NEW_ADDRESS =
  "0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798";

async function deployFreshContracts() {
  try {
    console.log("🚀 Starting fresh smart contract deployment...");

    // Validate inputs
    if (
      NEW_PRIVATE_KEY === "YOUR_NEW_PRIVATE_KEY_HERE" ||
      NEW_ADDRESS === "YOUR_NEW_ADDRESS_HERE"
    ) {
      console.error(
        "❌ Please update NEW_PRIVATE_KEY and NEW_ADDRESS in this script first!"
      );
      process.exit(1);
    }

    // Change to contracts directory
    process.chdir("sui/contracts");
    console.log("📁 Changed to contracts directory");

    // Clean previous builds
    console.log("🧹 Cleaning previous builds...");
    try {
      execSync(
        'powershell.exe -Command "Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue"',
        { stdio: "inherit" }
      );
    } catch (e) {
      // Ignore errors, directory might not exist
    }

    // Build contracts
    console.log("🔨 Building smart contracts...");
    execSync("sui move build", { stdio: "inherit" });

    // Deploy contracts
    console.log("📦 Deploying smart contracts to Sui devnet...");
    const deploymentOutput = execSync(
      "sui client publish --gas-budget 100000000 --json",
      {
        encoding: "utf8",
      }
    );

    const deployment = JSON.parse(deploymentOutput);

    // Extract addresses
    const packageId = deployment.objectChanges.find(
      (change) => change.type === "published"
    )?.packageId;
    const adminCap = deployment.objectChanges.find((change) =>
      change.objectType?.includes("AdminCap")
    )?.objectId;
    const issuerRegistry = deployment.objectChanges.find((change) =>
      change.objectType?.includes("IssuerRegistry")
    )?.objectId;
    const certificateRegistry = deployment.objectChanges.find((change) =>
      change.objectType?.includes("CertificateRegistry")
    )?.objectId;

    console.log("\n📋 Important Contract Addresses:");
    console.log(`PACKAGE_ID=${packageId}`);
    console.log(`ADMIN_CAP=${adminCap}`);
    console.log(`ISSUER_REGISTRY=${issuerRegistry}`);
    console.log(`CERTIFICATE_REGISTRY=${certificateRegistry}`);

    // Create environment file content
    const envContent = `# Fresh deployment environment variables
# Generated on ${new Date().toISOString()}

# =================================================================
# SUI BLOCKCHAIN CONFIGURATION - NEW DEPLOYMENT
# =================================================================
SUI_PRIVATE_KEY=${NEW_PRIVATE_KEY}
SUI_WALLET_ADDRESS=${NEW_ADDRESS}
SUI_ADDRESS=${NEW_ADDRESS}
ADMIN_PRIVATE_KEY=${NEW_PRIVATE_KEY}

# Deployed smart contract addresses
SUI_PACKAGE_ID=${packageId}
PACKAGE_ID=${packageId}
ADMIN_CAP=${adminCap}
ISSUER_REGISTRY=${issuerRegistry}
CERTIFICATE_REGISTRY=${certificateRegistry}
NETWORK=devnet

# =================================================================
# DATABASE CONFIGURATION
# =================================================================
# Keep your existing DATABASE_URL and other settings
`;

    // Save to file
    writeFileSync(".env.deployment", envContent);

    console.log("\n✅ Deployment complete!");
    console.log("📂 Contract addresses saved to sui/contracts/.env.deployment");
    console.log("\n⚠️  Next steps:");
    console.log("1. Copy the content from sui/contracts/.env.deployment");
    console.log("2. Update your main .env.local file with the new values");
    console.log(
      "3. Keep your existing DATABASE_URL and other non-blockchain settings"
    );
    console.log("4. Restart your application");

    return {
      success: true,
      packageId,
      adminCap,
      issuerRegistry,
      certificateRegistry,
      transactionDigest: deployment.digest,
    };
  } catch (error) {
    console.error("❌ Deployment failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Run deployment
deployFreshContracts();
