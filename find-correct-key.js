const { Ed25519Keypair } = require("@mysten/sui/keypairs/ed25519");

async function findCorrectPrivateKey() {
  const targetAddress =
    "0x4bf1977b1e44b76afdeac4e5190c8da91a6a95a108c5026cbde02123e1afdb0b";

  // Known private keys from various places in the codebase
  const knownKeys = [
    "suiprivkey1qp8996l5rwn92jsncek9vmzmjmhdwr223s6p2lmv68rdau7f668e6upqfjt", // From test scripts
    "suiprivkey1qquqnrlzdx5etv0m3g3vt72g8e9kghyp6rumk0hgrhhee42clyugx0ujf2m", // From .env.local
    "suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp", // From ENVIRONMENT_BACKUP.md
    "suiprivkey1qz782mel0k605zz7g8xhz7y5jydxz9ht2dwpysdqzrk8kk0xtkn4z0pcc0k", // From test-issuer-minting.js
  ];

  console.log(`🎯 Target Address: ${targetAddress}`);
  console.log(`🔍 Testing ${knownKeys.length} known private keys...\n`);

  for (let i = 0; i < knownKeys.length; i++) {
    const privateKey = knownKeys[i];
    try {
      console.log(`🔑 Testing key ${i + 1}: ${privateKey.slice(0, 20)}...`);

      if (privateKey.startsWith("suiprivkey1")) {
        const keyWithoutPrefix = privateKey.slice(11);
        const keyBytes = Buffer.from(keyWithoutPrefix, "base64");

        if (keyBytes.length >= 33) {
          const privateKeyBytes = keyBytes.slice(1, 33);
          const keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          const derivedAddress = keypair.toSuiAddress();

          console.log(`   ✨ Derives to: ${derivedAddress}`);

          if (derivedAddress === targetAddress) {
            console.log(`\n🎉 FOUND MATCH!`);
            console.log(`✅ Private Key: ${privateKey}`);
            console.log(`✅ Address: ${derivedAddress}`);
            return { privateKey, address: derivedAddress };
          }
        }
      }
    } catch (error) {
      console.log(`   ❌ Error parsing key: ${error.message}`);
    }
    console.log("");
  }

  console.log("❌ No matching private key found among known keys.");
  console.log(
    "This suggests the address might have been created with a different key."
  );
  return null;
}

findCorrectPrivateKey();
