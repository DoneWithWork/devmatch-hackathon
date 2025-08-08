import { NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

// Quick test to create a real template
const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const CERTIFICATE_REGISTRY = process.env.CERTIFICATE_REGISTRY!;

function parsePrivateKey(privateKey: string): Ed25519Keypair {
  if (privateKey.startsWith("suiprivkey1")) {
    const keyWithoutPrefix = privateKey.slice(11);
    const keyBytes = Buffer.from(keyWithoutPrefix, "base64");

    if (keyBytes.length >= 33) {
      const privateKeyBytes = keyBytes.slice(1, 33);
      return Ed25519Keypair.fromSecretKey(privateKeyBytes);
    }
  }
  throw new Error("Invalid private key format");
}

export async function POST() {
  try {
    console.log("🧪 Creating test template...");

    // Use the credentials from env
    const issuerPrivateKey = process.env.SUI_PRIVATE_KEY!;
    const issuerCapId = process.env.SUI_ISSUER_CAP!;

    if (!issuerPrivateKey || !issuerCapId) {
      throw new Error(
        "Missing SUI_PRIVATE_KEY or SUI_ISSUER_CAP in environment variables"
      );
    }

    const issuerKeypair = parsePrivateKey(issuerPrivateKey);
    const derivedAddress = issuerKeypair.getPublicKey().toSuiAddress();

    console.log("🔑 Wallet info:", {
      derivedAddress,
      issuerCapId,
      packageId: PACKAGE_ID,
      registryId: CERTIFICATE_REGISTRY,
    });

    // Create transaction to create template
    const txb = new TransactionBlock();
    txb.setGasBudget(10000000); // 10M MIST

    // Create a simple test template
    const templateName = "Test Certificate Template";
    const description = "A test certificate template for demonstration";
    const fields = [
      "Recipient Name",
      "Course Title",
      "Completion Date",
      "Grade",
    ];

    const fieldBytes = fields.map((field: string) =>
      Array.from(new TextEncoder().encode(field))
    );

    console.log("📋 Template details:", {
      templateName,
      description,
      fields,
      fieldCount: fields.length,
    });

    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::create_certificate_template`,
      arguments: [
        txb.object(issuerCapId), // Use txb.object() instead of txb.pure() for object references
        txb.pure(Array.from(new TextEncoder().encode(templateName))),
        txb.pure(Array.from(new TextEncoder().encode(description))),
        txb.pure(Array.from(new TextEncoder().encode(""))), // imageTemplateUrl
        txb.pure(Array.from(new TextEncoder().encode("certificate"))), // certificateType
        txb.pure(fieldBytes),
        txb.pure(CERTIFICATE_REGISTRY),
      ],
    });

    const result = await client.signAndExecuteTransactionBlock({
      signer: issuerKeypair,
      transactionBlock: txb,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
      },
    });

    // Find the created template
    let templateId = null;
    if (result.objectChanges) {
      for (const change of result.objectChanges) {
        if (
          change.type === "created" &&
          change.objectType?.includes("CertificateTemplate")
        ) {
          templateId = change.objectId;
          break;
        }
      }
    }

    console.log("✅ Test template created:", {
      transactionDigest: result.digest,
      templateId,
      gasUsed: result.effects?.gasUsed,
    });

    return NextResponse.json({
      success: true,
      templateId,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      templateName,
      description,
      fields,
      message: "Test template created successfully",
    });
  } catch (error) {
    console.error("❌ Test template creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
