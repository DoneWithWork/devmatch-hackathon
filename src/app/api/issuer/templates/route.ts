import { NextRequest, NextResponse } from "next/server";

// Get Issuer Templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const issuerAddress = searchParams.get("issuerAddress");

    if (!issuerAddress) {
      return NextResponse.json(
        { success: false, error: "Issuer address is required" },
        { status: 400 }
      );
    }

    // For now, return mock data since we need to integrate with smart contract
    // In a real implementation, you would:
    // 1. Get the issuer's IssuerCap from the database
    // 2. Query the smart contract for templates created by this issuer
    // 3. Return the template data

    const mockTemplates = [
      {
        id: "template_1",
        name: "Course Completion Certificate",
        description:
          "Certificate awarded upon successful completion of a course",
        fields: ["Student Name", "Course Title", "Completion Date", "Grade"],
        createdAt: new Date().toISOString(),
        onChainId:
          "0x62cb445e92e73612e1469811def9f0348ef0a20e24c4b38996aedee0736c52b0", // Real-looking template object ID
      },
      {
        id: "template_2",
        name: "Workshop Attendance Certificate",
        description: "Certificate confirming workshop attendance",
        fields: ["Participant Name", "Workshop Title", "Date", "Duration"],
        createdAt: new Date().toISOString(),
        onChainId:
          "0x3ea1fe3316c8a23883099e55a4435af896acbd307db49ac4a4a297bc4ddd2a7f", // Real-looking template object ID
      },
    ];

    console.log("📝 Fetching templates for issuer:", issuerAddress);

    return NextResponse.json({
      success: true,
      issuerAddress,
      templates: mockTemplates,
      count: mockTemplates.length,
    });
  } catch (error) {
    console.error("❌ Failed to fetch issuer templates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
