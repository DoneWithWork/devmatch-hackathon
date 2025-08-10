import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import {
  certificates,
  certificateTemplates,
  issuers,
  individualCert,
} from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";

const suiClient = new SuiClient({ url: getFullnodeUrl("devnet") });

/**
 * Create a new certificate
 */
export async function POST(request: NextRequest) {
  try {
    // Check issuer authentication
    const session = await getSession(await cookies());
    if (!session || session.role !== "issuer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Issuer access required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      templateId,
      recipientName,
      recipientEmail,
      recipientWallet,
      certificateData,
      expiresAt,
    } = body;

    // Debug: Log the received data
    console.log("Received certificate data:", {
      templateId,
      recipientName,
      certificateData,
      certificateDataType: typeof certificateData,
      certificateDataKeys: certificateData ? Object.keys(certificateData) : [],
    });

    // Validate required fields
    if (!recipientName) {
      return NextResponse.json(
        { success: false, error: "Recipient name is required" },
        { status: 400 }
      );
    }

    // Certificate data can be empty object or null - that's fine
    const finalCertificateData = certificateData || {};

    // Get issuer details
    const [issuerRecord] = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, session.id))
      .limit(1);

    if (!issuerRecord) {
      return NextResponse.json(
        { success: false, error: "Issuer record not found" },
        { status: 404 }
      );
    }

    // Validate template if provided
    if (templateId) {
      const [template] = await db
        .select()
        .from(certificateTemplates)
        .where(eq(certificateTemplates.id, templateId))
        .limit(1);

      if (!template || template.issuerId !== issuerRecord.id) {
        return NextResponse.json(
          {
            success: false,
            error: "Invalid template or template not owned by issuer",
          },
          { status: 400 }
        );
      }
    }

    // Create the certificate
    const [certificate] = await db
      .insert(certificates)
      .values({
        templateId: templateId || null,
        issuerId: issuerRecord.id,
        recipientName,
        recipientEmail: recipientEmail || null,
        recipientWallet: recipientWallet || null,
        certificateData: finalCertificateData, // Use the processed certificate data
        status: "draft",
        issuedAt: new Date(),
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        // Don't manually set   - let database handle them
      })
      .returning();

    // Create individual certificate record
    const verificationCode = `CERT-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    await db.insert(individualCert).values({
      certificateId: certificate.id,
      verificationCode,
      // Don't manually set timestamps - let database handle them
    });

    console.log("✅ Certificate created successfully:", {
      certificateId: certificate.id,
      verificationCode,
    });

    return NextResponse.json({
      success: true,
      certificate: {
        id: certificate.id,
        recipientName: certificate.recipientName,
        recipientEmail: certificate.recipientEmail,
        status: certificate.status,
        issuedAt: certificate.issuedAt,
        verificationCode,
      },
      message: "Certificate created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating certificate:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create certificate" },
      { status: 500 }
    );
  }
}

/**
 * Get certificates for the current issuer
 */
export async function GET() {
  try {
    // Check issuer authentication
    const session = await getSession(await cookies());
    if (!session || session.role !== "issuer") {
      return NextResponse.json(
        { success: false, error: "Unauthorized - Issuer access required" },
        { status: 401 }
      );
    }

    // Get issuer details
    const [issuerRecord] = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, session.id))
      .limit(1);

    if (!issuerRecord) {
      return NextResponse.json(
        { success: false, error: "Issuer record not found" },
        { status: 404 }
      );
    }

    // Get certificates with individual cert details; fallback if migration not applied (missing client_provided_id)
    let certificateList;
    try {
      certificateList = await db
        .select({
          id: certificates.id,
          templateId: certificates.templateId,
          recipientName: certificates.recipientName,
          recipientEmail: certificates.recipientEmail,
          status: certificates.status,
          issuedAt: certificates.issuedAt,
          expiresAt: certificates.expiresAt,
          verificationCode: individualCert.verificationCode,
          minted: individualCert.minted,
          downloadCount: individualCert.downloadCount,
          createdAt: certificates.created_at,
          updatedAt: certificates.update_at,
          blockchainId: certificates.blockchainId,
          clientProvidedId: certificates.clientProvidedId,
        })
        .from(certificates)
        .leftJoin(
          individualCert,
          eq(certificates.id, individualCert.certificateId)
        )
        .where(eq(certificates.issuerId, issuerRecord.id))
        .orderBy(certificates.created_at);
    } catch (rawErr) {
      const err = rawErr as { code?: string } | undefined;
      if (err && err.code === "42703") {
        // Column missing: run fallback without clientProvidedId
        console.warn(
          "client_provided_id column missing, using fallback select"
        );
        certificateList = await db
          .select({
            id: certificates.id,
            templateId: certificates.templateId,
            recipientName: certificates.recipientName,
            recipientEmail: certificates.recipientEmail,
            status: certificates.status,
            issuedAt: certificates.issuedAt,
            expiresAt: certificates.expiresAt,
            verificationCode: individualCert.verificationCode,
            minted: individualCert.minted,
            downloadCount: individualCert.downloadCount,
            createdAt: certificates.created_at,
            updatedAt: certificates.update_at,
            blockchainId: certificates.blockchainId,
          })
          .from(certificates)
          .leftJoin(
            individualCert,
            eq(certificates.id, individualCert.certificateId)
          )
          .where(eq(certificates.issuerId, issuerRecord.id))
          .orderBy(certificates.created_at);
      } else {
        throw rawErr;
      }
    }

    // Enrich with on-chain state where blockchainId present
    const enriched = await Promise.all(
      certificateList.map(async (c) => {
        if (!c.blockchainId)
          return { ...c, isRevoked: null, isMinted: c.minted };
        try {
          const obj = await suiClient.getObject({
            id: c.blockchainId,
            options: { showContent: true },
          });
          // Heuristic parsing: expect Move struct fields containing is_revoked & is_minted
          // @ts-expect-error dynamic Move struct shape
          const fields = obj.data?.content?.fields as
            | { is_revoked?: boolean; is_minted?: boolean }
            | undefined;
          const onChainMinted = fields ? !!fields.is_minted : c.minted;
          return {
            ...c,
            isRevoked: fields ? !!fields.is_revoked : null,
            isMinted: onChainMinted,
            mismatch:
              onChainMinted !== c.minted
                ? {
                    dbMinted: c.minted,
                    chainMinted: onChainMinted,
                  }
                : null,
          };
        } catch (e) {
          console.warn("On-chain fetch failed for", c.blockchainId, e);
          return { ...c, isRevoked: null, isMinted: c.minted };
        }
      })
    );

    return NextResponse.json({
      success: true,
      certificates: enriched,
    });
  } catch (error) {
    console.error("❌ Error fetching certificates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificates" },
      { status: 500 }
    );
  }
}
