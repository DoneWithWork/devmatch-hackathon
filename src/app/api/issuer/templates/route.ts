import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { certificateTemplates, issuers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";

/**
 * Create a new certificate template
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
      templateName,
      description,
      templateUrl,
      category,
      tags,
      fields,
      design,
      metadata,
      isActive = true,
      isPublic = false,
    } = body;

    // Validate required fields
    if (!templateName || !templateUrl) {
      return NextResponse.json(
        { success: false, error: "Template name and URL are required" },
        { status: 400 }
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

    // Create the template
    const [template] = await db
      .insert(certificateTemplates)
      .values({
        issuerId: issuerRecord.id,
        templateName,
        templateUrl,
        description: description || null,
        category: category || null,
        tags: tags ? JSON.stringify(tags) : null,
        fields: fields ? JSON.stringify(fields) : null,
        design: design ? JSON.stringify(design) : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        isActive,
        isPublic,
        version: 1,
        usageCount: 0,
      })
      .returning();

    console.log("✅ Certificate template created successfully:", {
      templateId: template.id,
      templateName: template.templateName,
    });

    return NextResponse.json({
      success: true,
      template: {
        id: template.id,
        templateName: template.templateName,
        templateUrl: template.templateUrl,
        description: template.description,
        category: template.category,
        tags: template.tags ? JSON.parse(template.tags as string) : [],
        fields: template.fields ? JSON.parse(template.fields as string) : [],
        design: template.design ? JSON.parse(template.design as string) : null,
        metadata: template.metadata
          ? JSON.parse(template.metadata as string)
          : null,
        isActive: template.isActive,
        isPublic: template.isPublic,
        version: template.version,
        usageCount: template.usageCount,
        createdAt: template.created_at,
      },
      message: "Certificate template created successfully",
    });
  } catch (error) {
    console.error("❌ Error creating certificate template:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create certificate template" },
      { status: 500 }
    );
  }
}

/**
 * Get certificate templates for the current issuer
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

    // Get templates
    const templates = await db
      .select({
        id: certificateTemplates.id,
        templateName: certificateTemplates.templateName,
        templateUrl: certificateTemplates.templateUrl,
        description: certificateTemplates.description,
        category: certificateTemplates.category,
        tags: certificateTemplates.tags,
        fields: certificateTemplates.fields,
        design: certificateTemplates.design,
        metadata: certificateTemplates.metadata,
        isActive: certificateTemplates.isActive,
        isPublic: certificateTemplates.isPublic,
        version: certificateTemplates.version,
        usageCount: certificateTemplates.usageCount,
        createdAt: certificateTemplates.created_at,
        updatedAt: certificateTemplates.update_at,
      })
      .from(certificateTemplates)
      .where(eq(certificateTemplates.issuerId, issuerRecord.id))
      .orderBy(certificateTemplates.created_at);

    // Parse JSON fields (fields is TEXT[] so no parsing needed)
    const parsedTemplates = templates.map((template) => ({
      ...template,
      name: template.templateName, // Map templateName to name for frontend compatibility
      onChainId: template.templateUrl, // Map templateUrl to onChainId for frontend compatibility
      tags: template.tags ? JSON.parse(template.tags as string) : [],
      fields: template.fields || [], // fields is already an array from database
      design: template.design ? JSON.parse(template.design as string) : null,
      metadata: template.metadata
        ? JSON.parse(template.metadata as string)
        : null,
    }));

    return NextResponse.json({
      success: true,
      templates: parsedTemplates,
    });
  } catch (error) {
    console.error("❌ Error fetching certificate templates:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch certificate templates" },
      { status: 500 }
    );
  }
}
