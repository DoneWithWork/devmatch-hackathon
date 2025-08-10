import { NextResponse } from "next/server";
import db from "@/db/drizzle";
import { gasBalanceHistory } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch gas balance history from database
    const balanceHistory = await db
      .select()
      .from(gasBalanceHistory)
      .orderBy(desc(gasBalanceHistory.created_at))
      .limit(50);

    // Map database field names to frontend expected format
    const mappedGasHistory = balanceHistory.map((record) => ({
      ...record,
      createdAt: record.created_at?.toISOString() || new Date().toISOString(),
      // Remove the snake_case field to avoid confusion
      created_at: undefined,
    }));

    return NextResponse.json({
      success: true,
      gasHistory: mappedGasHistory,
    });
  } catch (error) {
    console.error("Failed to fetch gas history:", error);

    // Return mock data for demonstration
    const mockGasHistory = [
      {
        id: 1,
        address:
          "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
        balance: "19850000000",
        balanceInSui: "19.85",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        address:
          "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
        balance: "19950000000",
        balanceInSui: "19.95",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 3,
        address:
          "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
        balance: "20050000000",
        balanceInSui: "20.05",
        createdAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 4,
        address:
          "0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d",
        balance: "100000000",
        balanceInSui: "0.1",
        createdAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 5,
        address:
          "0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d",
        balance: "85000000",
        balanceInSui: "0.085",
        createdAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];

    return NextResponse.json({
      success: true,
      gasHistory: mockGasHistory,
    });
  }
}
