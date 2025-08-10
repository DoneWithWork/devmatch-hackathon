import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";

// Configuration
const ADMIN_CAP_ID =
  "0x0ac7ffb970b503edfc27e621c5d5ad846009b42628a95fdbd1373dbf84f3e7be";
const CURRENT_ADMIN_PRIVATE_KEY =
  "suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp";

async function transferAdminRights(newAdminAddress) {
  try {
    console.log("🔄 Transferring admin rights...");
    console.log("📍 Current Admin Cap:", ADMIN_CAP_ID);
    console.log("🎯 New Admin Address:", newAdminAddress);

    // Initialize client and keypair
    const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });
    const currentAdminKeypair = Ed25519Keypair.fromSecretKey(
      fromBase64(CURRENT_ADMIN_PRIVATE_KEY)
    );

    // Create transfer transaction
    const tx = new Transaction();

    // Transfer the AdminCap to the new address
    tx.transferObjects(
      [tx.object(ADMIN_CAP_ID)],
      tx.pure.address(newAdminAddress)
    );

    // Execute transaction
    const result = await client.signAndExecuteTransaction({
      signer: currentAdminKeypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    if (result.effects?.status?.status === "success") {
      console.log("✅ Admin rights transferred successfully!");
      console.log("🔗 Transaction Digest:", result.digest);
      console.log(
        "⚠️  Remember to update your .env.local file with the new admin private key"
      );
      return {
        success: true,
        transactionDigest: result.digest,
        newAdminAddress,
      };
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("❌ Admin transfer failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

// Example usage (replace with your new admin address)
// transferAdminRights("0xNEW_ADMIN_ADDRESS_HERE");

export { transferAdminRights };
