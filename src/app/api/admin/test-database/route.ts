import { NextResponse } from "next/server";
import { db } from "@/db/db";

export async function GET() {
  try {
    // Simple database connection test
    await db.execute("SELECT 1");

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json({
      success: false,
      error: `Database connection failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
