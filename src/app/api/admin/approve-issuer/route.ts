import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuers, issuerApplication, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";

export async function POST(request: NextRequest) {
  try {
    const { applicationId, issuerId } = await request.json();

    // Environment variable access
    const privateKey = process.env.ADMIN_PRIVATE_KEY!;
    const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID!;
    const adminCapId = process.env.ADMIN_CAP!;

    if (!privateKey || !packageId || !adminCapId) {
      return NextResponse.json({
        success: false,
        error: "Missing environment configuration",
      });
    }

    // Get the specific pending application by ID (accept both applicationId and issuerId)
    const targetId = applicationId || issuerId;
    let pendingApplication;

    if (targetId) {
      pendingApplication = await db
        .select({
          id: issuerApplication.id,
          applicant: issuerApplication.applicant,
          organizationName: issuerApplication.organizationName,
          contactEmail: issuerApplication.contactEmail,
          website: issuerApplication.website,
          status: issuerApplication.status,
          blockchainAddress: issuerApplication.blockchainAddress,
          userAddress: users.userAddress, // Get the actual wallet address
        })
        .from(issuerApplication)
        .leftJoin(users, eq(issuerApplication.applicant, users.id))
        .where(
          and(
            eq(issuerApplication.id, parseInt(targetId)),
            eq(issuerApplication.status, "pending")
          )
        )
        .limit(1);
    } else {
      // Fallback: get any pending application
      pendingApplication = await db
        .select({
          id: issuerApplication.id,
          applicant: issuerApplication.applicant,
          organizationName: issuerApplication.organizationName,
          contactEmail: issuerApplication.contactEmail,
          website: issuerApplication.website,
          status: issuerApplication.status,
          blockchainAddress: issuerApplication.blockchainAddress,
          userAddress: users.userAddress,
        })
        .from(issuerApplication)
        .leftJoin(users, eq(issuerApplication.applicant, users.id))
        .where(eq(issuerApplication.status, "pending"))
        .limit(1);
    }

    if (pendingApplication.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No pending issuer application found.",
      });
    }

    const application = pendingApplication[0];

    console.log("📋 Processing approval for application:", application.id);

    // Initialize Sui client and keypair
    const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });

    // Handle Sui private key format - Try multiple methods
    let keypair: Ed25519Keypair;
    if (privateKey.startsWith("suiprivkey1")) {
      try {
        // Method 1: Try using the SDK's direct import
        keypair = Ed25519Keypair.fromSecretKey(privateKey);
        console.log("✅ SDK direct import worked");
      } catch (sdkError) {
        console.log("❌ SDK direct import failed:", sdkError);
        try {
          // Method 2: Try decoding and using as-is
          const fullDecoded = fromBase64(privateKey.slice(11));
          keypair = Ed25519Keypair.fromSecretKey(fullDecoded);
          console.log("✅ Full decoded import worked");
        } catch (fullError) {
          console.log("❌ Full decoded import failed:", fullError);
          // Method 3: Manual parsing (current approach)
          const decoded = fromBase64(privateKey.slice(11));
          const privateKeyBytes = decoded.slice(1, 33); // Skip flag, take 32 bytes
          keypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
          console.log("✅ Using manual parsing as fallback");
        }
      }

      const derivedAddress = keypair.getPublicKey().toSuiAddress();
      console.log("🔍 Address verification:");
      console.log("  Expected:", process.env.ADMIN_ADDRESS);
      console.log("  Derived: ", derivedAddress);
      console.log("  Match:   ", derivedAddress === process.env.ADMIN_ADDRESS);
    } else {
      keypair = Ed25519Keypair.fromSecretKey(fromBase64(privateKey));
    }

    // Create approval transaction: Create IssuerCap and transfer 5 SUI
    const tx = new Transaction();

    console.log(
      "📝 Creating IssuerCap and transferring 5 SUI for application:",
      application.id
    );

    // 1. Create approved IssuerCap directly for the issuer
    tx.moveCall({
      target: `${packageId}::issuer::admin_create_approved_issuer`,
      arguments: [
        tx.object(adminCapId),
        tx.pure.address(application.userAddress),
        tx.pure.string(application.organizationName || "Unknown Organization"),
        tx.pure.string(application.contactEmail || "unknown@example.com"),
        tx.pure.string(application.organizationName || "Unknown Organization"),
        tx.object(process.env.ISSUER_REGISTRY! as string),
      ],
    });

    console.log(
      `✅ Creating approved IssuerCap for: ${application.userAddress}`
    );

    // 2. Transfer 1 SUI to the new issuer (reduced for testing due to admin balance)
    if (application.userAddress) {
      const gasAmount = 1000000000; // 1 SUI worth of gas (1B MIST) - reduced for testing

      // Split 1 SUI and transfer to issuer
      const [splitCoin] = tx.splitCoins(tx.gas, [tx.pure.u64(gasAmount)]);

      tx.transferObjects([splitCoin], tx.pure.address(application.userAddress));

      console.log(
        `💰 Transferring 1 SUI (${gasAmount} MIST) to issuer: ${application.userAddress} [TEST MODE]`
      );
    } else {
      console.log("⚠️ No user address found, cannot transfer gas");
      return NextResponse.json({
        success: false,
        error: "User address is required for gas transfer",
      });
    }

    // Check admin wallet balance before executing transaction
    const adminAddress =
      process.env.ADMIN_ADDRESS || process.env.ADMIN_WALLET_ADDRESS!;
    const adminBalance = await client.getBalance({
      owner: adminAddress,
      coinType: "0x2::sui::SUI",
    });

    const requiredAmount = 1100000000; // 1.1 SUI (1 SUI + buffer for gas fees)
    console.log(
      `💰 Admin balance: ${adminBalance.totalBalance} MIST (need ${requiredAmount} MIST)`
    );

    if (parseInt(adminBalance.totalBalance) < requiredAmount) {
      return NextResponse.json({
        success: false,
        error: `Insufficient admin balance: has ${(
          parseInt(adminBalance.totalBalance) / 1000000000
        ).toFixed(2)} SUI, needs ${(requiredAmount / 1000000000).toFixed(
          1
        )} SUI`,
      });
    }

    // Sign and execute the combined transaction
    const result = await client.signAndExecuteTransaction({
      signer: keypair,
      transaction: tx,
      options: {
        showEffects: true,
        showObjectChanges: true,
      },
    });

    console.log("📊 Transaction result:", {
      digest: result.digest,
      status: result.effects?.status?.status,
      objectChangesCount: result.objectChanges?.length || 0,
    });

    if (result.effects?.status?.status === "success") {
      // Get the created IssuerCap ID from transaction results
      let createdIssuerCapId: string | null = null;
      if (result.objectChanges) {
        const issuerCapObject = result.objectChanges.find(
          (change) =>
            change.type === "created" &&
            "objectType" in change &&
            change.objectType?.includes("issuer::IssuerCap")
        );
        if (issuerCapObject && "objectId" in issuerCapObject) {
          createdIssuerCapId = issuerCapObject.objectId;
        }
      }

      if (!createdIssuerCapId) {
        throw new Error("Failed to get created IssuerCap ID");
      }

      console.log("✅ Created IssuerCap:", createdIssuerCapId);
      console.log("✅ Transferred 5 SUI to issuer");

      // Update application status to approved
      const updateData = {
        status: "approved" as const,
        approvedAt: new Date(),
        reviewedAt: new Date(),
        reviewedBy: application.applicant,
        transactionDigest: result.digest,
      };

      await db
        .update(issuerApplication)
        .set(updateData)
        .where(eq(issuerApplication.id, application.id));

      // Create issuer record with the blockchain IssuerCap ID
      let userId = application.applicant;
      if (!userId || typeof userId !== "string" || userId.length !== 36) {
        // Try to find user by wallet address
        if (application.userAddress) {
          const userByWallet = await db.query.users.findFirst({
            where: eq(users.userAddress, application.userAddress),
          });
          if (userByWallet) {
            userId = userByWallet.id;
          }
        }
      }

      // Check if issuer record already exists for this user
      const existingIssuer = await db
        .select()
        .from(issuers)
        .where(eq(issuers.userId, userId))
        .limit(1);

      if (existingIssuer.length === 0) {
        await db.insert(issuers).values({
          issuerKey: createdIssuerCapId, // Store the blockchain IssuerCap ID
          name: application.organizationName,
          displayName: application.organizationName,
          website: application.website,
          userId,
          isActive: true,
          isVerified: true,
          verifiedAt: new Date(),
        });
        console.log(
          "✅ Created issuer record for user:",
          userId,
          "with issuerKey:",
          createdIssuerCapId
        );
      } else {
        console.log("ℹ️ Issuer record already exists for user:", userId);
      }

      // Update user role to issuer
      await db
        .update(users)
        .set({ role: "issuer" })
        .where(eq(users.id, userId));
      console.log("✅ Updated user role to 'issuer' for user ID:", userId);

      return NextResponse.json({
        success: true,
        transactionDigest: result.digest,
        issuerCapId: createdIssuerCapId,
        message: "Issuer approved successfully with 5 SUI gas sponsorship",
      });
    } else {
      console.error("❌ Transaction failed:", {
        status: result.effects?.status,
        errors: result.effects?.status?.error,
      });
      throw new Error(
        `Transaction failed: ${
          result.effects?.status?.error || "Unknown error"
        }`
      );
    }
  } catch (error) {
    console.error("Approve issuer error:", error);
    return NextResponse.json({
      success: false,
      error: `Failed to approve issuer: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
