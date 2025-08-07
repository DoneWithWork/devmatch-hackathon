import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

// Use your optimized gas budgets and contract addresses
const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const ADMIN_CAP = process.env.ADMIN_CAP!;
const ISSUER_REGISTRY = process.env.ISSUER_REGISTRY!;

export async function POST(request: NextRequest) {
  try {
    const { issuerCapId, gasBudget = 3500000 } = await request.json();

    // Load admin keypair (you'll need to securely store this)
    const privateKey = process.env.ADMIN_PRIVATE_KEY!;
    const keypair = Ed25519Keypair.fromSecretKey(
      Buffer.from(privateKey, "hex")
    );

    console.log("🔧 Approving issuer with gas budget:", gasBudget, "MIST");

    const tx = new TransactionBlock();

    // Call the approve_issuer function with optimized gas
    tx.moveCall({
      target: `${PACKAGE_ID}::issuer::approve_issuer`,
      arguments: [
        tx.object(ADMIN_CAP), // AdminCap
        tx.object(issuerCapId), // IssuerCap to approve
        tx.object(ISSUER_REGISTRY), // Registry
      ],
    });

    tx.setGasBudget(gasBudget);

    const result = await client.signAndExecuteTransactionBlock({
      signer: keypair,
      transactionBlock: tx,
      options: {
        showEffects: true,
        showEvents: true,
      },
    });

    // Update your database to reflect approval
    // await updateIssuerStatusInDB(issuerCapId, 'approved');

    return NextResponse.json({
      success: true,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      message: "Issuer approved successfully",
    });
  } catch (error) {
    console.error("Issuer approval failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
