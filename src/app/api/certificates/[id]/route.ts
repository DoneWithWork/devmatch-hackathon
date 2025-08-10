import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { certificates } from "@/db/schema";
import { eq } from "drizzle-orm";

interface CertificateData {
  certificateTitle?: string;
  description?: string;
  issuerName?: string;
  customFields?: Record<string, string>;
  style?: string;
  [key: string]: unknown;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const certificateId = params.id;

    // Search for certificate by ID
    const certificate = await db
      .select()
      .from(certificates)
      .where(eq(certificates.id, certificateId))
      .limit(1);

    if (certificate.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Certificate not found",
        },
        { status: 404 }
      );
    }

    const cert = certificate[0];
    const certData = cert.certificateData as CertificateData;

    // Format the response
    const formattedCertificate = {
      id: cert.id,
      recipientName: cert.recipientName,
      certificateTitle: certData?.certificateTitle || "Certificate",
      description: certData?.description,
      issuerName: certData?.issuerName,
      customFields: certData?.customFields,
      style: certData?.style || "classic",
      issuedAt: cert.created_at,
      onChainAddress: cert.blockchainId,
      isValid: !!cert.blockchainId, // Valid if it has an on-chain ID
    };

    return NextResponse.json({
      success: true,
      certificate: formattedCertificate,
    });
  } catch (error) {
    console.error("Error fetching certificate:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
