// DEBUG: Manually insert issuer record for a user (useful for fixing missing records)
export async function POST(request: Request) {
  const { userId, issuerKey, organizationName, website } = await request.json();
  if (!userId || !issuerKey) {
    return NextResponse.json(
      { success: false, error: "userId and issuerKey required" },
      { status: 400 }
    );
  }
  try {
    await db.insert(issuers).values({
      issuerKey,
      name: organizationName || "Manual Issuer",
      displayName: organizationName || "Manual Issuer",
      website: website || null,
      userId,
      isActive: true,
      isVerified: true,
      verifiedAt: new Date(),
    });
    return NextResponse.json({
      success: true,
      message: "Issuer record inserted.",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error?.message || "Insert failed" },
      { status: 500 }
    );
  }
}
import { NextResponse } from "next/server";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { db } from "@/db/db";
import { issuers } from "@/db/schema";
import { eq } from "drizzle-orm";

// Returns success for authenticated issuer (issuerCapId concept removed)
export async function GET() {
  const session = await getSession(await cookies());
  console.log("Session in cap endpoint:", session);

  if (!session || session.role !== "issuer") {
    console.log("Unauthorized - no session or not issuer role");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  console.log("Looking for issuer with userId:", session.id);
  // Diagnostic: log all issuer records for this user
  const allIssuerRecords = await db
    .select()
    .from(issuers)
    .where(eq(issuers.userId, session.id));
  console.log("All issuer records for user:", allIssuerRecords);

  const [issuerRecord] = allIssuerRecords;
  console.log("Selected issuer record:", issuerRecord);

  if (!issuerRecord) {
    console.log("No issuer record found for user");
    return NextResponse.json(
      { success: false, error: "Issuer record not found" },
      { status: 404 }
    );
  }

  console.log("Returning success for authenticated issuer");
  return NextResponse.json({
    success: true,
    message: "Issuer authenticated successfully",
  });
}
