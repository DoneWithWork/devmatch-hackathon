import { NextRequest, NextResponse } from "next/server";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { recordTransaction } from "@/utils/transactionLogger";
import { db } from "@/db/db";
import { issuers, users, certificateTemplates } from "@/db/schema";
import { eq } from "drizzle-orm";
import { bcs } from "@mysten/sui/bcs";

// Type for SUI transaction result
interface SuiTransactionResult {
  digest: string;
  effects?: {
    status?: {
      status: string;
    };
    gasUsed?: {
      computationCost: string;
    };
    created?: Array<{
      reference?: {
        objectId: string;
      };
    }>;
  };
}

// Test endpoint for template creation where issuer pays their own gas
export async function POST(request: NextRequest) {
  try {
    const { name, description, attributes, walletAddress, issuerPrivateKey } =
      await request.json();

    if (!name || !description || !attributes || !walletAddress) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: name, description, attributes, walletAddress",
        },
        { status: 400 }
      );
    }

    if (!issuerPrivateKey) {
      return NextResponse.json(
        { error: "This test endpoint requires issuerPrivateKey for signing" },
        { status: 400 }
      );
    }

    console.log(
      "🧪 TEST: Creating template for wallet (issuer pays own gas):",
      walletAddress
    );

    // Check if user is an approved issuer
    const userResult = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, walletAddress))
      .limit(1);

    if (!userResult.length) {
      return NextResponse.json(
        { error: "User not found for wallet address" },
        { status: 404 }
      );
    }

    const issuer = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, userResult[0].id))
      .limit(1);

    if (!issuer.length || !issuer[0].isVerified) {
      return NextResponse.json(
        { error: "You are not an approved issuer" },
        { status: 403 }
      );
    }

    const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!;
    const CERTIFICATE_REGISTRY = process.env.CERTIFICATE_REGISTRY!;

    // Use the issuer's individual IssuerCap
    const issuerCapId = issuer[0].issuerKey;

    console.log("Creating template with issuer's IssuerCap:", issuerCapId);
    console.log("🔑 Received private key:", issuerPrivateKey);
    console.log("🎯 Expected wallet address:", walletAddress);

    // Create issuer keypair from private key with proper decoding
    let issuerKeypair;
    try {
      // Try using the private key directly first
      console.log("🔄 Trying direct import...");
      issuerKeypair = Ed25519Keypair.fromSecretKey(issuerPrivateKey);
      console.log("✅ Direct import succeeded");
    } catch (directError) {
      console.log(
        "❌ Direct import failed, trying to decode:",
        directError instanceof Error ? directError.message : String(directError)
      );
      try {
        // If the private key is in SUI format (suiprivkey1...), decode it
        if (issuerPrivateKey.startsWith("suiprivkey1")) {
          console.log("🔓 Decoding SUI private key format...");
          const decoded = fromB64(issuerPrivateKey.slice(11)); // Remove 'suiprivkey1' prefix
          const keyBytes = decoded.slice(0, 32); // Take first 32 bytes
          issuerKeypair = Ed25519Keypair.fromSecretKey(keyBytes);
          console.log("✅ SUI format decoding succeeded");
        } else {
          throw new Error("Unsupported private key format");
        }
      } catch (decodeError) {
        console.log("❌ Decoding failed:", decodeError);
        return NextResponse.json(
          {
            error: `Failed to parse private key: ${
              decodeError instanceof Error
                ? decodeError.message
                : String(decodeError)
            }`,
          },
          { status: 400 }
        );
      }
    }

    const derivedAddress = issuerKeypair.getPublicKey().toSuiAddress();
    console.log("🔍 Derived address from private key:", derivedAddress);

    if (derivedAddress !== walletAddress) {
      return NextResponse.json(
        { error: "Private key does not match wallet address" },
        { status: 400 }
      );
    }

    // Initialize SUI client
    const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });

    // Convert attributes to vector<vector<u8>> format using proper BCS
    const fieldBytes = attributes.map((attr: string) =>
      Array.from(new TextEncoder().encode(attr))
    );

    // Serialize vector<vector<u8>> using BCS
    const serializedFields = bcs
      .vector(bcs.vector(bcs.u8()))
      .serialize(fieldBytes);

    // Create transaction
    const txb = new Transaction();

    // Call create_certificate_template function with issuer's IssuerCap
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::create_certificate_template`,
      arguments: [
        txb.object(issuerCapId), // Issuer's individual IssuerCap
        txb.pure.string(name),
        txb.pure.string(description),
        txb.pure.string(""), // image_template_url (empty for now)
        txb.pure.string("standard"), // certificate_type
        txb.pure(serializedFields), // fields as vector<vector<u8>>
        txb.object(CERTIFICATE_REGISTRY), // registry
      ],
    });

    console.log(
      "Executing template creation transaction with issuer signing..."
    );

    // Execute transaction with issuer signing and paying gas
    const result = await client.signAndExecuteTransaction({
      transaction: txb,
      signer: issuerKeypair,
      options: {
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    if (result.effects?.status?.status !== "success") {
      return NextResponse.json(
        { error: "Transaction execution failed" },
        { status: 500 }
      );
    }

    console.log("Template creation result:", result);

    const transactionResult = result as SuiTransactionResult;
    const blockchainTemplateId =
      transactionResult.effects?.created?.[0]?.reference?.objectId;

    if (!blockchainTemplateId) {
      return NextResponse.json(
        { error: "Failed to get template ID from blockchain transaction" },
        { status: 500 }
      );
    }

    // Create database record linking blockchain ID to database UUID
    console.log("📝 Creating database template record...");
    try {
      const [dbTemplate] = await db
        .insert(certificateTemplates)
        .values({
          templateName: name,
          description,
          fields: attributes,
          issuerId: issuer[0].id,
          templateUrl: blockchainTemplateId, // Store blockchain ID in templateUrl field
          category: "education",
          isActive: true,
        })
        .returning();

      console.log("✅ Database template created:", dbTemplate.id);
    } catch (dbError) {
      console.error("❌ Failed to create database template record:", dbError);
      // Continue anyway - the blockchain template was created
    }

    // Log the transaction
    await recordTransaction({
      transactionHash: transactionResult.digest,
      transactionType: "template_creation",
      description: `Created certificate template: ${name}`,
      gasUsed:
        transactionResult.effects?.gasUsed?.computationCost?.toString() || "0",
      status:
        transactionResult.effects?.status?.status === "success"
          ? "success"
          : "failed",
      userId: userResult[0].id,
      metadata: {
        templateName: name,
        description,
        attributes,
        issuerSelfPaid: true,
      },
    });

    return NextResponse.json({
      success: true,
      templateId: transactionResult.effects?.created?.[0]?.reference?.objectId,
      txDigest: transactionResult.digest,
      message: "Template created successfully with issuer paying own gas",
    });
  } catch (error) {
    console.error("Template creation error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Template creation failed",
      },
      { status: 500 }
    );
  }
}
