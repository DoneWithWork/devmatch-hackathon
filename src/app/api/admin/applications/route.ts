import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { users, issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET /api/admin/applications
 * Fetch all issuer applications for admin review
 */
export async function GET() {
  try {
    console.log("📧 Fetching applications from DB...");

    // Get all applications with user information
    const applicationsData = await db
      .select()
      .from(issuerApplication)
      .leftJoin(users, eq(issuerApplication.applicant, users.id))
      .orderBy(issuerApplication.created_at);

    console.log("📧 Raw applications data from DB:", applicationsData.length, "applications found");

    // Transform the data to match expected format
    const applications = applicationsData.map((row) => ({
      id: row.application.id.toString(),
      organizationName: row.application.organizationName,
      contactEmail: row.users?.email || row.application.contactEmail || "",
      website: row.application.website ? `https://${row.application.website}` : "",
      description: row.application.description || "",
      walletAddress: row.users?.userAddress || "",
      status: row.application.status,
      appliedAt: row.application.created_at?.toISOString() || new Date().toISOString(),
      createdAt: row.application.created_at?.toISOString() || new Date().toISOString(),
      transactionDigest: row.application.transactionDigest,
      hasBlockchainIntegration: false,
    }));

    console.log("📧 Transformed applications successfully");

    return NextResponse.json({
      success: true,
      applications,
    });
  } catch (error) {
    console.error("❌ Error in GET handler:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    const errorStack = error instanceof Error ? error.stack : "No stack trace";
    console.error("❌ Error stack:", errorStack);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch applications",
        details: errorMessage,
        stack: errorStack,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/applications
 * Create new issuer application (FIXED VERSION - no blockchain creation)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("📝 Creating new issuer application:", body);

    // Validate required fields
    if (!body.organizationName || !body.walletAddress) {
      return NextResponse.json(
        {
          success: false,
          error: "Organization name and wallet address are required",
        },
        { status: 400 }
      );
    }

    // Find or create user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, body.walletAddress))
      .limit(1);

    let userId: string;

    if (user.length === 0) {
      console.log("👤 Creating new user for wallet:", body.walletAddress);
      const [newUser] = await db
        .insert(users)
        .values({
          userAddress: body.walletAddress,
          email: body.contactEmail,
          username: body.organizationName.toLowerCase().replace(/\s+/g, ""),
          role: "user",
        })
        .returning();
      userId = newUser.id;
    } else {
      userId = user[0].id;
      console.log("👤 Using existing user:", userId);
    }

    // Check for existing application
    const existingApplication = await db
      .select()
      .from(issuerApplication)
      .where(eq(issuerApplication.applicant, userId))
      .limit(1);

    if (existingApplication.length > 0) {
      console.log("📋 Updating existing application");
      const [updatedApplication] = await db
        .update(issuerApplication)
        .set({
          organizationName: body.organizationName,
          domain: body.organizationName.toLowerCase().replace(/\s+/g, "-"),
          description: body.description,
          website: body.website,
          status: "pending",
        })
        .where(eq(issuerApplication.id, existingApplication[0].id))
        .returning();

      return NextResponse.json({
        success: true,
        application: {
          id: updatedApplication.id.toString(),
          organizationName: body.organizationName,
          contactEmail: body.contactEmail,
          website: body.website,
          description: body.description,
          walletAddress: body.walletAddress,
          status: "pending",
          appliedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
        message: "Application resubmitted successfully",
      });
    }

    // Create new issuer application
    const [application] = await db
      .insert(issuerApplication)
      .values({
        applicant: userId,
        organizationName: body.organizationName,
        domain: body.organizationName.toLowerCase().replace(/\s+/g, "-"),
        organization: body.organization || null,
        description: body.description,
        website: body.website,
        status: "pending",
        // Note: transactionDigest will be null
        // These will be created during the approval process
      })
      .returning();

    console.log("✅ New issuer application saved to Neon DB:", application);

    // ⚠️ CRITICAL FIX: No blockchain creation during application submission
    //
    // PROBLEM: When admin creates blockchain assets, it becomes owned by admin,
    // causing approval failures with ownership conflicts.
    //
    // SOLUTION: Skip blockchain creation during application submission.
    // Blockchain assets will be created during approval process with proper ownership.

    console.log(
      "⏭️ Skipping blockchain asset creation to avoid ownership issues"
    );
    console.log("💡 Blockchain assets will be created during approval process");

    return NextResponse.json({
      success: true,
      application: {
        id: application.id.toString(),
        organizationName: body.organizationName,
        contactEmail: body.contactEmail,
        website: body.website,
        description: body.description,
        walletAddress: body.walletAddress,
        status: "pending",
        appliedAt: application.submittedAt.toISOString(),
        createdAt: application.created_at.toISOString(),
        transactionDigest: null,
        hasBlockchainIntegration: false,
      },
      message:
        "Application submitted successfully! Blockchain integration will be completed during approval.",
    });
  } catch (error) {
    console.error("❌ Error creating issuer application:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create application" },
      { status: 500 }
    );
  }
}
