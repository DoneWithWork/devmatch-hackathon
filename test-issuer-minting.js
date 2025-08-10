// Test the existing issuer minting endpoint which tries to mint existing certificates

async function testIssuerMinting() {
  console.log("🚀 Testing Issuer Minting Endpoint");
  console.log("============================================================");

  // We know from the logs that no certificate objects are being created
  // Let's test what happens when we try to mint a non-existent certificate

  console.log("📝 Testing minting with a fake certificate ID...");

  try {
    const response = await fetch(
      "http://localhost:3000/api/issuer/mint-certificate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId:
            "0x1234567890123456789012345678901234567890123456789012345678901234", // Fake ID
          recipientAddress:
            "0x218479b384de6d7a1f08ae13309a8ff79e23560a38ec55d68f763e998e4081dc",
          recipientPrivateKey:
            "suiprivkey1qz782mel0k605zz7g8xhz7y5jydxz9ht2dwpysdqzrk8kk0xtkn4z0pcc0k",
          payGasWithIssuer: true,
        }),
      }
    );

    const result = await response.json();
    console.log(`📥 Mint Response (${response.status}):`, result);

    if (result.success) {
      console.log("🎉 Minting worked!");
    } else {
      console.log("❌ Minting failed as expected:", result.error);

      // Now let's see what the error tells us about the current system
      if (
        result.error.includes("not found") ||
        result.error.includes("does not exist")
      ) {
        console.log(
          "✅ This confirms that certificate objects are not being created by issue_certificate"
        );
        console.log("💡 We need to either:");
        console.log(
          "   1. Fix the issue_certificate function in the smart contract"
        );
        console.log("   2. Deploy the new issue_and_mint_certificate function");
        console.log("   3. Create a different minting approach");
      }
    }
  } catch (error) {
    console.log("❌ Request failed:", error.message);
  }
}

testIssuerMinting();
