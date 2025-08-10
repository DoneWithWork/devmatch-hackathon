import { NextResponse } from "next/server";
import { SuiClient } from "@mysten/sui/client";

export async function GET() {
  try {
    const client = new SuiClient({
      url: "https://fullnode.devnet.sui.io:443",
    });

    const adminAddress =
      "0x1c59329774af3cc71f768152458ead83001f9a0c259809b8dfc66ab646bb172d";

    const balance = await client.getBalance({
      owner: adminAddress,
      coinType: "0x2::sui::SUI",
    });

    const balanceInSui = parseInt(balance.totalBalance) / 1000000000;
    const requiredAmount = 5.1; // 5.1 SUI (5 SUI + buffer for gas)

    return NextResponse.json({
      success: true,
      adminAddress,
      balance: balance.totalBalance,
      balanceInSui: balanceInSui.toFixed(2),
      required: requiredAmount,
      hasSufficientBalance: balanceInSui >= requiredAmount,
      message:
        balanceInSui >= requiredAmount
          ? "✅ Sufficient balance for gas sponsorship testing"
          : `❌ Insufficient balance. Need ${(
              requiredAmount - balanceInSui
            ).toFixed(2)} more SUI`,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `Failed to check balance: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
