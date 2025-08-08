import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issuerId } = body;

    if (!issuerId) {
      return NextResponse.json(
        { error: "Issuer ID is required" },
        { status: 400 }
      );
    }

    // Update the issuer application status to rejected
    const [updatedApplication] = await db
      .update(issuerApplication)
      .set({ status: "rejected" })
      .where(eq(issuerApplication.id, parseInt(issuerId)))
      .returning();

    if (!updatedApplication) {
      return NextResponse.json(
        { error: "Issuer application not found" },
        { status: 404 }
      );
    }

    console.log("✅ Issuer application rejected:", updatedApplication);

    return NextResponse.json({
      success: true,
      message: "Issuer application rejected successfully",
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Error rejecting issuer:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
