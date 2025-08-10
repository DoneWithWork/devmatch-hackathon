import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getServerSigner } from "@/server/signer";
import { decodeCertificateError } from "@/lib/errors/suiErrorMap";
import { db } from "@/db/db";
import { certificates as certs } from "@/db/schema";
import { eq } from "drizzle-orm";

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
      recipientPrivateKey, // Still needed if recipient signs; to replace with wallet-based flow later
      payGasWithIssuer = true,
    } = await request.json();

    console.log("🏷️ Minting certificate as NFT...");
    console.log("📜 Certificate:", certificateId);
    console.log("👤 Recipient:", recipientAddress);

    // Choose who pays for gas
    const gasPayerKeypair = payGasWithIssuer
      ? getServerSigner()
      : parsePrivateKey(recipientPrivateKey);

    const txb = new TransactionBlock();
    const getMintGasBudget = () => {
      const envVal = process.env.MINT_GAS_BUDGET;
      if (envVal) {
        const parsed = parseInt(envVal, 10);
        if (!isNaN(parsed) && parsed > 0) return parsed;
      }
      return 10_000_000; // reduced from 20M after optimization
    };
    txb.setGasBudget(getMintGasBudget());

    // Call mint_certificate_nft function
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::mint_certificate_nft`,
      arguments: [
        txb.object(certificateId),
        txb.pure.address(recipientAddress),
        txb.pure(Array.from(new TextEncoder().encode("pending"))), // placeholder label replaced post-exec
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

    // Persist mint status using blockchainId linkage
    try {
      if (certificateId && nftId) {
        await db
          .update(certs)
          .set({ status: "minted", transactionDigest: result.digest })
          .where(eq(certs.blockchainId, certificateId));
      }
    } catch (e) {
      console.warn("DB mint update failed", e);
    }

    // Second transaction to update mint tx id label from placeholder to real digest
    if (certificateId && recipientAddress) {
      try {
        const follow = new TransactionBlock();
        const updateBudget = (() => {
          const envVal = process.env.MINT_LABEL_UPDATE_GAS_BUDGET;
          if (envVal) {
            const parsed = parseInt(envVal, 10);
            if (!isNaN(parsed) && parsed > 0) return parsed;
          }
          return 3_000_000; // reduced label update budget
        })();
        follow.setGasBudget(updateBudget);
        follow.moveCall({
          target: `${PACKAGE_ID}::certificate::update_mint_tx_id`,
          arguments: [
            follow.object(certificateId),
            follow.pure.address(recipientAddress),
            follow.pure(Array.from(new TextEncoder().encode(result.digest))),
          ],
        });
        await client.signAndExecuteTransactionBlock({
          signer: gasPayerKeypair,
          transactionBlock: follow,
          options: { showEffects: true },
        });
      } catch (e) {
        console.warn("Mint label update failed", e);
      }
    }

    // TODO: Consider passing digest inside a follow-up transaction if strict integrity needed.
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
      mintLabelFinal: result.digest,
    });
  } catch (error) {
    console.error("❌ Certificate minting failed:", error);
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
