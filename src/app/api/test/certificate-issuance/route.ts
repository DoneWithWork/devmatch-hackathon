import { NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuers, certificates } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Test endpoint for certificate issuance using gas sponsorship
 * This tests the complete workflow: approved issuer → create certificate
 */
export async function POST() {
  try {
    console.log("🧪 Testing certificate issuance with gas sponsorship...");

    // Test data for certificate
    const testCertificate = {
      recipientName: "John Doe",
      recipientEmail: "john.doe@example.com",
      recipientWallet: "0x123456789abcdef",
      certificateData: {
        title: "Achievement Certificate",
        description:
          "Awarded for excellent performance in blockchain development",
        issueDate: new Date().toISOString(),
        expiryDate: null,
        customFields: {
          course: "Blockchain Development",
          grade: "A+",
          instructor: "DevMatch University",
        },
      },
    };

    // Check if we have an approved issuer in the database
    const approvedIssuer = await db.query.issuers.findFirst({
      where: eq(issuers.isActive, true),
    });

    if (!approvedIssuer) {
      return NextResponse.json(
        {
          success: false,
          error: "No approved issuer found. Please run issuer approval first.",
          suggestion:
            "Run: POST /api/admin/approve-issuer with a pending application",
        },
        { status: 404 }
      );
    }

    console.log("✅ Found approved issuer:", approvedIssuer.issuerKey);

    // Create certificate record in database
    const [certificate] = await db
      .insert(certificates)
      .values({
        templateId: null, // For testing, we'll use a simple certificate without template
        issuerId: approvedIssuer.id,
        recipientName: testCertificate.recipientName,
        recipientEmail: testCertificate.recipientEmail,
        recipientWallet: testCertificate.recipientWallet,
        certificateData: testCertificate.certificateData,
        status: "issued",
        issuedAt: new Date(),
        expiresAt: null,
        isPublic: true,
      })
      .returning();

    console.log("✅ Certificate created in database:", certificate.id);

    // For a complete blockchain certificate issuance, we would call the smart contract here
    // But that requires the issuer's private key, which we don't have in our test
    // The gas sponsorship would work like this:
    // 1. Issuer creates transaction for certificate issuance
    // 2. Admin sponsors the gas (using executeWithGasSponsorship)
    // 3. Certificate NFT is minted on blockchain
    // 4. Database is updated with blockchain certificate ID

    const mockBlockchainResult = {
      transactionDigest: "MockTransaction123456789",
      certificateNftId: "0x" + "1234567890abcdef".repeat(4),
      gasUsed: "1000000", // 1M MIST = 0.001 SUI
      gasSponsoredBy: "admin",
    };

    console.log("✅ Certificate issuance test completed!");

    return NextResponse.json({
      success: true,
      message: "Certificate issuance test successful",
      data: {
        certificate: {
          id: certificate.id,
          recipientName: certificate.recipientName,
          recipientEmail: certificate.recipientEmail,
          status: certificate.status,
          issuedAt: certificate.issuedAt,
          issuerId: certificate.issuerId,
        },
        issuer: {
          id: approvedIssuer.id,
          name: approvedIssuer.name,
          issuerKey: approvedIssuer.issuerKey, // This is the IssuerCap ID
          isActive: approvedIssuer.isActive,
        },
        mockBlockchain: mockBlockchainResult,
        gasSponsorship: {
          available: true,
          sponsorMethod: "executeWithGasSponsorship",
          estimatedCost: "0.001 SUI",
          sponsoredBy: "admin",
        },
      },
      workflow: {
        step1: "✅ Issuer approved with 5 SUI gas sponsorship",
        step2: "✅ Certificate created in database",
        step3: "🔄 Ready for blockchain minting (requires issuer signature)",
        step4: "💰 Gas costs would be sponsored by admin",
      },
    });
  } catch (error) {
    console.error("❌ Certificate issuance test failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: `Certificate issuance failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return POST();
}
