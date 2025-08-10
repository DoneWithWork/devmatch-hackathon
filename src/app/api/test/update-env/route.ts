import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("⚠️ IssuerCapId concept has been removed from the system");

    return NextResponse.json({
      success: true,
      message: "IssuerCapId concept has been removed - no action needed",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Update env error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
