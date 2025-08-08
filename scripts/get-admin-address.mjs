#!/usr/bin/env node

import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

function getAdminAddressFromPrivateKey(privateKey) {
  try {
    let adminKeypair;

    if (privateKey.startsWith("suiprivkey1")) {
      // For Sui private keys, extract the raw bytes
      const keyWithoutPrefix = privateKey.slice(11); // Remove 'suiprivkey1' prefix
      const keyBytes = Buffer.from(keyWithoutPrefix, 'base64');
      
      // Skip the algorithm flag (first byte) and take the 32-byte private key
      if (keyBytes.length >= 33) {
        const privateKeyBytes = keyBytes.slice(1, 33); // Skip flag, take 32 bytes
        adminKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
      } else {
        throw new Error("Invalid private key format - insufficient bytes");
      }
    } else {
      // If it's already raw bytes or hex, try to parse directly
      const secretKeyBytes = Buffer.from(privateKey, "hex");
      adminKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
    }

    return adminKeypair.getPublicKey().toSuiAddress();
  } catch (error) {
    console.error("Failed to derive admin address:", error);
    throw new Error("Invalid admin private key");
  }
}

async function main() {
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  
  if (!adminPrivateKey) {
    console.error("❌ ADMIN_PRIVATE_KEY not found in .env.local");
    return;
  }

  try {
    const adminAddress = getAdminAddressFromPrivateKey(adminPrivateKey);
    
    console.log("🔑 Admin Wallet Information:");
    console.log("=====================================");
    console.log(`📍 Address: ${adminAddress}`);
    console.log("");
    console.log("💰 To add testnet SUI tokens:");
    console.log("=====================================");
    console.log("1. Visit the Sui Devnet Faucet:");
    console.log("   https://discord.gg/sui");
    console.log("   OR");
    console.log("   https://docs.sui.io/guides/developer/getting-started/get-coins");
    console.log("");
    console.log("2. Use the following command in Discord #devnet-faucet channel:");
    console.log(`   !faucet ${adminAddress}`);
    console.log("");
    console.log("3. Or use the REST API:");
    console.log(`   curl -X POST https://faucet.devnet.sui.io/gas -H "Content-Type: application/json" -d '{"FixedAmountRequest":{"recipient":"${adminAddress}"}}'`);
    console.log("");
    console.log("🔍 Check balance at:");
    console.log(`   https://suiexplorer.com/address/${adminAddress}?network=devnet`);
    console.log("");
    console.log("💡 You need at least 0.1 SUI (100,000,000 MIST) for gas fees");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

main();
