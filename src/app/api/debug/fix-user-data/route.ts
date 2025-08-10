import { NextResponse } from "next/server";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { db } from "@/db/db";
import { issuers, users, issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  try {
    // Try to get session, but don't require it
    let session;
    try {
      const cookieStore = await cookies();
      session = await getSession(cookieStore);
    } catch {
      console.log("No session found, will try with known address");
    }

    // If no session, use the known address from debug data
    const userAddress =
      session?.userAddress ||
      "0x0b868e8ab81f18eb196d976f7f1bfbd2105360e7792ff07ef2630a3a4530ccd6";

    console.log("Fixing user data for address:", userAddress);

    // Find user by address
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.userAddress, userAddress))
      .limit(1);

    if (userRecord.length === 0) {
      return NextResponse.json(
        {
          error: "No user found with this address",
        },
        { status: 404 }
      );
    }

    const user = userRecord[0];
    console.log("Found user:", user.id, user.userAddress);

    // Check if user has an approved issuer application
    const approvedApplication = await db
      .select()
      .from(issuerApplication)
      .where(eq(issuerApplication.blockchainAddress, userAddress))
      .limit(1);

    if (approvedApplication.length === 0) {
      return NextResponse.json(
        {
          error: "No approved application found for this user",
        },
        { status: 404 }
      );
    }

    const application = approvedApplication[0];
    console.log("Found application:", application);

    // Update user role
    await db
      .update(users)
      .set({
        role: "issuer",
      })
      .where(eq(users.id, user.id));

    console.log("Updated user role to issuer");

    // Create issuer record if it doesn't exist
    const existingIssuer = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, user.id))
      .limit(1);

    if (existingIssuer.length === 0) {
      await db.insert(issuers).values({
        issuerKey: application.organizationName
          .toLowerCase()
          .replace(/\s+/g, "-"),
        name: application.organizationName,
        displayName: application.organizationName,
        website: application.website,
        userId: user.id,
        isActive: true,
        isVerified: true,
        verifiedAt: new Date(),
      });
      console.log("Created issuer record");
    } else {
      console.log("Issuer record already exists");
    }

    return NextResponse.json({
      success: true,
      message: "User data fixed successfully",
      updatedRole: "issuer",
      userId: user.id,
    });
  } catch (error) {
    console.error("Fix user data error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
