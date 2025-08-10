import { db } from "@/db/db";
import { transactions } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface TransactionLogData {
  transactionHash: string;
  transactionType:
    | "gas_transfer"
    | "template_creation"
    | "certificate_issuance"
    | "certificate_mint"
    | "issuer_approval"
    | "admin_operation";
  status?: "pending" | "success" | "failed" | "cancelled";
  fromAddress?: string;
  toAddress?: string;
  amount?: string;
  gasUsed?: string;
  gasFee?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  userId?: string; // Changed from number to string for UUID
  issuerApplicationId?: number;
}

/**
 * Record a blockchain transaction in the database
 */
export async function recordTransaction(data: TransactionLogData) {
  try {
    console.log("📝 Recording transaction:", data);

    const [transaction] = await db
      .insert(transactions)
      .values({
        transactionHash: data.transactionHash,
        transactionType: data.transactionType,
        status: data.status || "pending",
        fromAddress: data.fromAddress,
        toAddress: data.toAddress,
        amount: data.amount,
        gasUsed: data.gasUsed,
        gasFee: data.gasFee,
        description: data.description,
        metadata: data.metadata ? JSON.stringify(data.metadata) : null,
        userId: data.userId,
        issuerApplicationId: data.issuerApplicationId,
        // Don't manually set timestamps - let the database handle them automatically
      })
      .returning();

    console.log("✅ Transaction recorded successfully:", transaction);
    return transaction;
  } catch (error) {
    console.error("❌ Failed to record transaction:", error);
    throw error;
  }
}

/**
 * Update transaction status after completion
 */
export async function updateTransactionStatus(
  transactionHash: string,
  status: "success" | "failed" | "cancelled",
  metadata?: Record<string, unknown>
) {
  try {
    console.log(
      `📝 Updating transaction ${transactionHash} status to ${status}`
    );

    const [updated] = await db
      .update(transactions)
      .set({
        status,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
        completedAt: status === "success" ? new Date() : undefined,
        failedAt: status === "failed" ? new Date() : undefined,
        update_at: new Date(), // Update the update timestamp when modifying
      })
      .where(eq(transactions.transactionHash, transactionHash))
      .returning();

    console.log("✅ Transaction status updated:", updated);
    return updated;
  } catch (error) {
    console.error("❌ Failed to update transaction status:", error);
    throw error;
  }
}
