import { NextRequest, NextResponse } from "next/server";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

const client = new SuiClient({ url: getFullnodeUrl("devnet") });

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const address = searchParams.get("address");

    if (!address) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Get the wallet balance
    const balance = await client.getBalance({
      owner: address,
    });

    // Convert from MIST to SUI (1 SUI = 1,000,000,000 MIST)
    const balanceInSui = parseInt(balance.totalBalance) / 1_000_000_000;
    const balanceInMist = parseInt(balance.totalBalance);

    return NextResponse.json({
      success: true,
      address,
      balance: {
        sui: balanceInSui,
        mist: balanceInMist,
        formatted: `${balanceInSui.toFixed(
          4
        )} SUI (${balanceInMist.toLocaleString()} MIST)`,
      },
    });
  } catch (error) {
    console.error("Balance fetch failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
