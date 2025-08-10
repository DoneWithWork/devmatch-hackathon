const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function findRecipientCertificates() {
  try {
    console.log("🔍 Looking for certificates owned by recipient...");

    const recipientAddress =
      "0x9f8e7d6c5b4a39281f6e5d4c3b2a19087f6e5d4c3b2a19087f6e5d4c3b2a1908";
    const packageId =
      "0x7886b33c1091ee2e8427713a883f0f3479ef39745adc797f0dad3da1ded6f7b7";

    console.log(`👤 Recipient: ${recipientAddress}`);

    // Get all objects owned by the recipient
    const ownedObjects = await client.getOwnedObjects({
      owner: recipientAddress,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
      },
    });

    console.log(`📦 Total objects owned: ${ownedObjects.data.length}`);

    // Filter for certificate objects
    const certificates = ownedObjects.data.filter((obj) =>
      obj.data?.type?.includes("IssuedCertificate")
    );

    console.log(`🎓 Certificates found: ${certificates.length}`);

    for (const cert of certificates) {
      console.log(`\n📜 Certificate Object ID: ${cert.data.objectId}`);
      console.log(`   Type: ${cert.data.type}`);

      if (cert.data.content && cert.data.content.fields) {
        const fields = cert.data.content.fields;
        console.log(`   Template ID: ${fields.template_id}`);
        console.log(`   Issuer: ${fields.issuer_address}`);
        console.log(`   Recipient: ${fields.recipient_address}`);
        console.log(`   Issued At: ${fields.issued_at}`);
        console.log(`   Is Minted: ${fields.is_minted}`);
        console.log(`   Is Revoked: ${fields.is_revoked}`);
        console.log(`   Certificate Hash: ${fields.certificate_hash}`);

        // Check if this certificate is ready for minting
        if (!fields.is_minted && !fields.is_revoked) {
          console.log(`\n🎯 READY FOR MINTING!`);
          console.log(`   Certificate ID: ${cert.data.objectId}`);
          return cert.data.objectId;
        }
      }
    }

    // Also check for any coin objects (SUI balance)
    const coinObjects = ownedObjects.data.filter((obj) =>
      obj.data?.type?.includes("coin::Coin")
    );

    if (coinObjects.length > 0) {
      console.log(
        `\n💰 Recipient also owns ${coinObjects.length} coin object(s)`
      );
      let totalBalance = 0;
      for (const coin of coinObjects) {
        if (coin.data.content && coin.data.content.fields) {
          const balance = parseInt(coin.data.content.fields.balance);
          totalBalance += balance;
        }
      }
      console.log(`   Total SUI balance: ${totalBalance / 1_000_000_000} SUI`);
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

findRecipientCertificates().then((certId) => {
  if (certId) {
    console.log(`\n✅ Certificate ready for minting: ${certId}`);
    console.log(`📱 Use this ID in the minting API endpoint`);
    console.log(`🔗 Minting endpoint: POST /api/user/mint-certificate`);
    console.log(`📋 Required body: {`);
    console.log(`     "certificateId": "${certId}",`);
    console.log(
      `     "userAddress": "0x9f8e7d6c5b4a39281f6e5d4c3b2a19087f6e5d4c3b2a19087f6e5d4c3b2a1908",`
    );
    console.log(`     "userPrivateKey": "RECIPIENT_PRIVATE_KEY"`);
    console.log(`   }`);
  } else {
    console.log(`\n❌ No certificates ready for minting found`);
  }
});
