import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuerApplication, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    // Fetch applications from Neon database
    const applications = await db
      .select({
        id: issuerApplication.id,
        domain: issuerApplication.domain,
        institution: issuerApplication.institution,
        status: issuerApplication.status,
        applicant: users.userAddress,
        email: users.email,
        username: users.username,
      })
      .from(issuerApplication)
      .leftJoin(users, eq(issuerApplication.applicant, users.id));

    // Transform to match frontend interface
    const transformedApplications = applications.map((app) => ({
      id: app.id.toString(),
      organizationName: app.domain || "Unknown Organization",
      contactEmail: app.email || "No email provided",
      website: `https://${app.domain}`,
      description: `${app.institution} institution`,
      walletAddress: app.applicant || "No wallet address",
      status: app.status as "pending" | "approved" | "rejected",
      appliedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      success: true,
      applications: transformedApplications,
    });
  } catch (error) {
    console.error("Error fetching applications from database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create user first (if doesn't exist)
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, body.walletAddress))
      .limit(1);

    let userId: number;

    if (existingUser.length === 0) {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          userAddress: body.walletAddress,
          email: body.contactEmail,
          username: body.organizationName,
        })
        .returning({ id: users.id });
      userId = newUser.id;
    } else {
      userId = existingUser[0].id;
    }

    // Create issuer application
    const [application] = await db
      .insert(issuerApplication)
      .values({
        applicant: userId,
        domain: body.organizationName.toLowerCase().replace(/\s+/g, "-"),
        institution: "university", // Default to university, can be made dynamic
        status: "pending",
      })
      .returning();

    console.log("✅ New issuer application saved to Neon DB:", application);

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
        appliedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      },
      message: "Application submitted successfully to database",
    });
  } catch (error) {
    console.error("Error saving application to database:", error);
    return NextResponse.json(
      { success: false, error: "Failed to save application" },
      { status: 500 }
    );
  }
}
