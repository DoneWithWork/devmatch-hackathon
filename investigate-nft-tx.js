const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function investigateTransaction() {
  try {
    const txDigest = "Hr9dJUugBxNKUqGnArV9ygykEHARvdtZzXnLPuZZRsVP";

    console.log("🔍 Investigating transaction...");
    console.log(`Transaction: ${txDigest}`);

    // Get transaction details
    const txResult = await client.getTransactionBlock({
      digest: txDigest,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    console.log("\n📋 Transaction Details:");
    console.log(`Status: ${txResult.effects?.status?.status}`);
    console.log(
      `Gas Used: ${JSON.stringify(txResult.effects?.gasUsed, null, 2)}`
    );

    console.log("\n🔄 Object Changes:");
    if (txResult.objectChanges) {
      txResult.objectChanges.forEach((change, index) => {
        console.log(`   Change ${index + 1}:`, {
          type: change.type,
          objectType: change.objectType,
          objectId: change.objectId,
          owner: change.owner,
        });
      });
    } else {
      console.log("   No object changes found");
    }

    console.log("\n📊 Events:");
    if (txResult.events && txResult.events.length > 0) {
      txResult.events.forEach((event, index) => {
        console.log(`   Event ${index + 1}:`, {
          type: event.type,
          packageId: event.packageId,
          transactionModule: event.transactionModule,
          sender: event.sender,
          parsedJson: event.parsedJson,
        });
      });
    } else {
      console.log("   No events found");
    }

    console.log("\n💰 Balance Changes:");
    if (txResult.balanceChanges && txResult.balanceChanges.length > 0) {
      txResult.balanceChanges.forEach((change, index) => {
        console.log(`   Change ${index + 1}:`, {
          owner: change.owner,
          coinType: change.coinType,
          amount: change.amount,
        });
      });
    } else {
      console.log("   No balance changes found");
    }

    // Check what the recipient owns after the transaction
    console.log("\n👤 Checking recipient's objects after transaction...");
    const recipientAddress =
      "0x218479b384de6d7a1f08ae13309a8ff79e23560a38ec55d68f763e998e4081dc";

    const objects = await client.getOwnedObjects({
      owner: recipientAddress,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
      },
    });

    console.log(`📦 Recipient owns ${objects.data.length} objects:`);
    objects.data.forEach((obj, index) => {
      console.log(`   Object ${index + 1}:`, {
        objectId: obj.data?.objectId,
        type: obj.data?.type,
        owner: obj.data?.owner,
      });
    });
  } catch (error) {
    console.error("❌ Error investigating transaction:", error);
  }
}

investigateTransaction();
