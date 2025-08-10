import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { bcs } from "@mysten/sui/bcs";
import { getServerSigner } from "@/server/signer";
import { decodeCertificateError } from "@/lib/errors/suiErrorMap";
import { db } from "@/db/db";
import { certificates as certs } from "@/db/schema";
import { randomUUID } from "crypto";

const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;
const CERTIFICATE_REGISTRY = process.env.CERTIFICATE_REGISTRY!;

export async function POST(request: NextRequest) {
  try {
    const {
      templateId,
      recipientAddress,
      walletAddress,
      issuerPrivateKey,
      fieldData,
      payGasWithIssuer = true,
    } = await request.json();

    console.log("🏷️ Direct issue and mint certificate as NFT...");
    console.log("📋 Template:", templateId);
    console.log("👤 Recipient:", recipientAddress);
    console.log("💰 Gas payer:", payGasWithIssuer ? "Issuer" : "Admin");

    // Validate required parameters
    if (!templateId || !recipientAddress || !walletAddress || !fieldData) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required parameters",
        },
        { status: 400 }
      );
    }

    // Parse issuer private key
    let issuerKeypair: Ed25519Keypair;
    try {
      if (issuerPrivateKey.startsWith("suiprivkey1")) {
        const keyWithoutPrefix = issuerPrivateKey.slice(11);
        const keyBytes = Buffer.from(keyWithoutPrefix, "base64");
        if (keyBytes.length >= 33) {
          const privateKeyBytes = keyBytes.slice(1, 33);
          issuerKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        } else {
          throw new Error("Invalid key length");
        }
      } else {
        throw new Error("Invalid private key format");
      }
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid issuer private key format",
        },
        { status: 400 }
      );
    }

    // Find issuer cap from database via user wallet address
    const user = await db.query.users.findFirst({
      where: (users, { eq }) => eq(users.userAddress, walletAddress),
      with: {
        issuer: true,
      },
    });

    if (!user?.issuer?.issuerKey) {
      return NextResponse.json(
        {
          success: false,
          error: "Issuer not found or not approved",
        },
        { status: 404 }
      );
    }

    const issuerCapId = user.issuer.issuerKey;
    const issuerId = user.issuer.id;

    // Prepare field data
    const fieldNames = Object.keys(fieldData);
    const fieldValues = Object.values(fieldData).map(String);

    // Serialize field data for Move call
    const serializedFieldNames = bcs
      .vector(bcs.vector(bcs.u8()))
      .serialize(
        fieldNames.map((name) => Array.from(new TextEncoder().encode(name)))
      );
    const serializedFieldValues = bcs
      .vector(bcs.vector(bcs.u8()))
      .serialize(
        fieldValues.map((value) => Array.from(new TextEncoder().encode(value)))
      );

    // No expiry date for now
    const serializedExpiryDate = bcs.option(bcs.u64()).serialize(null);

    // Generate client provided ID
    const clientProvidedId = randomUUID();
    const serializedClientId = bcs
      .vector(bcs.u8())
      .serialize(Array.from(new TextEncoder().encode(clientProvidedId)));

    // Create transaction
    const txb = new Transaction();
    const getMintGasBudget = () => {
      const envVal = process.env.DIRECT_MINT_GAS_BUDGET;
      if (envVal) {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 15_000_000; // 15M MIST for direct minting
    };
    txb.setGasBudget(getMintGasBudget());

    // Call issue_and_mint_certificate function
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::issue_and_mint_certificate`,
      arguments: [
        txb.object(issuerCapId), // IssuerCap object
        txb.object(templateId), // CertificateTemplate object
        txb.pure.address(recipientAddress), // recipient address
        txb.pure(serializedFieldNames), // vector<vector<u8>> field names
        txb.pure(serializedFieldValues), // vector<vector<u8>> field values
        txb.pure(serializedExpiryDate), // Option<u64> expiry date
        txb.pure(serializedClientId), // client_provided_id
        txb.object(CERTIFICATE_REGISTRY), // registry object
      ],
    });

    const gasPayerKeypair = payGasWithIssuer
      ? issuerKeypair
      : getServerSigner();

    const result = await client.signAndExecuteTransaction({
      signer: gasPayerKeypair,
      transaction: txb,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    // Find the created NFT object
    let nftId = null;
    if (result.objectChanges) {
      for (const change of result.objectChanges) {
        if (
          change.type === "created" &&
          change.objectType?.includes("CertificateNFT")
        ) {
          nftId = change.objectId;
          break;
        }
      }
    }

    // Extract events
    const events = result.events || [];
    const issuedEvent = events.find((event) =>
      event.type?.includes("CertificateIssuedEvent")
    );
    const mintedEvent = events.find((event) =>
      event.type?.includes("CertificateMintedEvent")
    );

    console.log("✅ Certificate issued and minted as NFT:", {
      transactionDigest: result.digest,
      nftId,
      gasUsed: result.effects?.gasUsed,
      issuedEvent,
      mintedEvent,
    });

    // Save to database
    try {
      const certificateHash = `direct-mint-${result.digest.substring(0, 16)}`;

      const [newCertificate] = await db
        .insert(certs)
        .values({
          templateId: templateId,
          issuerId: issuerId,
          recipientName:
            fieldData.participantName || fieldData.name || "Unknown",
          recipientEmail: fieldData.email || "",
          recipientWallet: recipientAddress,
          certificateData: fieldData,
          certificateHash: certificateHash,
          transactionDigest: result.digest,
          blockchainId: nftId, // NFT object ID
          clientProvidedId: clientProvidedId,
          status: "minted", // Already minted
          issuedAt: new Date(),
        })
        .returning();

      console.log("📝 Database certificate record created:", newCertificate.id);
    } catch (dbError) {
      console.warn("⚠️ Database record creation failed:", dbError);
      // Don't fail the whole operation for DB issues
    }

    return NextResponse.json({
      success: true,
      nftId,
      certificateId: nftId, // Same as NFT ID since it's direct minting
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      recipientAddress,
      templateId,
      clientProvidedId,
      issuedEvent,
      mintedEvent,
      message: "Certificate directly issued and minted as NFT",
      viewOnExplorer: `https://suiexplorer.com/object/${nftId}?network=devnet`,
    });
  } catch (error) {
    console.error("❌ Direct certificate minting failed:", error);

    let friendlyError = "Unknown error occurred during minting";
    if (error instanceof Error) {
      const match = error.message.match(/MoveAbort\((\d+)\)/);
      if (match) {
        friendlyError = decodeCertificateError(Number(match[1]));
      } else {
        friendlyError = error.message;
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: friendlyError,
      },
      { status: 500 }
    );
  }
}
