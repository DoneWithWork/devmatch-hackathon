import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";

// Smart contract configuration
const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;

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

// Mint Certificate as NFT
export async function POST(request: NextRequest) {
  try {
    const {
      certificateId,
      recipientAddress,
      recipientPrivateKey, // The user needs to sign to receive the NFT
      issuerPrivateKey, // For gas payment (or recipient can pay)
      payGasWithIssuer = true,
    } = await request.json();

    console.log("🏷️ Minting certificate as NFT...");
    console.log("📜 Certificate:", certificateId);
    console.log("👤 Recipient:", recipientAddress);

    // Choose who pays for gas
    const gasPayerKey = payGasWithIssuer
      ? issuerPrivateKey
      : recipientPrivateKey;
    const gasPayerKeypair = parsePrivateKey(gasPayerKey);

    const txb = new TransactionBlock();
    txb.setGasBudget(20000000); // 20M MIST for NFT minting

    // Call mint_certificate_nft function
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::mint_certificate_nft`,
      arguments: [
        txb.pure(certificateId), // IssuedCertificate object ID
        txb.pure(recipientAddress), // recipient address for the NFT
      ],
    });

    const result = await client.signAndExecuteTransactionBlock({
      signer: gasPayerKeypair, // Who pays for gas
      transactionBlock: txb,
      options: {
        showInput: true,
        showEffects: true,
        showEvents: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    });

    // Find the minted NFT object
    let nftId = null;
    if (result.objectChanges) {
      for (const change of result.objectChanges) {
        if (
          change.type === "created" &&
          (change.objectType?.includes("CertificateNFT") ||
            (change.objectType?.includes("Certificate") &&
              !change.objectType?.includes("Template")))
        ) {
          nftId = change.objectId;
          break;
        }
      }
    }

    // Extract minting events
    const events = result.events || [];
    const mintedEvent = events.find((event) =>
      event.type?.includes("CertificateMintedEvent")
    );

    console.log("✅ Certificate NFT minted:", {
      transactionDigest: result.digest,
      nftId,
      gasUsed: result.effects?.gasUsed,
      event: mintedEvent,
    });

    return NextResponse.json({
      success: true,
      nftId,
      certificateId,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      recipientAddress,
      event: mintedEvent,
      message:
        "Certificate successfully minted as NFT and transferred to recipient",
      viewOnExplorer: `https://suiexplorer.com/object/${nftId}?network=devnet`,
    });
  } catch (error) {
    console.error("❌ Certificate minting failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
