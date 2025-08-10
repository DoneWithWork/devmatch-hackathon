import db from "@/db/drizzle";
import { users, issuers, issuerApplication } from "@/db/schema";
import { SaveSession } from "@/utils/session";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

type Body = {
  userAddress: string;
  maxEpoch: number;
  randomness: string;
  intendedRole?: string;
};

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Body;
  const { maxEpoch, randomness, userAddress, intendedRole } = body;
  const curCookies = await cookies();

  const user = await db.query.users.findFirst({
    where: eq(users.userAddress, userAddress),
  });

  let finalRole = "user"; // default role

  if (!user) {
    // New user - determine role based on intended role and capabilities
    if (intendedRole === "admin") {
      // Admin role requires special handling - don't auto-assign
      finalRole = "user"; // Fallback to user, admin login requires separate auth
    } else if (intendedRole === "issuer") {
      // Check if user has issuer capabilities
      const hasIssuerCap = await db.query.issuers.findFirst({
        where: eq(issuers.userId, userAddress),
      });

      const hasApprovedApplication = await db.query.issuerApplication.findFirst(
        {
          where: eq(issuerApplication.blockchainAddress, userAddress),
        }
      );

      if (hasIssuerCap || hasApprovedApplication) {
        finalRole = "issuer";
      } else {
        finalRole = "user"; // Will need to apply to become issuer
      }
    } else {
      finalRole = "user";
    }

    const newUser = await db
      .insert(users)
      .values({
        userAddress,
        role: finalRole,
      })
      .returning({ userAddress: users.userAddress, userId: users.id });

    if (!newUser)
      return NextResponse.json(
        { message: "Failed to create a new user" },
        { status: 500 }
      );

    await SaveSession({
      cookies: curCookies,
      id: newUser[0].userId,
      maxEpoch,
      randomness,
      userAddress,
      role: finalRole as "admin" | "issuer" | "user",
    });
  } else {
    // Existing user - check for role upgrades
    let userRole = user.role || "user";

    if (intendedRole === "issuer" && userRole === "user") {
      // Check if user now qualifies for issuer role
      const hasIssuerCap = await db.query.issuers.findFirst({
        where: eq(issuers.userId, userAddress),
      });

      const hasApprovedApplication = await db.query.issuerApplication.findFirst(
        {
          where: eq(issuerApplication.blockchainAddress, userAddress),
        }
      );

      if (hasIssuerCap || hasApprovedApplication) {
        userRole = "issuer";
        // Update user role in database
        await db
          .update(users)
          .set({ role: "issuer" })
          .where(eq(users.userAddress, userAddress));
      }
    }

    await SaveSession({
      cookies: curCookies,
      id: user.id,
      maxEpoch,
      randomness,
      userAddress,
      role: userRole as "admin" | "issuer" | "user",
    });
  }

  return NextResponse.json(
    {
      message: "Successfully saved the session!",
      role: userRole,
    },
    { status: 200 }
  );
}
