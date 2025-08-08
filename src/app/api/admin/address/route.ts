import { NextResponse } from "next/server";
import { getAdminAddressFromPrivateKey } from "@/utils/adminUtils";

export async function GET() {
  try {
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;

    if (!adminPrivateKey) {
      return NextResponse.json(
        { error: "Admin private key not configured" },
        { status: 500 }
      );
    }

    const adminAddress = getAdminAddressFromPrivateKey(adminPrivateKey);

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
