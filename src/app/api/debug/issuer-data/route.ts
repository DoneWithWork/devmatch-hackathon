import { NextResponse } from "next/server";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { db } from "@/db/db";
import { issuers, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await getSession(await cookies());
    console.log("Debug session:", session);

    if (!session) {
      return NextResponse.json({ error: "No session" }, { status: 401 });
    }

    // Check user record
    const userRecord = await db
      .select()
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);

    console.log("User record:", userRecord);

    // Check issuer record
    const issuerRecord = await db
      .select()
      .from(issuers)
      .where(eq(issuers.userId, session.id))
      .limit(1);

    console.log("Issuer record:", issuerRecord);

    // Check all issuers
    const allIssuers = await db.select().from(issuers).limit(10);
    console.log("All issuers:", allIssuers);

    return NextResponse.json({
      session,
      userRecord: userRecord[0] || null,
      issuerRecord: issuerRecord[0] || null,
      allIssuers,
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
