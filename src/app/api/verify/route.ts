import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
  certificates,
  certificateTemplates,
  issuers,
  users,
  issuerApplication,
  individualCert,
} from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * Verify a certificate by verification code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const verificationCode = searchParams.get("code");

    if (!verificationCode) {
      return NextResponse.json(
        { success: false, error: "Verification code is required" },
        { status: 400 }
      );
    }

    // Find the certificate by verification code with all related data
    const certificateData = await db
      .select({
        // Certificate details
        certificateId: certificates.id,
        recipientName: certificates.recipientName,
        recipientEmail: certificates.recipientEmail,
        status: certificates.status,
        issuedAt: certificates.issuedAt,
        expiresAt: certificates.expiresAt,
        certificateData: certificates.certificateData,
        createdAt: certificates.created_at, // Map snake_case to camelCase

        // Individual cert details
        verificationCode: individualCert.verificationCode,
        minted: individualCert.minted,
        mintedAt: individualCert.mintedAt,
        tokenId: individualCert.tokenId,
        downloadCount: individualCert.downloadCount,

        // Template details
        templateName: certificateTemplates.templateName,
        templateUrl: certificateTemplates.templateUrl,

        // Issuer details
        issuerName: issuers.name,

        // User details (for issuer email)
        userEmail: users.email,

        // Organization details
        organizationName: issuerApplication.organizationName,
      })
      .from(individualCert)
      .innerJoin(
        certificates,
        eq(individualCert.certificateId, certificates.id)
      )
      .leftJoin(
        certificateTemplates,
        eq(certificates.templateId, certificateTemplates.id)
      )
      .innerJoin(issuers, eq(certificates.issuerId, issuers.id))
      .innerJoin(users, eq(issuers.userId, users.id))
      .leftJoin(issuerApplication, eq(issuerApplication.applicant, users.id))
      .where(eq(individualCert.verificationCode, verificationCode))
      .limit(1);

    if (certificateData.length === 0) {
      return NextResponse.json(
        { success: false, error: "Certificate not found" },
        { status: 404 }
      );
    }

    const cert = certificateData[0];

    // Check if certificate is expired
    const isExpired = cert.expiresAt && new Date() > cert.expiresAt;

    // Update download count and last accessed time
    await db
      .update(individualCert)
      .set({
        downloadCount: (cert.downloadCount || 0) + 1,
        lastAccessedAt: new Date(),
        update_at: new Date(),
      })
      .where(eq(individualCert.verificationCode, verificationCode));

    console.log("🔍 Certificate verified:", {
      verificationCode,
      recipientName: cert.recipientName,
      issuerName: cert.issuerName,
      status: cert.status,
      isExpired,
    });

    return NextResponse.json({
      success: true,
      certificate: {
        id: cert.certificateId,
        verificationCode: cert.verificationCode,
        recipientName: cert.recipientName,
        recipientEmail: cert.recipientEmail,
        status: cert.status,
        issuedAt: cert.issuedAt,
        expiresAt: cert.expiresAt,
        isExpired,
        minted: cert.minted,
        mintedAt: cert.mintedAt,
        tokenId: cert.tokenId,
        downloadCount: (cert.downloadCount || 0) + 1,
        certificateData: cert.certificateData || null, // certificateData is already a JS object from jsonb
        template: cert.templateName
          ? {
              name: cert.templateName,
              url: cert.templateUrl,
            }
          : null,
        issuer: {
          name: cert.issuerName,
          email: cert.userEmail,
          organizationName: cert.organizationName,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error verifying certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to verify certificate" },
      { status: 500 }
    );
  }
}
