import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/utils/session";
import { getSuiClient } from "@/utils/suiClient";

const client = getSuiClient();

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session.userAddress) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    // Get the balance for the user's address
    const balance = await client.getBalance({
      owner: session.userAddress,
    });

    return NextResponse.json({
      balance: balance.totalBalance,
      coinType: balance.coinType,
      formatted: (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4),
    });
  } catch (error) {
    console.error("Gas balance fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gas balance" },
      { status: 500 }
    );
  }
}
