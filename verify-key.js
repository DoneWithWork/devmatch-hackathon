const { Ed25519Keypair } = require("@mysten/sui.js/keypairs/ed25519");

function parsePrivateKey(privateKey) {
  if (privateKey.startsWith("suiprivkey1")) {
    const keyWithoutPrefix = privateKey.slice(11);
    const keyBytes = Buffer.from(keyWithoutPrefix, "base64");

    if (keyBytes.length >= 33) {
      const privateKeyBytes = keyBytes.slice(1, 33);
      return Ed25519Keypair.fromSecretKey(privateKeyBytes);
    }
  }
  throw new Error("Invalid private key format");
}

const privateKey =
  "suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp";
const keypair = parsePrivateKey(privateKey);
const derivedAddress = keypair.getPublicKey().toSuiAddress();
const expectedAddress =
  "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26";

console.log("==========================================");
console.log("Private Key Verification");
console.log("==========================================");
console.log("Private Key:", privateKey);
console.log("Derived Address:", derivedAddress);
console.log("Expected Address:", expectedAddress);
console.log("Addresses Match:", derivedAddress === expectedAddress);
console.log("==========================================");

if (derivedAddress !== expectedAddress) {
  console.log(
    "❌ PROBLEM: The private key does not derive the expected address!"
  );
  console.log("🔧 You need to either:");
  console.log("   1. Update SUI_ISSUER_CAP to one owned by:", derivedAddress);
  console.log(
    "   2. Use the correct private key for address:",
    expectedAddress
  );
} else {
  console.log("✅ Private key and address match correctly");
}
