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

// Issue Certificate to User
export async function POST(request: NextRequest) {
  try {
    const {
      issuerCapId,
      templateId,
      recipientAddress,
      fieldData, // Changed from fieldNames/fieldValues to fieldData object
      expiryDate, // Optional timestamp
      issuerPrivateKey,
    } = await request.json();

    console.log("📜 Issuing certificate to user...");
    console.log("👤 Recipient:", recipientAddress);
    console.log("📋 Template:", templateId);
    console.log("📋 Field Data:", fieldData);
    console.log("🔑 IssuerCapId:", issuerCapId);
    console.log("🔐 IssuerPrivateKey present:", !!issuerPrivateKey);

    // Validate required parameters with specific error messages
    if (!issuerCapId) {
      throw new Error("Missing issuerCapId parameter");
    }
    if (!templateId) {
      throw new Error("Missing templateId parameter");
    }
    if (!recipientAddress) {
      throw new Error("Missing recipientAddress parameter");
    }
    if (!fieldData) {
      throw new Error("Missing fieldData parameter");
    }
    if (!issuerPrivateKey) {
      throw new Error("Missing issuerPrivateKey parameter");
    }

    // Validate object ID formats
    if (!issuerCapId.startsWith("0x") || issuerCapId.length < 10) {
      throw new Error(`Invalid IssuerCap ID format: ${issuerCapId}`);
    }
    if (!templateId.startsWith("0x") || templateId.length < 10) {
      throw new Error(`Invalid Template ID format: ${templateId}`);
    }
    if (!recipientAddress.startsWith("0x") || recipientAddress.length < 10) {
      throw new Error(`Invalid recipient address format: ${recipientAddress}`);
    }

    const issuerKeypair = parsePrivateKey(issuerPrivateKey);

    const txb = new TransactionBlock();
    txb.setGasBudget(15000000); // 15M MIST for certificate issuance

    // Convert fieldData object to separate arrays
    const fieldNames = Object.keys(fieldData);
    const fieldValues = Object.values(fieldData);

    console.log("🏷️ Field Names:", fieldNames);
    console.log("📝 Field Values:", fieldValues);

    // Convert field names and values to byte arrays
    const fieldNameBytes = fieldNames.map((name: string) =>
      Array.from(new TextEncoder().encode(name))
    );
    const fieldValueBytes = fieldValues.map(
      (value: unknown) => Array.from(new TextEncoder().encode(String(value))) // Ensure value is string
    );

    // Call issue_certificate function
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::issue_certificate`,
      arguments: [
        txb.pure(issuerCapId), // IssuerCap object ID
        txb.pure(templateId), // CertificateTemplate object ID
        txb.pure(recipientAddress), // recipient address
        txb.pure(fieldNameBytes), // vector<vector<u8>> field names
        txb.pure(fieldValueBytes), // vector<vector<u8>> field values
        txb.pure(expiryDate ? [expiryDate] : []), // Option<u64> expiry date
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

    // Find the issued certificate object
    let certificateId = null;
    if (result.objectChanges) {
      for (const change of result.objectChanges) {
        if (
          change.type === "created" &&
          change.objectType?.includes("IssuedCertificate")
        ) {
          certificateId = change.objectId;
          break;
        }
      }
    }

    // Extract events for additional info
    const events = result.events || [];
    const issuedEvent = events.find((event) =>
      event.type?.includes("CertificateIssuedEvent")
    );

    console.log("✅ Certificate issued:", {
      transactionDigest: result.digest,
      certificateId,
      gasUsed: result.effects?.gasUsed,
      event: issuedEvent,
    });

    return NextResponse.json({
      success: true,
      certificateId,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      recipientAddress,
      templateId,
      event: issuedEvent,
      message: "Certificate issued successfully - ready for minting",
    });
  } catch (error) {
    console.error("❌ Certificate issuance failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
