import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import {
  initializeBalanceTracking,
  trackBalanceChange,
} from "@/utils/gasBalanceTracker";
import { getAdminAddressFromPrivateKey } from "@/utils/adminUtils";

export async function POST(request: NextRequest) {
  try {
    const { addresses, forceRefresh } = await request.json();

    const client = new SuiClient({ url: getFullnodeUrl("devnet") });
    const results = [];

    // If no addresses provided, initialize admin address
    const addressesToTrack = addresses || [];

    // Always include admin address
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (adminPrivateKey) {
      const adminAddress = getAdminAddressFromPrivateKey(adminPrivateKey);
      if (!addressesToTrack.includes(adminAddress)) {
        addressesToTrack.push(adminAddress);
      }
    }

    // Initialize or update balance tracking for each address
    for (const address of addressesToTrack) {
      try {
        let result;
        if (forceRefresh) {
          // Track current balance as a refresh
          result = await trackBalanceChange(
            client,
            address,
            "Balance refresh/sync",
            undefined,
            { operation: "manual_refresh" }
          );
        } else {
          // Initialize if no previous records
          result = await initializeBalanceTracking(
            client,
            address,
            "Initial balance setup"
          );
        }

        results.push({
          address,
          success: true,
          balance:
            "currentBalance" in result
              ? result.currentBalance
              : result.totalBalance,
          balanceInSui:
            "balanceInSui" in result ? result.balanceInSui : "0.000000000",
        });

        console.log(
          `✅ Initialized balance tracking for ${address.slice(0, 8)}...`
        );
      } catch (error) {
        console.error(`❌ Failed to initialize balance for ${address}:`, error);
        results.push({
          address,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Initialized balance tracking for ${
        results.filter((r) => r.success).length
      } addresses`,
      results,
    });
  } catch (error) {
    console.error("❌ Failed to initialize gas balance tracking:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize gas balance tracking",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: "Gas balance initialization endpoint",
    usage: {
      POST: {
        description: "Initialize gas balance tracking for addresses",
        body: {
          addresses: ["0x123...", "0x456..."], // Optional - defaults to admin
          forceRefresh: false, // Optional - whether to refresh existing records
        },
      },
    },
  });
}
