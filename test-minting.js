const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function findCertificateFromTransaction() {
  try {
    console.log("🔍 Looking up certificate transaction details...");

    const txDigest = "4sNqmiTCbcQtDuKjMKNgJWBUZWCkAfAnmMac85uaCgiD";

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

    console.log("📋 Transaction object changes:");
    if (txResult.objectChanges) {
      txResult.objectChanges.forEach((change, index) => {
        console.log(`  ${index + 1}. ${change.type} - ${change.objectType}`);
        if (change.objectId) {
          console.log(`     Object ID: ${change.objectId}`);
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

    // Look for certificate registry to find the certificate
    const registryId =
      "0xd6b8beb3e9c1a6c4a3a836356a672338db326859b6d18eb74be6f10930af6669";

    console.log(
      "\n🗂️ Checking certificate registry for issued certificates..."
    );

    const registryObject = await client.getObject({
      id: registryId,
      options: {
        showContent: true,
        showType: true,
      },
    });

    console.log("📊 Registry object:", JSON.stringify(registryObject, null, 2));

    // Get dynamic fields of the registry to find certificates
    console.log("\n🔍 Getting dynamic fields from registry...");
    const dynamicFields = await client.getDynamicFields({
      parentId: registryId,
    });

    console.log("📝 Dynamic fields count:", dynamicFields.data.length);

    for (const field of dynamicFields.data) {
      console.log(`  Field: ${field.name.value} -> ${field.objectId}`);

      // Get the actual certificate object
      const certObject = await client.getObject({
        id: field.objectId,
        options: {
          showContent: true,
          showType: true,
        },
      });

      if (certObject.data.content && certObject.data.content.fields) {
        const cert = certObject.data.content.fields;
        console.log(`    Certificate details:`, {
          id: field.objectId,
          recipient: cert.recipient_address,
          issuer: cert.issuer_address,
          templateId: cert.template_id,
          isMinted: cert.is_minted,
          isRevoked: cert.is_revoked,
        });

        // Check if this matches our recipient
        if (
          cert.recipient_address ===
          "0x9f8e7d6c5b4a39281f6e5d4c3b2a19087f6e5d4c3b2a19087f6e5d4c3b2a1908"
        ) {
          console.log(`\n🎯 FOUND MATCHING CERTIFICATE!`);
          console.log(`   Certificate Object ID: ${field.objectId}`);
          console.log(
            `   Can be minted: ${!cert.is_minted && !cert.is_revoked}`
          );
          return field.objectId;
        }
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

findCertificateFromTransaction().then((certId) => {
  if (certId) {
    console.log(`\n✅ Certificate ready for minting: ${certId}`);
    console.log(`📱 Use this in the minting API call`);
  } else {
    console.log(`\n❌ Certificate not found`);
  }
});
