import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { config } from "dotenv";

// Load environment from scripts directory
config({ path: "../../../scripts/.env" });

const PACKAGE_ID = process.env.PACKAGE_ID!;
const CERTIFICATE_REGISTRY = process.env.CERTIFICATE_REGISTRY!;

// Initialize Sui client
const client = new SuiClient({ url: getFullnodeUrl("devnet") });

/**
 * Issue a certificate using existing contract structure
 * This updates the existing empty issue.ts file
 */
export async function issueCertificate(
  issuerCapId: string,
  templateId: string,
  recipientAddress: string,
  fieldNames: string[],
  fieldValues: string[],
  expiryDate: number | null = null,
  keypair: Ed25519Keypair
) {
  try {
    console.log("🎓 Issuing certificate...");

    const tx = new TransactionBlock();

    // Convert string arrays to proper format for Move
    const fieldNamesBytes = fieldNames.map((name) =>
      Array.from(new TextEncoder().encode(name))
    );
    const fieldValuesBytes = fieldValues.map((value) =>
      Array.from(new TextEncoder().encode(value))
    );

    // Build the transaction with optimized gas budget
    tx.moveCall({
      target: `${PACKAGE_ID}::certificate::issue_certificate`,
      arguments: [
        tx.object(issuerCapId),
        tx.object(templateId),
        tx.pure(recipientAddress),
        tx.pure(fieldNamesBytes),
        tx.pure(fieldValuesBytes),
        tx.pure(expiryDate ? [expiryDate] : []),
        tx.object(CERTIFICATE_REGISTRY),
      ],
    });

    // Use optimized gas budget from testing: 6M MIST
    tx.setGasBudget(6000000);

    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showEvents: true,
      },
    });

    console.log("✅ Certificate issued successfully!");
    console.log("Transaction:", result.digest);

    // Gas efficiency analysis
    const gasUsed = result.effects?.gasUsed;
    if (gasUsed) {
      const totalCost =
        parseInt(gasUsed.computationCost) + parseInt(gasUsed.storageCost);
      const efficiency = ((totalCost / 6000000) * 100).toFixed(1);
      console.log(`💰 Gas: ${totalCost} MIST (${efficiency}% of budget)`);
    }

    return result;
  } catch (error) {
    console.error("❌ Certificate issuance failed:", error);
    throw error;
  }
}
