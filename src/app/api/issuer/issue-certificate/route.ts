import { NextRequest, NextResponse } from "next/server";
import { SuiClient } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromB64 } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";
import { db } from "@/db/db";
import {
  certificates as certs,
  issuers,
  users,
  individualCert,
  certificateTemplates,
} from "@/db/schema";
import { and, eq, isNull } from "drizzle-orm";
import { randomUUID } from "crypto";
import { decodeCertificateError } from "@/lib/errors/suiErrorMap";

// Smart contract configuration
const client = new SuiClient({ url: "https://fullnode.devnet.sui.io:443" });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const CERTIFICATE_REGISTRY = process.env.CERTIFICATE_REGISTRY!;

// Issue Certificate to User
export async function POST(request: NextRequest) {
  try {
    const {
      templateId,
      recipientAddress,
      fieldData, // Changed from fieldNames/fieldValues to fieldData object
      expiryDate, // Optional timestamp
      walletAddress, // Add issuer wallet address to identify the issuer
      issuerPrivateKey, // Add back issuer private key for signing
    } = await request.json();

    console.log("📜 Issuing certificate to user...");
    console.log("👤 Recipient:", recipientAddress);
    console.log("📋 Template:", templateId);
    console.log("📋 Field Data:", fieldData);
    console.log("🔑 Issuer Wallet:", walletAddress);

    // Validate required parameters with specific error messages
    if (!templateId) {
      throw new Error("Missing templateId parameter");
    }
    if (!recipientAddress) {
      throw new Error("Missing recipientAddress parameter");
    }
    if (!fieldData) {
      throw new Error("Missing fieldData parameter");
    }

    // Validate object ID formats
    if (!templateId.startsWith("0x") || templateId.length < 10) {
      throw new Error(`Invalid Template ID format: ${templateId}`);
    }
    if (!recipientAddress.startsWith("0x") || recipientAddress.length < 10) {
      throw new Error(`Invalid recipient address format: ${recipientAddress}`);
    }

    // Look up the template in database by blockchain ID to get database UUID
    console.log("🔍 Looking up template by blockchain ID:", templateId);
    const templateResult = await db
      .select()
      .from(certificateTemplates)
      .where(eq(certificateTemplates.templateUrl, templateId))
      .limit(1);

    if (!templateResult.length) {
      throw new Error(`Template not found for blockchain ID: ${templateId}`);
    }

    const dbTemplate = templateResult[0];
    const databaseTemplateId = dbTemplate.id;
    console.log("✅ Found template in database with UUID:", databaseTemplateId);

    // Look up the issuer's IssuerCap from the database
    let issuerCapId;
    if (walletAddress) {
      console.log("🔍 Looking up issuer by wallet address:", walletAddress);

      // Import necessary schema and database functions
      const { users, issuers } = await import("@/db/schema");
      const { eq } = await import("drizzle-orm");

      // Find the user by wallet address
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.userAddress, walletAddress))
        .limit(1);

      if (!userResult.length) {
        throw new Error(`User not found for wallet address: ${walletAddress}`);
      }

      // Find the issuer record for this user
      const issuerResult = await db
        .select()
        .from(issuers)
        .where(eq(issuers.userId, userResult[0].id))
        .limit(1);

      if (!issuerResult.length || !issuerResult[0].isVerified) {
        throw new Error(
          `No approved issuer found for wallet address: ${walletAddress}`
        );
      }

      issuerCapId = issuerResult[0].issuerKey;
      console.log("✅ Found issuer IssuerCap:", issuerCapId);
    } else {
      // Fallback to placeholder for backwards compatibility
      issuerCapId = "ISSUER_CAP_PLACEHOLDER";
    }

    // Create the keypair for signing
    let issuerKeypair: Ed25519Keypair;

    // Use provided issuer private key or fallback to environment variable
    const privateKeyToUse = issuerPrivateKey || process.env.SUI_PRIVATE_KEY;

    if (!privateKeyToUse) {
      return NextResponse.json(
        {
          error:
            "Issuer private key is required for certificate issuance (either provided or in environment)",
        },
        { status: 400 }
      );
    }

    // Use the private key for signing
    console.log("🔑 Using issuer private key for signing");

    try {
      // Try using the private key directly first (base64 format)
      if (process.env.ISSUER_PRIVATE_KEY_BASE64 && !issuerPrivateKey) {
        console.log("🔑 Using ISSUER_PRIVATE_KEY_BASE64 from environment");
        const keyBytes = fromB64(process.env.ISSUER_PRIVATE_KEY_BASE64);
        issuerKeypair = Ed25519Keypair.fromSecretKey(keyBytes);
      } else {
        issuerKeypair = Ed25519Keypair.fromSecretKey(privateKeyToUse);
      }
    } catch (directError) {
      console.log(
        "❌ Direct import failed, trying to decode:",
        directError instanceof Error ? directError.message : String(directError)
      );
      try {
        // If the private key is in SUI format (suiprivkey1...), decode it
        if (privateKeyToUse.startsWith("suiprivkey1")) {
          const decoded = fromB64(privateKeyToUse.slice(11)); // Remove 'suiprivkey1' prefix
          const keyBytes = decoded.slice(0, 32); // Take first 32 bytes
          issuerKeypair = Ed25519Keypair.fromSecretKey(keyBytes);
        } else {
          throw new Error("Unsupported private key format");
        }
      } catch (decodeError) {
        throw new Error(
          `Failed to parse private key: ${
            decodeError instanceof Error
              ? decodeError.message
              : String(decodeError)
          }`
        );
      }
    }

    // Verify the private key matches the expected wallet address
    const derivedAddress = issuerKeypair.getPublicKey().toSuiAddress();
    if (derivedAddress !== walletAddress) {
      throw new Error(
        `Private key does not match wallet address. Expected: ${walletAddress}, Derived: ${derivedAddress}`
      );
    }

    const getIssueGasBudget = () => {
      const envVal = process.env.ISSUE_GAS_BUDGET;
      if (envVal) {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 8_000_000; // optimized down from 15M after contract stabilization
    };

    // Deterministic linkage id (UUID v4 for now). In future could accept from client.
    const clientProvidedId = randomUUID();
    const clientProvidedIdBytes = Array.from(
      new TextEncoder().encode(clientProvidedId)
    );

    const txb = new Transaction();
    txb.setGasBudget(getIssueGasBudget());

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

    // Serialize using BCS
    const serializedFieldNames = bcs
      .vector(bcs.vector(bcs.u8()))
      .serialize(fieldNameBytes);
    const serializedFieldValues = bcs
      .vector(bcs.vector(bcs.u8()))
      .serialize(fieldValueBytes);
    const serializedClientId = bcs
      .vector(bcs.u8())
      .serialize(clientProvidedIdBytes);

    // Serialize the optional expiry date
    const serializedExpiryDate = bcs
      .option(bcs.u64())
      .serialize(expiryDate || null);

    // Call issue_certificate function
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::issue_certificate`,
      arguments: [
        txb.object(issuerCapId), // IssuerCap object - now using actual ID
        txb.object(templateId), // CertificateTemplate object
        txb.pure.address(recipientAddress), // recipient address
        txb.pure(serializedFieldNames), // vector<vector<u8>> field names
        txb.pure(serializedFieldValues), // vector<vector<u8>> field values
        txb.pure(serializedExpiryDate), // Option<u64> expiry date
        txb.pure(serializedClientId), // client_provided_id
        txb.object(CERTIFICATE_REGISTRY), // registry object
      ],
    });

    const result = await client.signAndExecuteTransaction({
      signer: issuerKeypair,
      transaction: txb,
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
      console.log(
        "🔍 Object changes:",
        result.objectChanges.map((c) => ({
          type: c.type,
          objectType: "objectType" in c ? c.objectType : undefined,
          objectId: "objectId" in c ? c.objectId : undefined,
        }))
      );

      for (const change of result.objectChanges) {
        if (
          change.type === "created" &&
          "objectType" in change &&
          change.objectType?.includes("Certificate") &&
          !change.objectType?.includes("Template") &&
          !change.objectType?.includes("Registry")
        ) {
          certificateId = change.objectId;
          console.log("🎯 Found created certificate object:", {
            objectId: change.objectId,
            objectType: change.objectType,
          });
          break;
        }
      }
    }

    // Extract events for additional info
    const events = result.events || [];
    const issuedEvent = events.find((event) =>
      event.type?.includes("CertificateIssuedEvent")
    );

    console.log(
      "📋 Events found:",
      events.map((event) => ({
        type: event.type,
        parsedJson: event.parsedJson,
      }))
    );

    if (issuedEvent && issuedEvent.parsedJson) {
      console.log("🎯 Certificate issued event:", issuedEvent.parsedJson);
      // Try to extract certificate ID from the event
      const eventData = issuedEvent.parsedJson as Record<string, unknown>;
      if (!certificateId && eventData?.certificate_id) {
        certificateId = eventData.certificate_id as string;
        console.log("📋 Found certificate ID in event:", certificateId);
      }
    }

    console.log("✅ Certificate issued:", {
      transactionDigest: result.digest,
      certificateId,
      gasUsed: result.effects?.gasUsed,
      event: issuedEvent,
    });

    // Persist blockchain linkage - Create certificate record even without blockchain object ID
    let verificationCode = null;
    try {
      // First, find the issuer record
      const issuerRecord = await db
        .select()
        .from(issuers)
        .leftJoin(users, eq(issuers.userId, users.id))
        .where(eq(users.userAddress, walletAddress))
        .limit(1);

      if (!issuerRecord.length) {
        console.warn("❌ Issuer not found for wallet:", walletAddress);
        throw new Error("Issuer not found");
      }

      const issuer = issuerRecord[0].issuers;

      // Try to update existing draft certificate first
      const updateResult = await db
        .update(certs)
        .set({
          blockchainId: certificateId,
          status: "issued",
          transactionDigest: result.digest,
          clientProvidedId,
          update_at: new Date(),
        })
        .where(
          and(
            eq(certs.recipientWallet, recipientAddress),
            eq(certs.status, "draft"),
            isNull(certs.blockchainId)
          )
        )
        .returning();

      let dbCertificateId;

      if (updateResult.length === 0) {
        // No draft certificate found, create a new one
        console.log("📝 Creating new certificate record in database");

        const [newCertificate] = await db
          .insert(certs)
          .values({
            templateId: databaseTemplateId, // Use database UUID instead of blockchain ID
            issuerId: issuer.id,
            recipientName: fieldData.participantName || "Unknown Participant",
            recipientEmail: null,
            recipientWallet: recipientAddress,
            certificateData: JSON.stringify(fieldData),
            status: "issued",
            issuedAt: new Date(),
            blockchainId: certificateId,
            transactionDigest: result.digest,
            clientProvidedId,
          })
          .returning();

        dbCertificateId = newCertificate.id;

        // Create individual certificate record with verification code
        verificationCode = `CERT-${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)
          .toUpperCase()}`;

        await db.insert(individualCert).values({
          certificateId: dbCertificateId,
          verificationCode,
        });

        console.log(
          "✅ Certificate record created with verification code:",
          verificationCode
        );
      } else {
        dbCertificateId = updateResult[0].id;
        console.log("✅ Updated existing draft certificate");

        // Get the verification code for existing certificate
        const individualCertRecord = await db
          .select({ verificationCode: individualCert.verificationCode })
          .from(individualCert)
          .where(eq(individualCert.certificateId, dbCertificateId))
          .limit(1);

        if (individualCertRecord.length > 0) {
          verificationCode = individualCertRecord[0].verificationCode;
        }
      }
    } catch (e) {
      console.warn("❌ DB certificate creation/update failed:", e);
    }

    return NextResponse.json({
      success: true,
      certificateId,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      recipientAddress,
      templateId,
      event: issuedEvent,
      blockchainId: certificateId,
      clientProvidedId,
      verificationCode,
      message: "Certificate issued successfully - ready for minting",
    });
  } catch (error) {
    console.error("❌ Certificate issuance failed:", error);
    let friendly = "Unknown error";
    if (error instanceof Error) {
      const match = error.message.match(/MoveAbort\((\d+)\)/);
      if (match) {
        friendly = decodeCertificateError(Number(match[1]));
      } else {
        friendly = error.message;
      }
    }
    return NextResponse.json(
      {
        success: false,
        error: friendly,
      },
      { status: 500 }
    );
  }
}
