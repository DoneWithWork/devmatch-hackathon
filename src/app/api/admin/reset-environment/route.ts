import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST() {
  try {
    const backupEnvPath = path.join(process.cwd(), ".env.local.backup");
    const currentEnvPath = path.join(process.cwd(), ".env.local");

    if (!fs.existsSync(backupEnvPath)) {
      return NextResponse.json({
        success: false,
        error: "Backup file not found",
      });
    }

    // Read backup content
    const backupContent = fs.readFileSync(backupEnvPath, "utf8");

    // Write to current .env.local
    fs.writeFileSync(currentEnvPath, backupContent);

    return NextResponse.json({
      success: true,
      message:
        "Environment reset from backup successfully. Please restart the server.",
    });
  } catch (error) {
    console.error("Reset environment error:", error);
    return NextResponse.json({
      success: false,
      error: `Failed to reset environment: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
    });
  }
}
