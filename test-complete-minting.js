const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

async function testMintingWorkflow() {
  try {
    console.log("🚀 Starting Minting Workflow Test");
    console.log("============================================================");

    // Step 1: Generate a real recipient keypair
    console.log("\n👤 STEP 1: Generate Recipient Keypair");
    const recipientKeypair = new Ed25519Keypair();
    const recipientAddress = recipientKeypair.getPublicKey().toSuiAddress();
    const recipientPrivateKey = recipientKeypair.getSecretKey();

    console.log(`📍 Recipient Address: ${recipientAddress}`);
    console.log(
      `🔑 Recipient Private Key: ${Buffer.from(recipientPrivateKey).toString(
        "hex"
      )}`
    );

    // Step 2: Fund the recipient with some SUI for gas (optional, since user pays)
    console.log("\n💰 STEP 2: Check if recipient needs funding...");

    try {
      const balance = await client.getBalance({
        owner: recipientAddress,
      });
      console.log(`   Current balance: ${balance.totalBalance} MIST`);

      if (parseInt(balance.totalBalance) < 50_000_000) {
        // Less than 0.05 SUI
        console.log("   ⚠️ Recipient needs funding for gas costs");
        console.log(
          "   💡 In production, recipient would connect wallet or receive SUI"
        );
      }
    } catch (e) {
      console.log("   📝 New address with zero balance");
    }

    // Step 3: Issue a certificate to this recipient
    console.log("\n📜 STEP 3: Issue Certificate to Recipient");

    const issueResponse = await fetch(
      "http://localhost:3000/api/issuer/issue-certificate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId:
            "0xf8dcde2931a0a30301834387150b9cd522b6668e32849c72d30efe3f5211952d", // From previous test
          recipientAddress: recipientAddress, // Use the real recipient address
          walletAddress:
            "0x4bf1977b1e44b76afdeac4e5190c8da91a6a95a108c5026cbde02123e1afdb0b", // Issuer address
          issuerPrivateKey:
            "suiprivkey1qp8996l5rwn92jsncek9vmzmjmhdwr223s6p2lmv68rdau7f668e6upqfjt", // Issuer private key
          fieldData: {
            participantName: "Alice Johnson",
            hackathonName: "DevMatch 2025 Minting Test",
            completionDate: "2025-08-10",
            achievements: "Successfully implemented NFT minting functionality",
            mentorSignature: "Prof. Smart Contract",
          },
        }),
      }
    );

    const issueResult = await issueResponse.json();
    console.log(`📥 Issue Response (${issueResponse.status}):`, issueResult);

    if (!issueResult.success) {
      throw new Error(`Certificate issuance failed: ${issueResult.error}`);
    }

    console.log("✅ Certificate issued successfully!");
    console.log(`🎯 Transaction: ${issueResult.transactionDigest}`);

    // Step 4: Find the certificate object
    console.log("\n🔍 STEP 4: Find Certificate Object");

    await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for blockchain confirmation

    const ownedObjects = await client.getOwnedObjects({
      owner: recipientAddress,
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
      },
    });

    console.log(`📦 Recipient owns ${ownedObjects.data.length} objects`);

    const certificates = ownedObjects.data.filter((obj) =>
      obj.data?.type?.includes("IssuedCertificate")
    );

    if (certificates.length === 0) {
      console.log("❌ No certificate found in recipient's objects");
      console.log("📋 All objects owned by recipient:");
      ownedObjects.data.forEach((obj, index) => {
        console.log(
          `  ${index + 1}. ${obj.data?.type} - ${obj.data?.objectId}`
        );
      });
      return;
    }

    const certificate = certificates[0];
    const certificateId = certificate.data.objectId;

    console.log(`🎓 Found certificate: ${certificateId}`);
    console.log(`   Type: ${certificate.data.type}`);

    if (certificate.data.content && certificate.data.content.fields) {
      const fields = certificate.data.content.fields;
      console.log(`   Is Minted: ${fields.is_minted}`);
      console.log(`   Is Revoked: ${fields.is_revoked}`);

      if (fields.is_minted) {
        console.log("❌ Certificate already minted!");
        return;
      }
      if (fields.is_revoked) {
        console.log("❌ Certificate is revoked!");
        return;
      }
    }

    // Step 5: Skip funding for now (assume recipient has SUI or issuer sponsors)
    console.log("\n💰 STEP 5: Skipping funding (assuming recipient has SUI)");
    console.log(
      "   💡 In production: recipient connects wallet or gets funded"
    );

    // Step 6: Mint the certificate as NFT
    console.log("\n🏷️ STEP 6: Mint Certificate as NFT");

    // Convert private key to the expected format
    const privateKeyBase64 =
      Buffer.from(recipientPrivateKey).toString("base64");
    const suiPrivateKey = `suiprivkey1${privateKeyBase64}`;

    console.log(
      `🔑 Using private key format: ${suiPrivateKey.substring(0, 20)}...`
    );

    const mintResponse = await fetch(
      "http://localhost:3000/api/user/mint-certificate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: certificateId,
          userAddress: recipientAddress,
          userPrivateKey: suiPrivateKey,
          gasBudget: 15000000, // 15M MIST
        }),
      }
    );

    const mintResult = await mintResponse.json();
    console.log(`📥 Mint Response (${mintResponse.status}):`, mintResult);

    if (mintResult.success) {
      console.log("\n🎉 MINTING SUCCESS!");
      console.log(`🎨 NFT ID: ${mintResult.nftId}`);
      console.log(`📍 Certificate ID: ${mintResult.certificateId}`);
      console.log(`🔗 Transaction: ${mintResult.transactionDigest}`);
      console.log(`⛽ Gas Used: ${mintResult.gasUsed}`);
      console.log(`🌐 View on Explorer: ${mintResult.viewOnExplorer}`);

      // Step 7: Verify the NFT exists
      console.log("\n✅ STEP 7: Verify NFT Creation");

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for confirmation

      try {
        const nftObject = await client.getObject({
          id: mintResult.nftId,
          options: {
            showContent: true,
            showType: true,
            showOwner: true,
          },
        });

        console.log(`🎨 NFT Object Details:`);
        console.log(`   ID: ${nftObject.data.objectId}`);
        console.log(`   Type: ${nftObject.data.type}`);
        console.log(`   Owner: ${JSON.stringify(nftObject.data.owner)}`);

        if (nftObject.data.content && nftObject.data.content.fields) {
          const nftFields = nftObject.data.content.fields;
          console.log(`   Certificate ID: ${nftFields.certificate_id}`);
          console.log(`   Template ID: ${nftFields.template_id}`);
          console.log(`   Issued At: ${nftFields.issued_at}`);
        }

        console.log("\n🎉 COMPLETE MINTING WORKFLOW SUCCESSFUL!");
        console.log(
          "✅ Certificate issued ➜ ✅ NFT minted ➜ ✅ NFT owned by recipient"
        );
      } catch (e) {
        console.log("❌ NFT verification failed:", e.message);
      }
    } else {
      console.log("\n❌ MINTING FAILED!");
      console.log(`Error: ${mintResult.error}`);
    }
  } catch (error) {
    console.error("❌ Workflow failed:", error);
  }
}

testMintingWorkflow();
