#!/usr/bin/env node

import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

function getAdminKeypair(privateKey) {
  if (privateKey.startsWith("suiprivkey1")) {
    const keyWithoutPrefix = privateKey.slice(11);
    const keyBytes = Buffer.from(keyWithoutPrefix, 'base64');
    
    if (keyBytes.length >= 33) {
      const privateKeyBytes = keyBytes.slice(1, 33);
      return Ed25519Keypair.fromSecretKey(privateKeyBytes);
    }
  }
  throw new Error("Invalid private key format");
}

async function createIssuerCap() {
  try {
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    const PACKAGE_ID = process.env.PACKAGE_ID;
    const ISSUER_REGISTRY = process.env.ISSUER_REGISTRY;
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

    console.log("🔧 Creating IssuerCap for existing application...");
    console.log("📦 Package ID:", PACKAGE_ID);
    console.log("📋 Issuer Registry:", ISSUER_REGISTRY);

    const adminKeypair = getAdminKeypair(adminPrivateKey);
    console.log("👤 Admin Address:", adminKeypair.getPublicKey().toSuiAddress());

    // Create transaction to apply for issuer (this creates the IssuerCap)
    const txb = new TransactionBlock();
    txb.setGasBudget(5000000);

    // Call apply_to_be_issuer to create an IssuerCap
    txb.moveCall({
      target: `${PACKAGE_ID}::issuer::apply_to_be_issuer`,
      arguments: [
        txb.pure(Array.from(new TextEncoder().encode("wongtester1"))), // organizationName
        txb.pure(Array.from(new TextEncoder().encode("wongtester1@yopmail.com"))), // contactEmail
        txb.pure(Array.from(new TextEncoder().encode("wongtester1"))), // organization
        txb.object(ISSUER_REGISTRY),
      ],
    });

    console.log("🚀 Submitting transaction...");
    const result = await client.signAndExecuteTransactionBlock({
      signer: adminKeypair,
      transactionBlock: txb,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    console.log("✅ Transaction successful!");
    console.log("📜 Transaction Digest:", result.digest);
    console.log("⛽ Gas Used:", result.effects?.gasUsed);

    // Find the created IssuerCap object
    const createdObjects = result.objectChanges?.filter(change => 
      change.type === 'created' && change.objectType?.includes('IssuerCap')
    );

    if (createdObjects && createdObjects.length > 0) {
      const issuerCap = createdObjects[0];
      console.log("🎯 IssuerCap Created:", issuerCap.objectId);
      console.log("");
      console.log("📝 Next steps:");
      console.log("1. Update the database with this IssuerCap ID:");
      console.log(`   issuerCapId: '${issuerCap.objectId}'`);
      console.log(`   transactionDigest: '${result.digest}'`);
      console.log("2. Then try approving the issuer again - it should spend gas!");
    } else {
      console.log("⚠️ No IssuerCap found in created objects");
      console.log("Object changes:", JSON.stringify(result.objectChanges, null, 2));
    }

  } catch (error) {
    console.error("❌ Error:", error);
  }
}

createIssuerCap();
