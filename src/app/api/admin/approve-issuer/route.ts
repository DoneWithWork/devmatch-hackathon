import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { db } from "@/db/db";
import { issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

// Smart contract configuration
const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const ADMIN_CAP = process.env.ADMIN_CAP!;
const ISSUER_REGISTRY = process.env.ISSUER_REGISTRY!;

export async function POST(request: NextRequest) {
  try {
    const { issuerId, walletAddress, gasBudget } = await request.json();

    console.log("🎯 Target wallet address:", walletAddress);
    console.log("📝 Approving issuer with smart contract integration...");
    console.log("⛽ Gas budget:", gasBudget || "using default");

    // First, get the application details including IssuerCap ID
    const application = await db
      .select()
      .from(issuerApplication)
      .where(eq(issuerApplication.id, parseInt(issuerId)))
      .limit(1);

    if (application.length === 0) {
      throw new Error("Application not found");
    }

    const app = application[0];
    const issuerCapId = app.issuerCapId;

    console.log("📋 Application details:", {
      id: app.id,
      issuerCapId,
      transactionDigest: app.transactionDigest,
    });

    let transactionDigest = null;
    let gasUsed = null;

    // Only proceed with smart contract if IssuerCap exists
    if (issuerCapId) {
      try {
        console.log("🔗 Calling approve_issuer smart contract...");

        // Load admin keypair from environment private key
        const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY!;
        let adminKeypair: Ed25519Keypair;

        // Parse the private key properly
        try {
          // The private key from .env is in format "suiprivkey1..."
          if (adminPrivateKey.startsWith("suiprivkey1")) {
            // For Sui private keys, extract the raw bytes
            const keyWithoutPrefix = adminPrivateKey.slice(11); // Remove 'suiprivkey1' prefix
            const keyBytes = Buffer.from(keyWithoutPrefix, "base64");

            // Skip the algorithm flag (first byte) and take the 32-byte private key
            if (keyBytes.length >= 33) {
              const privateKeyBytes = keyBytes.slice(1, 33); // Skip flag, take 32 bytes
              adminKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
            } else {
              throw new Error(
                "Invalid private key format - insufficient bytes"
              );
            }
          } else {
            // If it's already raw bytes or hex, try to parse directly
            const secretKeyBytes =
              typeof adminPrivateKey === "string"
                ? Buffer.from(adminPrivateKey, "hex")
                : adminPrivateKey;
            adminKeypair = Ed25519Keypair.fromSecretKey(secretKeyBytes);
          }
          console.log(
            "✅ Using admin keypair, address:",
            adminKeypair.getPublicKey().toSuiAddress()
          );
        } catch (error) {
          console.error("❌ Failed to parse admin private key:", error);
          console.warn("⚠️  Falling back to generated keypair for testing");
          adminKeypair = Ed25519Keypair.generate();
        }

        const txb = new TransactionBlock();
        // Use gas budget from request or default to 3.5M MIST (tested optimal)
        const finalGasBudget = gasBudget || 3500000;
        txb.setGasBudget(finalGasBudget);
        console.log("⛽ Setting gas budget to:", finalGasBudget, "MIST");

        // Call approve_issuer function
        txb.moveCall({
          target: `${PACKAGE_ID}::issuer::approve_issuer`,
          arguments: [
            txb.object(ADMIN_CAP), // AdminCap
            txb.object(issuerCapId), // IssuerCap (now we have it!)
            txb.object(ISSUER_REGISTRY), // IssuerRegistry
          ],
        });

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

        transactionDigest = result.digest;
        gasUsed = result.effects?.gasUsed;

        console.log("✅ Smart contract approval successful:", {
          transactionDigest,
          gasUsed,
          balanceChanges: result.balanceChanges,
          adminAddress: adminKeypair.getPublicKey().toSuiAddress(),
        });
      } catch (blockchainError) {
        console.error("❌ Blockchain approval failed:", blockchainError);
        // Continue with database update even if blockchain fails
        console.log("📝 Continuing with database-only approval...");
      }
    } else {
      console.log("⚠️  No IssuerCap found, using database-only approval");
    }

    // Update the application status in the database
    const updatedApplication = await db
      .update(issuerApplication)
      .set({
        status: "success",
        // Update transaction digest if we have a new one from approval
        ...(transactionDigest && { transactionDigest }),
      })
      .where(eq(issuerApplication.id, parseInt(issuerId)))
      .returning();

    console.log("✅ Application status updated:", updatedApplication);

    return NextResponse.json({
      success: true,
      issuerId,
      walletAddress,
      message: transactionDigest
        ? "Issuer approved successfully on blockchain"
        : "Issuer approved successfully (database only)",
      refreshGasBalance: true,
      blockchain: {
        enabled: !!transactionDigest,
        transactionDigest,
        gasUsed,
        issuerCapId,
      },
      contractAddresses: {
        packageId: PACKAGE_ID,
        adminCap: ADMIN_CAP,
        issuerRegistry: ISSUER_REGISTRY,
      },
    });
  } catch (error) {
    console.error("❌ Issuer approval failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
