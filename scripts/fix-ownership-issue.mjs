#!/usr/bin/env node

import { SuiClient } from "@mysten/sui/client";
import dotenv from "dotenv";

// Load .env.local
dotenv.config({ path: ".env.local" });

// Configuration - the addresses from your error message
const OLD_ADMIN_ADDRESS =
  "0x7e7994f5eb50e7cc88283432907a167236c4bffed5b0fa375cbd1dc1373c1798";
const NEW_ADMIN_ADDRESS =
  "0x1c59329774af3cc71f768152458ead83001f9a0c259809b8dfc66ab646bb172d";

// The issuer cap objects that need to be transferred
const ISSUER_CAPS_TO_TRANSFER = [
  "0x91f7510f880bbc3f769bdaa9d73f7b98c70cc6e50685d6ef6398791603d59528",
  "0xd74200e0d00c42f7c46a886dd25763671e0dc846b65ab345cba02d22e3cf2a6f",
];

async function checkObjectOwnership(client, objectId) {
  try {
    const objectInfo = await client.getObject({
      id: objectId,
      options: {
        showOwner: true,
        showType: true,
      },
    });

    console.log(`\n🔍 Object ${objectId}:`);
    console.log(`   Type: ${objectInfo.data?.type || "Unknown"}`);
    console.log(
      `   Owner: ${
        objectInfo.data?.owner?.AddressOwner ||
        objectInfo.data?.owner ||
        "Unknown"
      }`
    );

    return objectInfo.data?.owner?.AddressOwner || null;
  } catch (error) {
    console.error(`❌ Error checking object ${objectId}:`, error.message);
    return null;
  }
}

async function transferIssuerCaps() {
  try {
    console.log("🔄 Checking and fixing ownership issues...");
    console.log(`📍 Old Admin Address: ${OLD_ADMIN_ADDRESS}`);
    console.log(`🎯 New Admin Address: ${NEW_ADMIN_ADDRESS}`);

    // Initialize client
    const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });

    // Check current ownership of all objects
    console.log("\n🔍 Checking current object ownership...");

    for (const capId of ISSUER_CAPS_TO_TRANSFER) {
      const owner = await checkObjectOwnership(client, capId);

      if (owner === OLD_ADMIN_ADDRESS) {
        console.log(`⚠️  Object ${capId} is owned by old admin address`);
      } else if (owner === NEW_ADMIN_ADDRESS) {
        console.log(`✅ Object ${capId} is already owned by new admin address`);
      } else {
        console.log(`❓ Object ${capId} has unexpected owner: ${owner}`);
      }
    }

    console.log("\n❌ TRANSFER NOT POSSIBLE:");
    console.log(
      "The issuer capability objects are owned by the old admin address,"
    );
    console.log("but you only have the private key for the new admin address.");
    console.log("\n💡 SOLUTIONS:");
    console.log(
      "1. Get the private key for the old admin address to transfer objects"
    );
    console.log("2. Create new issuer applications with the new admin address");
    console.log("3. Re-deploy the contracts with the new admin address");
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

async function main() {
  await transferIssuerCaps();
}

main();
