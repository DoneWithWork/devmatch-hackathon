import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { db } from "@/db/db";
import { issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

// Use your optimized gas budgets and contract addresses
const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const ADMIN_CAP = process.env.ADMIN_CAP!;
const ISSUER_REGISTRY = process.env.ISSUER_REGISTRY!;

export async function POST(request: NextRequest) {
  try {
    const {
      issuerId,
      walletAddress,
      gasBudget = 3500000,
    } = await request.json();

    // Load admin keypair from Sui private key format
    const privateKey = process.env.ADMIN_PRIVATE_KEY!;
    console.log("🔑 Private key starts with:", privateKey.substring(0, 20));
    console.log("🔑 Private key length:", privateKey.length);

    // For now, let's create a test keypair to see if the rest works
    // TODO: Fix the private key loading once we confirm the transaction structure
    const keypair = Ed25519Keypair.generate();
    console.log("🧪 Using test keypair with address:", keypair.toSuiAddress());

    console.log("🔧 Approving issuer with gas budget:", gasBudget, "MIST");
    console.log("🎯 Target wallet address:", walletAddress);

    // Simulate approval since we need actual IssuerCap on-chain first
    console.log("🔧 Simulating issuer approval");
    console.log("📝 Application ID:", issuerId);
    console.log("🎯 Target wallet address:", walletAddress);

    // In production workflow:
    // 1. User calls apply_to_be_issuer() → creates IssuerCap
    // 2. Admin calls approve_issuer() → approves existing IssuerCap

    // For now, simulate success to test the UI
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate delay

    // Update the application status in the database
    console.log("📝 Updating application status in database...");
    const updatedApplication = await db
      .update(issuerApplication)
      .set({ status: "success" })
      .where(eq(issuerApplication.id, parseInt(issuerId)))
      .returning();

    console.log("✅ Application status updated:", updatedApplication);

    return NextResponse.json({
      success: true,
      issuerId,
      walletAddress,
      transactionDigest: "simulated_" + Date.now(),
      gasUsed: { computationCost: "1200000", storageCost: "120000" },
      message: "Issuer approved successfully (simulated)",
      note: "Full implementation requires on-chain apply_to_be_issuer() → approve_issuer() workflow",
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
