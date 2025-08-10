import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Use the fixed admin wallet address from environment
    const adminAddress = process.env.ADMIN_WALLET_ADDRESS;

    if (!adminAddress) {
      return NextResponse.json(
        {
          error: "Admin wallet address not configured in environment variables",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      adminAddress,
    });
  } catch (error) {
    console.error("Failed to get admin address:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
