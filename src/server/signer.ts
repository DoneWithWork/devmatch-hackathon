import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

let cached: Ed25519Keypair | null = null;

export function getServerSigner(): Ed25519Keypair {
  if (cached) return cached;
  const raw = process.env.ISSUER_PRIVATE_KEY_BASE64;
  if (!raw) {
    throw new Error("Server signer not configured (ISSUER_PRIVATE_KEY_BASE64)");
  }
  // Expect base64 32-byte secret key
  const bytes = Buffer.from(raw, "base64");
  if (bytes.length !== 32 && bytes.length !== 64) {
    throw new Error("Invalid server signer key length");
  }
  // If 64 assume includes public key, Ed25519Keypair.fromSecretKey expects 32 secret bytes
  const secret = bytes.length === 64 ? bytes.slice(0, 32) : bytes;
  cached = Ed25519Keypair.fromSecretKey(secret);
  return cached;
}
