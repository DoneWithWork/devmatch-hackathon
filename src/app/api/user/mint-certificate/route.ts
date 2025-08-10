import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { db } from "@/db/db";
import { certificates as certs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { decodeCertificateError } from "@/lib/errors/suiErrorMap";

const client = new SuiClient({ url: getFullnodeUrl("devnet") });
const PACKAGE_ID = process.env.PACKAGE_ID!;

export async function POST(request: NextRequest) {
  try {
    const {
      certificateId, // This should be the blockchain certificate object ID
      userAddress,
      userPrivateKey, // User must sign the minting transaction
      gasBudget = 10000000, // 10M MIST for minting
    } = await request.json();

    console.log("🏷️ User minting certificate as NFT...");
    console.log("📜 Certificate ID:", certificateId);
    console.log("👤 User Address:", userAddress);

    // Validate required parameters
    if (!certificateId || !userAddress || !userPrivateKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required parameters: certificateId, userAddress, and userPrivateKey",
        },
        { status: 400 }
      );
    }

    // Parse user private key
    let userKeypair: Ed25519Keypair;
    try {
      if (userPrivateKey.startsWith("suiprivkey1")) {
        const keyWithoutPrefix = userPrivateKey.slice(11);
        const keyBytes = Buffer.from(keyWithoutPrefix, "base64");
        if (keyBytes.length >= 33) {
          const privateKeyBytes = keyBytes.slice(1, 33);
          userKeypair = Ed25519Keypair.fromSecretKey(privateKeyBytes);
        } else {
          throw new Error("Invalid key length");
        }
      } else {
        throw new Error("Invalid private key format");
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user private key format",
        },
        { status: 400 }
      );
    }

    // Verify the user address matches the keypair
    const derivedAddress = userKeypair.getPublicKey().toSuiAddress();
    if (derivedAddress !== userAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "User address does not match provided private key",
        },
        { status: 400 }
      );
    }

    // Create minting transaction
    const txb = new Transaction();
    txb.setGasBudget(gasBudget);

    // Call mint_certificate_nft function
    // Only the certificate recipient can mint (access control in smart contract)
    txb.moveCall({
      target: `${PACKAGE_ID}::certificate::mint_certificate_nft`,
      arguments: [
        txb.object(certificateId), // Certificate object to mint
        txb.pure.address(userAddress), // Recipient address (must match certificate recipient)
        txb.pure(new Uint8Array(new TextEncoder().encode("pending"))), // Placeholder label
      ],
    });

    console.log("🔗 Executing minting transaction...");

    const result = await client.signAndExecuteTransaction({
      signer: userKeypair,
      transaction: txb,
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
          change.objectType?.includes("CertificateNFT")
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

    console.log("✅ Certificate NFT minted by user:", {
      transactionDigest: result.digest,
      nftId,
      gasUsed: result.effects?.gasUsed,
      event: mintedEvent,
    });

    // Update database to reflect minting status
    try {
      if (certificateId && nftId) {
        await db
          .update(certs)
          .set({
            status: "minted",
            transactionDigest: result.digest,
          })
          .where(eq(certs.blockchainId, certificateId));

        console.log("📝 Database updated with mint status");
      }
    } catch (e) {
      console.warn("⚠️ Database mint update failed:", e);
      // Don't fail the whole operation for DB issues
    }

    // Second transaction to update mint tx id label from placeholder to real digest
    try {
      const followUpTxb = new Transaction();
      followUpTxb.setGasBudget(3000000); // 3M MIST for label update

      followUpTxb.moveCall({
        target: `${PACKAGE_ID}::certificate::update_mint_tx_id`,
        arguments: [
          followUpTxb.object(certificateId),
          followUpTxb.pure.address(userAddress),
          followUpTxb.pure(
            new Uint8Array(new TextEncoder().encode(result.digest))
          ),
        ],
      });

      await client.signAndExecuteTransaction({
        signer: userKeypair,
        transaction: followUpTxb,
        options: { showEffects: true },
      });

      console.log("🏷️ Mint transaction label updated");
    } catch (e) {
      console.warn("⚠️ Mint label update failed:", e);
      // This is not critical, continue with success response
    }

    return NextResponse.json({
      success: true,
      nftId,
      certificateId,
      transactionDigest: result.digest,
      gasUsed: result.effects?.gasUsed,
      userAddress,
      event: mintedEvent,
      message: "Certificate successfully minted as NFT and transferred to user",
      viewOnExplorer: `https://suiexplorer.com/object/${nftId}?network=devnet`,
      mintTxDigest: result.digest,
    });
  } catch (error) {
    console.error("❌ User certificate minting failed:", error);

    let friendlyError = "Unknown error occurred during minting";
    if (error instanceof Error) {
      // Check for Move abort errors
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
