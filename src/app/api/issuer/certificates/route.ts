import { NextRequest, NextResponse } from "next/server";

// Get Issued Certificates by Issuer
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
    // 1. Query the smart contract for certificates issued by this issuer
    // 2. Get the certificate details including recipient and field data
    // 3. Return the certificates with their current status

    const mockCertificates = [
      {
        id: "cert_1",
        templateId: "template_1",
        templateName: "Course Completion Certificate",
        recipientAddress: "0x789...ghi",
        fieldData: {
          "Student Name": "John Doe",
          "Course Title": "Blockchain Development 101",
          "Completion Date": "2024-08-01",
          Grade: "A+",
        },
        status: "issued" as const,
        issuedAt: new Date().toISOString(),
        onChainId: "0xabc...123", // Certificate object ID
      },
      {
        id: "cert_2",
        templateId: "template_2",
        templateName: "Workshop Attendance Certificate",
        recipientAddress: "0x456...def",
        fieldData: {
          "Participant Name": "Jane Smith",
          "Workshop Title": "Advanced Smart Contracts",
          Date: "2024-07-15",
          Duration: "4 hours",
        },
        status: "minted" as const,
        issuedAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        onChainId: "0xdef...789",
        nftId: "0x999...nft",
      },
    ];

    console.log("🎓 Fetching issued certificates for issuer:", issuerAddress);

    return NextResponse.json({
      success: true,
      issuerAddress,
      certificates: mockCertificates,
      count: mockCertificates.length,
    });
  } catch (error) {
    console.error("❌ Failed to fetch issued certificates:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
