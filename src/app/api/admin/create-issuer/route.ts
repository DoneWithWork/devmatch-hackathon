import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuers, issuerApplication } from "@/db/schema";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";

export async function POST() {
  try {
    const privateKey = process.env.ADMIN_PRIVATE_KEY;
    const walletAddress = process.env.ADMIN_WALLET_ADDRESS;
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
    const adminCapId = process.env.ADMIN_CAP;

    if (!privateKey || !walletAddress || !packageId || !adminCapId) {
      return NextResponse.json({
        success: false,
        error: "Missing environment configuration",
      });
    }

    // Initialize Sui client and keypair
    const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });
    const keypair = Ed25519Keypair.fromSecretKey(fromBase64(privateKey));

    // Create issuer capability on blockchain
    const tx = new Transaction();

    tx.moveCall({
      target: `${packageId}::issuer::apply_to_be_issuer`,
      arguments: [
        tx.pure.string("HashCred Platform"),
        tx.pure.string("issuer@platform.com"),
        tx.pure.string("HashCred Organization"),
        tx.object(process.env.ISSUER_REGISTRY! as string),
      ],
    });

    // Sign and execute transaction
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    if (result.effects?.status?.status === "success") {
      // Extract the new issuer capability ID from the transaction
      const createdObjects = result.objectChanges?.filter(
        (change) => change.type === "created"
      );

      const issuerCapObject = createdObjects?.find((obj) =>
        obj.objectType?.includes("IssuerCap")
      );

      if (!issuerCapObject || issuerCapObject.type !== "created") {
        throw new Error("Failed to find created issuer capability");
      }

      const newIssuerCapId = issuerCapObject.objectId;

      // Create issuer application in database
      await db
        .insert(issuerApplication)
        .values({
          applicant: walletAddress,
          organizationName: "HashCred Platform",
          domain: "hashcred-platform",
          organization: "Platform",
          description: "HashCred certificate issuance platform",
          website: "https://hashcred.platform",
          contactEmail: "issuer@platform.com",
          country: "Global",
          issuerCapId: newIssuerCapId,
          transactionDigest: result.digest,
          blockchainAddress: walletAddress,
          status: "success",
          submittedAt: new Date(),
          approvedAt: new Date(),
          reviewedAt: new Date(),
          reviewedBy: walletAddress,
        })
        .returning();

      // Create issuer record
      await db.insert(issuers).values({
        issuerKey: newIssuerCapId,
        name: "HashCred Platform",
        displayName: "HashCred Platform",
        website: "https://hashcred.platform",
        userId: walletAddress,
        isActive: true,
        isVerified: true,
        verifiedAt: new Date(),
      });

      return NextResponse.json({
        success: true,
        transactionDigest: result.digest,
        issuerCapId: newIssuerCapId,
        message: "New issuer created and approved successfully",
      });
    } else {
      throw new Error("Transaction failed");
    }
  } catch (error) {
    console.error("Create issuer error:", error);
    return NextResponse.json({
      success: false,
      error: `Failed to create issuer: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
