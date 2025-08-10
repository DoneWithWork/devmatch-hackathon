import { SuiClient } from "@mysten/sui.js/client";
import { db } from "@/db/db";
import { gasBalanceHistory } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export interface BalanceRecord {
  address: string;
  balance: string;
  balanceInSui: string;
  previousBalance?: string;
  change?: string;
  changeInSui?: string;
  changeType?: "increase" | "decrease";
  reason?: string;
  transactionId?: number;
  blockNumber?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Get the current balance from the blockchain
 */
export async function getCurrentBalance(client: SuiClient, address: string) {
  try {
    const balance = await client.getBalance({ owner: address });
    return {
      totalBalance: balance.totalBalance,
      balanceInSui: (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(9),
    };
  } catch (error) {
    console.error(`Failed to get balance for ${address}:`, error);
    return null;
  }
}

/**
 * Get the last recorded balance for an address
 */
export async function getLastRecordedBalance(address: string) {
  try {
    const lastRecord = await db
      .select()
      .from(gasBalanceHistory)
      .where(eq(gasBalanceHistory.address, address))
      .orderBy(desc(gasBalanceHistory.created_at))
      .limit(1);

    return lastRecord[0] || null;
  } catch (error) {
    console.error(`Failed to get last balance for ${address}:`, error);
    return null;
  }
}

/**
 * Calculate balance change information
 */
export function calculateBalanceChange(
  currentBalance: string,
  previousBalance?: string
) {
  if (!previousBalance) {
    return {
      change: "0",
      changeInSui: "0.000000000",
      changeType: undefined,
    };
  }

  const current = parseInt(currentBalance);
  const previous = parseInt(previousBalance);
  const change = current - previous;
  const changeInSui = (change / 1_000_000_000).toFixed(9);

  return {
    change: Math.abs(change).toString(),
    changeInSui: Math.abs(parseFloat(changeInSui)).toFixed(9),
    changeType:
      change > 0
        ? ("increase" as const)
        : change < 0
        ? ("decrease" as const)
        : undefined,
  };
}

/**
 * Record a gas balance change in the database
 */
export async function recordGasBalance(params: BalanceRecord) {
  try {
    console.log("📊 Recording gas balance:", {
      address: params.address.slice(0, 8) + "...",
      balance: params.balance,
      balanceInSui: params.balanceInSui,
      change: params.change,
      changeType: params.changeType,
      reason: params.reason,
    });

    const [record] = await db
      .insert(gasBalanceHistory)
      .values({
        address: params.address,
        balance: params.balance,
        balanceInSui: params.balanceInSui,
        previousBalance: params.previousBalance,
        change: params.change,
        changeInSui: params.changeInSui,
        changeType: params.changeType,
        reason: params.reason,
        transactionId: params.transactionId,
        blockNumber: params.blockNumber,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      })
      .returning();

    console.log("✅ Gas balance recorded successfully:", record.id);
    return record;
  } catch (error) {
    console.error("❌ Failed to record gas balance:", error);
    throw error;
  }
}

/**
 * Track balance change for an address with automatic previous balance lookup
 */
export async function trackBalanceChange(
  client: SuiClient,
  address: string,
  reason: string,
  transactionId?: number,
  metadata?: Record<string, unknown>
) {
  try {
    // Get current balance from blockchain
    const currentBalanceData = await getCurrentBalance(client, address);
    if (!currentBalanceData) {
      throw new Error(`Could not fetch current balance for ${address}`);
    }

    // Get last recorded balance
    const lastRecord = await getLastRecordedBalance(address);
    const previousBalance = lastRecord?.balance;

    // Calculate change
    const changeInfo = calculateBalanceChange(
      currentBalanceData.totalBalance,
      previousBalance
    );

    // Record the balance
    const record = await recordGasBalance({
      address,
      balance: currentBalanceData.totalBalance,
      balanceInSui: currentBalanceData.balanceInSui,
      previousBalance,
      change: changeInfo.change,
      changeInSui: changeInfo.changeInSui,
      changeType: changeInfo.changeType,
      reason,
      transactionId,
      metadata,
    });

    // Emit event to notify frontend of balance change
    await notifyBalanceChange(address, currentBalanceData);

    return {
      currentBalance: currentBalanceData.totalBalance,
      previousBalance,
      change: changeInfo.change,
      changeType: changeInfo.changeType,
    };
  } catch (error) {
    console.error("❌ Failed to track balance change:", error);
    throw error;
  }
}

/**
 * Initialize gas balance tracking for an address (first-time setup)
 */
export async function initializeBalanceTracking(
  client: SuiClient,
  address: string,
  reason: string = "Initial balance setup"
) {
  try {
    const currentBalanceData = await getCurrentBalance(client, address);
    if (!currentBalanceData) {
      throw new Error(`Could not fetch initial balance for ${address}`);
    }

    await recordGasBalance({
      address,
      balance: currentBalanceData.totalBalance,
      balanceInSui: currentBalanceData.balanceInSui,
      reason,
    });

    // Emit event to notify frontend of balance initialization
    await notifyBalanceChange(address, currentBalanceData);

    console.log(
      `✅ Initialized balance tracking for ${address.slice(0, 8)}...`
    );
    return currentBalanceData;
  } catch (error) {
    console.error("❌ Failed to initialize balance tracking:", error);
    throw error;
  }
}

/**
 * Notify frontend of balance changes using Server-Sent Events
 */
export async function notifyBalanceChange(
  address: string,
  balanceData: { totalBalance: string; balanceInSui: string }
) {
  try {
    // Send notification to balance update API endpoint
    await fetch(
      `${
        process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
      }/api/admin/balance-update`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address,
          balance: balanceData.totalBalance,
          balanceInSui: balanceData.balanceInSui,
          timestamp: new Date().toISOString(),
        }),
      }
    );
  } catch (error) {
    console.warn("⚠️ Failed to notify balance change:", error);
    // Don't throw - this is not critical to the main functionality
  }
}
