const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");

async function verifyKeypair() {
  try {
    const privateKey =
      "suiprivkey1qp8996l5rwn92jsncek9vmzmjmhdwr223s6p2lmv68rdau7f668e6upqfjt";
    const expectedAddress =
      "0x4bf1977b1e44b76afdeac4e5190c8da91a6a95a108c5026cbde02123e1afdb0b";

    console.log("🔍 Verifying keypair derivation...");
    console.log(`🔑 Private Key: ${privateKey}`);
    console.log(`🎯 Expected Address: ${expectedAddress}`);

    // Parse the private key the same way as in our API
    if (privateKey.startsWith("suiprivkey1")) {
      const keyWithoutPrefix = privateKey.slice(11);
      const keyBytes = Buffer.from(keyWithoutPrefix, "base64");
      console.log(`📦 Key bytes length: ${keyBytes.length}`);

      if (keyBytes.length >= 33) {
        const privateKeyBytes = keyBytes.slice(1, 33);
        console.log(`🔓 Private key bytes length: ${privateKeyBytes.length}`);

        const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        const derivedAddress = keypair.toSuiAddress();

        console.log(`✨ Derived Address: ${derivedAddress}`);
        console.log(`✅ Match: ${derivedAddress === expectedAddress}`);

        if (derivedAddress !== expectedAddress) {
          console.log("❌ ADDRESS MISMATCH!");
          console.log("This means either:");
          console.log("1. The private key is wrong");
          console.log("2. The expected address is wrong");
          console.log("3. The parsing logic is incorrect");
        } else {
          console.log("🎉 Perfect match! The keypair is correct.");
        }
      } else {
        console.log("❌ Key bytes too short");
      }
    }
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

verifyKeypair();
