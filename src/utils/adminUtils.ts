import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

export function getAdminAddressFromPrivateKey(privateKey: string): string {
  try {
    let adminKeypair: Ed25519Keypair;

    if (privateKey.startsWith("suiprivkey1")) {
      // For Sui private keys, we need to extract the raw bytes
      // The format is: suiprivkey1 + algorithm flag (1 byte) + private key (32 bytes)
      const keyWithoutPrefix = privateKey.slice(11); // Remove 'suiprivkey1' prefix
      const keyBytes = Buffer.from(keyWithoutPrefix, "base64");

      // Skip the algorithm flag (first byte) and take the 32-byte private key
      if (keyBytes.length >= 33) {
        const privateKeyBytes = keyBytes.slice(1, 33); // Skip flag, take 32 bytes
        adminKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      } else {
        throw new Error("Invalid private key format - insufficient bytes");
      }
    } else {
      // If it's already raw bytes or hex, try to parse directly
      const secretKeyBytes =
        typeof privateKey === "string"
          ? Buffer.from(privateKey, "hex")
          : privateKey;
      adminKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
    }

    return adminKeypair.getPublicKey().toSuiAddress();
  } catch (error) {
    console.error("Failed to derive admin address:", error);
    throw new Error("Invalid admin private key");
  }
}
