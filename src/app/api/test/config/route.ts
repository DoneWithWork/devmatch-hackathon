import { NextResponse } from "next/server";

export async function POST() {
  try {
    console.log("🧪 Mock test - checking configuration...");

    const requiredEnvVars = [
      "PACKAGE_ID",
      "CERTIFICATE_REGISTRY",
      "SUI_PRIVATE_KEY",
      "SUI_ISSUER_CAP",
      "ISSUER_REGISTRY",
    ];

    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName]
    );

    if (missingVars.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Missing environment variables: ${missingVars.join(", ")}`,
          missingVars,
        },
        { status: 500 }
      );
    }

    const config = {
      packageId: process.env.PACKAGE_ID,
      certificateRegistry: process.env.CERTIFICATE_REGISTRY,
      issuerRegistry: process.env.ISSUER_REGISTRY,
      issuerCapId: process.env.SUI_ISSUER_CAP,
      walletAddress: process.env.SUI_ADDRESS,
      network: process.env.NETWORK || "devnet",
    };

    console.log("✅ Configuration check passed");

    return NextResponse.json({
      success: true,
      message: "Configuration is valid",
      config,
      timestamp: new Date().toISOString(),
      note: "This is a mock endpoint for testing configuration only",
    });
  } catch (error) {
    console.error("❌ Configuration check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
