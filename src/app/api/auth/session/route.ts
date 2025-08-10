import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSession } from "@/utils/session";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getSession(cookieStore);

    if (!session.userAddress) {
      return NextResponse.json(
        { error: "No active session found" },
        { status: 401 }
      );
    }

    // Check current user role from database to ensure session is up-to-date
    const user = await db.query.users.findFirst({
      where: eq(users.id, session.id),
    });

    if (user && user.role !== session.role) {
      // Update session with current role from database
      session.role = user.role;
      await session.save();
    }

    return NextResponse.json({
      id: session.id,
      userAddress: session.userAddress,
      role: user?.role || session.role,
      maxEpoch: session.maxEpoch,
      randomness: session.randomness,
    });
  } catch (error) {
    console.error("Session fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
