import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

// Smart contract configuration
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

// Create Certificate Template
export async function POST(request: NextRequest) {
  try {
    const {
      issuerCapId,
      templateName,
      description,
      imageTemplateUrl,
      certificateType,
      fields,
      issuerPrivateKey,
    } = await request.json();

    console.log("🏗️ Creating certificate template on blockchain...");

    const issuerKeypair = parsePrivateKey(issuerPrivateKey);

    const txb = new TransactionBlock();
    txb.setGasBudget(10000000); // 10M MIST for template creation

    // Convert fields to the required format
    const fieldBytes = fields.map((field: string) =>
      Array.from(new TextEncoder().encode(field))
    );

    // Call create_certificate_template function
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::create_certificate_template`,
      arguments: [
        txb.pure(issuerCapId), // IssuerCap object ID
        txb.pure(Array.from(new TextEncoder().encode(templateName))),
        txb.pure(Array.from(new TextEncoder().encode(description))),
        txb.pure(Array.from(new TextEncoder().encode(imageTemplateUrl || ""))),
        txb.pure(
          Array.from(new TextEncoder().encode(certificateType || "certificate"))
        ),
        txb.pure(fieldBytes), // vector<vector<u8>>
        txb.pure(CERTIFICATE_REGISTRY), // Certificate registry object ID
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
        showBalanceChanges: true,
      },
    });

    // Find the created template object
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

    console.log("✅ Certificate template created:", {
      transactionDigest: result.digest,
      templateId,
      gasUsed: result.effects?.gasUsed,
    });

    return NextResponse.json({
      success: true,
      templateId,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      message: "Certificate template created successfully",
    });
  } catch (error) {
    console.error("❌ Template creation failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
