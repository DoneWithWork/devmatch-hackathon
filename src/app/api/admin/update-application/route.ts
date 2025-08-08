import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/db";
import { issuerApplication } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PATCH(request: NextRequest) {
  try {
    const { id, issuerCapId, transactionDigest, status } = await request.json();

    console.log("🔄 Updating application:", {
      id,
      issuerCapId,
      transactionDigest,
      status,
    });

    const result = await db
      .update(issuerApplication)
      .set({
        issuerCapId: issuerCapId,
        transactionDigest: transactionDigest,
        status: status || "pending",
      })
      .where(eq(issuerApplication.id, parseInt(id)))
      .returning();

    console.log("✅ Application updated:", result);

    return NextResponse.json({
      success: true,
      message: "Application updated successfully",
      application: result[0],
    });
  } catch (error) {
    console.error("❌ Error updating application:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
