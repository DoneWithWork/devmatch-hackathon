// Test the simplified NFT creation approach
async function testSimpleNFTCreation() {
  console.log("🚀 Testing Simple NFT Creation");
  console.log("============================================================");

  try {
    const response = await fetch(
      "http://localhost:3000/api/certificates/create-nft",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId:
            "0xf8dcde2931a0a30301834387150b9cd522b6668e32849c72d30efe3f5211952d", // Existing template
          recipientAddress:
            "0x218479b384de6d7a1f08ae13309a8ff79e23560a38ec55d68f763e998e4081dc", // From our test
          fieldData: {
            participantName: "Bob Wilson",
            hackathonName: "DevMatch 2025 Simple NFT Test",
            completionDate: "2025-08-10",
            achievements: "Successfully created a simple NFT certificate",
            mentorSignature: "Prof. Blockchain",
          },
          issuerWalletAddress:
            "0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798", // Admin address (we have the key)
          issuerPrivateKey:
            "suiprivkey1qquqnrlzdx5etv0m3g3vt72g8e9kghyp6rumk0hgrhhee42clyugx0ujf2m", // Admin private key
        }),
      }
    );

    const result = await response.json();
    console.log(`📥 NFT Creation Response (${response.status}):`, result);

    if (result.success) {
      console.log("\n🎉 SUCCESS! Simple NFT created!");
      console.log(`🎨 NFT ID: ${result.nftId}`);
      console.log(`🔗 Transaction: ${result.transactionDigest}`);
      console.log(`📦 Transfer TX: ${result.transferDigest}`);
      console.log(`⛽ Gas Used: ${result.gasUsed}`);
      console.log(`🌐 View: ${result.viewOnExplorer}`);

      // Now let's verify the recipient received the NFT
      console.log("\n🔍 Verifying NFT ownership...");

      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for blockchain confirmation

      try {
        const { SuiClient, getFullnodeUrl } = require("@mysten/sui/client");
        const client = new SuiClient({ url: getFullnodeUrl("devnet") });

        const ownedObjects = await client.getOwnedObjects({
          owner: result.recipientAddress,
          options: {
            showType: true,
            showContent: true,
          },
        });

        console.log(`📦 Recipient owns ${ownedObjects.data.length} objects`);

        const nfts = ownedObjects.data.filter(
          (obj) =>
            obj.data?.type?.includes("SimpleNFT") ||
            obj.data?.type?.includes("NFT")
        );

        if (nfts.length > 0) {
          console.log(`🎨 Found ${nfts.length} NFT(s) owned by recipient!`);
          for (const nft of nfts) {
            console.log(`   - ${nft.data.type}: ${nft.data.objectId}`);
          }

          console.log("\n✅ COMPLETE SUCCESS!");
          console.log("🎯 NFT certificate creation workflow working!");
        } else {
          console.log("❌ No NFTs found in recipient's wallet");
        }
      } catch (verifyError) {
        console.log("⚠️ Verification failed:", verifyError.message);
      }
    } else {
      console.log("\n❌ NFT creation failed:", result.error);
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }
}

testSimpleNFTCreation();
