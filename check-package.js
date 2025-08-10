const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function checkPackage() {
  try {
    // Check our package ID from environment
    const packageId =
      "0x7886b33c1091ee2e8427713a883f0f3479ef39745adc797f0dad3da1ded6f7b7"; // From .env.local

    console.log("🔍 Checking package details...");
    console.log(`Package ID: ${packageId}`);

    try {
      const packageInfo = await client.getObject({
        id: packageId,
        options: {
          showContent: true,
          showType: true,
          showOwner: true,
        },
      });

      console.log("\n📦 Package Info:");
      console.log(`Type: ${packageInfo.data?.type}`);
      console.log(`Owner: ${JSON.stringify(packageInfo.data?.owner)}`);

      if (packageInfo.data?.content) {
        console.log(`Content type: ${packageInfo.data.content.dataType}`);
      }
    } catch (error) {
      console.log("❌ Failed to get package info:", error.message);
    }

    // Try to call the function to see what error we get
    console.log("\n🧪 Testing function call (will fail but show error)...");

    const { Transaction } = require("@mysten/sui/transactions");
    const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");

    // Use admin key for testing
    const adminPrivateKey =
      "suiprivkey1qquqnrlzdx5etv0m3g3vt72g8e9kghyp6rumk0hgrhhee42clyugx0ujf2m";
    const keyWithoutPrefix = adminPrivateKey.slice(11);
    const keyBytes = Buffer.from(keyWithoutPrefix, "base64");
    const privateKeyBytes = keyBytes.slice(1, 33);
    const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);

    const txb = new Transaction();

    try {
      txb.moveCall({
        target: `${packageId}::simple_nft::mint_nft_optimized`,
        arguments: [
          txb.pure(new Uint8Array(new TextEncoder().encode("Test NFT"))),
          txb.pure(
            new Uint8Array(new TextEncoder().encode("Test Description"))
          ),
          txb.pure(
            new Uint8Array(
              new TextEncoder().encode("https://test.com/image.png")
            )
          ),
          txb.pure.address(
            "0x218479b384de6d7a1f08ae13309a8ff79e23560a38ec55d68f763e998e4081dc"
          ),
        ],
      });

      console.log("✅ Function call setup successful - target exists");

      // Try to actually execute to see the error
      try {
        const result = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: txb,
          options: {
            showEffects: true,
            showEvents: true,
            showObjectChanges: true,
          },
        });

        console.log("🎉 Transaction successful:", result.digest);
        console.log("Status:", result.effects?.status?.status);
      } catch (execError) {
        console.log("❌ Execution error:", execError.message);

        // Check if it's a gas issue
        if (execError.message.includes("gas")) {
          console.log("💡 This looks like a gas payment issue");
        }

        // Check if it's a function not found issue
        if (
          execError.message.includes("function") ||
          execError.message.includes("module")
        ) {
          console.log("💡 This looks like a function/module not found issue");
        }
      }
    } catch (setupError) {
      console.log("❌ Function setup error:", setupError.message);
      console.log("💡 This suggests the function doesn't exist in the package");
    }
  } catch (error) {
    console.error("❌ Error checking package:", error);
  }
}

checkPackage();
