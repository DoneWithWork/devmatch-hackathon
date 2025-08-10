import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { certificates, issuers } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Public test endpoint for certificate creation (bypasses authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { recipientName, recipientEmail, recipientWallet, certificateData } =
      body;

    console.log("Test certificate request:", {
      recipientName,
      certificateData,
    });

    // Validation
    if (!recipientName) {
      return NextResponse.json(
        { success: false, error: "Recipient name is required" },
        { status: 400 }
      );
    }

    if (!certificateData) {
      return NextResponse.json(
        { success: false, error: "Certificate data is required" },
        { status: 400 }
      );
    }

    // For testing, create a default test issuer if none exists
    let testIssuer;
    try {
      const existingIssuer = await db
        .select()
        .from(issuers)
        .where(eq(issuers.issuerKey, "test-issuer"))
        .limit(1);

      if (existingIssuer.length > 0) {
        testIssuer = existingIssuer[0];
      } else {
        // Create test issuer
        const [newIssuer] = await db
          .insert(issuers)
          .values({
            issuerKey: "test-issuer",
            name: "Test Issuer",
            displayName: "Test Certificate Issuer",
            bio: "Test issuer for certificate testing",
            userId: "00000000-0000-0000-0000-000000000000", // UUID for test
            isActive: true,
            isVerified: true,
          })
          .returning();
        testIssuer = newIssuer;
      }
    } catch (issuerError) {
      console.error("Error with test issuer:", issuerError);
      return NextResponse.json(
        { success: false, error: "Failed to setup test issuer" },
        { status: 500 }
      );
    }

    // Create the certificate
    const [certificate] = await db
      .insert(certificates)
      .values({
        templateId: null,
        issuerId: testIssuer.id,
        recipientName,
        recipientEmail: recipientEmail || null,
        recipientWallet: recipientWallet || null,
        certificateData: certificateData,
        status: "issued",
        issuedAt: new Date(),
        expiresAt: null,
        isPublic: true,
      })
      .returning();

    console.log("Certificate created:", certificate.id);

    return NextResponse.json({
      success: true,
      message: "Certificate created successfully",
      certificate: {
        id: certificate.id,
        recipientName: certificate.recipientName,
        status: certificate.status,
        issuedAt: certificate.issuedAt,
      },
    });
  } catch (error) {
    console.error("Error creating test certificate:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
