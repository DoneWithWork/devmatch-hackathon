import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { getSession } from "@/utils/session";

export async function GET() {
  try {
    const session = await getSession(await cookies());

    if (!session || session.role !== "issuer") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const issuerAddress = session.userAddress;

    // Get balance from Sui network
    const client = new SuiClient({ url: getFullnodeUrl("devnet") });

    try {
      const balance = await client.getBalance({
        owner: issuerAddress,
      });

      const balanceInMist = parseInt(balance.totalBalance);
      const balanceInSui = balanceInMist / 1_000_000_000; // Convert MIST to SUI

      return NextResponse.json({
        success: true,
        address: issuerAddress,
        balance: {
          mist: balance.totalBalance,
          sui: balanceInSui.toFixed(9),
          formatted: `${balanceInSui.toFixed(3)} SUI`,
        },
        coinType: balance.coinType,
      });
    } catch (blockchainError) {
      console.error("Blockchain error:", blockchainError);

      // Return mock data if blockchain is not accessible
      return NextResponse.json({
        success: true,
        address: issuerAddress,
        balance: {
          mist: "0",
          sui: "0.000000000",
          formatted: "0.000 SUI",
        },
        coinType: "0x2::sui::SUI",
        note: "Unable to fetch real-time balance. Please check your network connection.",
      });
    }
  } catch (error) {
    console.error("Error fetching issuer balance:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
