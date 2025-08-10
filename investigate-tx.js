const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function investigateTransaction() {
  try {
    console.log("🔍 Investigating certificate issuance transaction...");

    const txDigest = "3Cigj96H18jCs8Cqr5n9HGJ3EonPJQ6oCofJA7ZsNi5U";

    // Get transaction details
    const txResult = await client.getTransactionBlock({
      digest: txDigest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    console.log("📋 Transaction Input:");
    console.log(JSON.stringify(txResult.transaction, null, 2));

    console.log("\n📋 Transaction object changes:");
    if (txResult.objectChanges) {
      txResult.objectChanges.forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.type} - ${change.objectType}`);
        if (change.objectId) {
          console.log(`     Object ID: ${change.objectId}`);
        }
        if (change.type === "created") {
          console.log(`     Owner: ${JSON.stringify(change.owner)}`);
        }
      });
    }

    console.log("\n🎯 Transaction events:");
    if (txResult.events) {
      txResult.events.forEach((event, index) => {
        console.log(`  ${index + 1}. ${event.type}`);
        if (event.parsedJson) {
          console.log(`     Data:`, event.parsedJson);
        }
      });
    }

    // Look for any created certificate objects
    const createdObjects =
      txResult.objectChanges?.filter((change) => change.type === "created") ||
      [];
    console.log(`\n📦 Created objects: ${createdObjects.length}`);

    for (const created of createdObjects) {
      if (created.objectType?.includes("IssuedCertificate")) {
        console.log(`\n🎓 Found IssuedCertificate!`);
        console.log(`   Object ID: ${created.objectId}`);
        console.log(`   Owner: ${JSON.stringify(created.owner)}`);

        // Get the certificate details
        const certObject = await client.getObject({
          id: created.objectId,
          options: {
            showContent: true,
            showType: true,
            showOwner: true,
          },
        });

        console.log(`   Certificate details:`, certObject.data.content);
        return created.objectId;
      }
    }

    console.log("\n❌ No IssuedCertificate object found in created objects");
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

investigateTransaction();
