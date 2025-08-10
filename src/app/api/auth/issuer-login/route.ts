import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { eq, and } from "drizzle-orm";
import db from "@/db/drizzle";
import { issuerApplication, users } from "@/db/schema";
import { SaveSession } from "@/utils/session";

export async function POST(request: NextRequest) {
  try {
    const { email, walletAddress } = await request.json();

    if (!email || !walletAddress) {
      return NextResponse.json(
        { error: "Email and wallet address are required" },
        { status: 400 }
      );
    }

    // Validate wallet address format
    if (!walletAddress.startsWith("0x") || walletAddress.length !== 66) {
      return NextResponse.json(
        { error: "Invalid wallet address format" },
        { status: 400 }
      );
    }

    // Look for an approved issuer with matching email and wallet address
    console.log("Looking for issuer with email:", email.toLowerCase().trim());
    console.log(
      "Looking for issuer with wallet address:",
      walletAddress.trim()
    );

    const issuer = await db
      .select({
        id: issuerApplication.id,
        organizationName: issuerApplication.organizationName,
        domain: issuerApplication.domain,
        status: issuerApplication.status,
        email: users.email,
        username: users.username,
        userAddress: users.userAddress,
        userId: users.id,
        userRole: users.role,
      })
      .from(issuerApplication)
      .innerJoin(users, eq(issuerApplication.applicant, users.id))
      .where(
        and(
          eq(users.email, email.toLowerCase().trim()),
          eq(issuerApplication.status, "approved")
        )
      )
      .limit(1);

    console.log("Found issuers:", issuer);

    if (issuer.length === 0) {
      console.log(
        "No approved issuer found with email:",
        email.toLowerCase().trim()
      );
      return NextResponse.json(
        {
          error:
            "No approved issuer found with this email. Please check your email or contact support if you believe this is an error.",
        },
        { status: 401 }
      );
    }

    const issuerData = issuer[0];
    console.log("Found issuer data:", issuerData);

    // If user has approved application but role is still 'user', update it to 'issuer'
    if (issuerData.userRole !== "issuer") {
      console.log(
        "User has approved application but role is still:",
        issuerData.userRole
      );
      console.log("Updating user role to 'issuer'");
      await db
        .update(users)
        .set({
          role: "issuer",
        })
        .where(eq(users.id, issuerData.userId));
      console.log("✅ Updated user role to issuer");
    }

    // Create session for the issuer
    const cookieStore = await cookies();
    console.log("Creating session for user ID:", issuerData.userId);
    await SaveSession({
      cookies: cookieStore,
      id: issuerData.userId.toString(), // Ensure it's a string
      userAddress: issuerData.userAddress, // Use the actual user address from database
      maxEpoch: 999999, // High value since we're not using zkLogin yet
      randomness: "temp_randomness", // Placeholder until zkLogin is implemented
      role: "issuer",
    });

    return NextResponse.json({
      success: true,
      message: "Successfully logged in as issuer",
      issuer: {
        id: issuerData.id,
        organizationName: issuerData.organizationName,
        email: issuerData.email,
        walletAddress: issuerData.userAddress,
        hasBlockchainIntegration: false,
      },
    });
  } catch (error) {
    console.error("Issuer login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
