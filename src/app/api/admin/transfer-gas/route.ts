import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { eq } from "drizzle-orm";
import db from "@/db/drizzle";
import { transactions, gasBalanceHistory } from "@/db/schema";
import {
  recordTransaction,
  updateTransactionStatus,
} from "@/utils/transactionLogger";
import { trackBalanceChange } from "@/utils/gasBalanceTracker";

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

export async function POST(request: NextRequest) {
  try {
    const { recipientAddress, amount, amountType, description } =
      await request.json();

    if (!recipientAddress || !amount) {
      return NextResponse.json(
        { error: "Recipient address and amount are required" },
        { status: 400 }
      );
    }

    // Validate address format
    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 66) {
      return NextResponse.json(
        { error: "Invalid Sui address format" },
        { status: 400 }
      );
    }

    // Setup Sui client and admin wallet
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    const adminPrivateKey = process.env.SUI_PRIVATE_KEY!;
    const adminKeypair = parsePrivateKey(adminPrivateKey);
    const adminAddress = adminKeypair.getPublicKey().toSuiAddress();

    // Check admin balance first
    const balance = await client.getBalance({
      owner: adminAddress,
    });

    const transferAmount = BigInt(amount);
    const currentBalance = BigInt(balance.totalBalance);

    if (transferAmount > currentBalance) {
      return NextResponse.json(
        { error: "Insufficient admin balance" },
        { status: 400 }
      );
    }

    // Create transaction for gas transfer
    const txb = new TransactionBlock();
    txb.setGasBudget(2000000); // 2M MIST for the transfer transaction itself

    // Split coins and transfer
    const [coin] = txb.splitCoins(txb.gas, [
      txb.pure(transferAmount.toString()),
    ]);
    txb.transferObjects([coin], txb.pure(recipientAddress));

    // Record transaction in database (before execution) using the utility
    const transactionRecord = await recordTransaction({
      transactionHash: "", // Will be updated after execution
      transactionType: "gas_transfer",
      status: "pending",
      fromAddress: adminAddress,
      toAddress: recipientAddress,
      amount: amount.toString(),
      description: description || "Gas transfer to issuer",
      metadata: {
        amountType,
        transferAmount: amount.toString(),
      },
    });

    try {
      // Execute the transaction
      const result = await client.signAndExecuteTransactionBlock({
        signer: adminKeypair,
        transactionBlock: txb,
        options: {
          showInput: true,
          showEffects: true,
          showEvents: true,
          showObjectChanges: true,
        },
      });

      // Update transaction record with success
      await updateTransactionStatus(result.digest, "success", {
        gasUsed: result.effects?.gasUsed?.computationCost?.toString() || "0",
        gasFee: result.effects?.gasUsed?.storageCost?.toString() || "0",
      });

      // Also update the transaction with the hash since it was empty initially
      await db
        .update(transactions)
        .set({
          transactionHash: result.digest,
          completedAt: new Date(),
        })
        .where(eq(transactions.id, transactionRecord.id));

      // Record balance changes using the improved tracker
      try {
        // Track admin balance change (sender)
        await trackBalanceChange(
          client,
          adminAddress,
          `Gas transfer sent to ${recipientAddress.slice(0, 8)}...`,
          transactionRecord.id,
          {
            transferType: "outgoing",
            recipientAddress,
            amountTransferred: amount.toString(),
            amountType,
          }
        );

        // Track recipient balance change
        await trackBalanceChange(
          client,
          recipientAddress,
          `Gas transfer received from admin`,
          transactionRecord.id,
          {
            transferType: "incoming",
            senderAddress: adminAddress,
            amountReceived: amount.toString(),
            amountType,
          }
        );

        console.log("✅ Gas balance history recorded for both addresses");
      } catch (balanceError) {
        console.error("⚠️ Failed to record gas balance history:", balanceError);
        // Don't fail the whole transaction for balance recording issues
      }

      return NextResponse.json({
        success: true,
        message: `Successfully transferred ${
          amountType === "sui"
            ? (parseInt(amount) / 1000000000).toFixed(3) + " SUI"
            : (parseInt(amount) / 1000000).toFixed(2) + "M MIST"
        } to ${recipientAddress.slice(0, 8)}...`,
        transactionHash: result.digest,
        gasUsed: result.effects?.gasUsed,
        transactionId: transactionRecord.id,
      });
    } catch (blockchainError) {
      // Update transaction record with failure using utility
      await updateTransactionStatus(
        "", // No hash since transaction failed
        "failed",
        {
          error:
            blockchainError instanceof Error
              ? blockchainError.message
              : "Unknown blockchain error",
        }
      );

      throw blockchainError;
    }
  } catch (error) {
    console.error("Gas transfer error:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Transfer failed",
        details: "Please check your configuration and try again",
      },
      { status: 500 }
    );
  }
}
