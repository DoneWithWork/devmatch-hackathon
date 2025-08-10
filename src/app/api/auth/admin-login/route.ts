import { NextRequest, NextResponse } from "next/server";
import { getSession, SaveSession } from "@/utils/session";
import { cookies } from "next/headers";

/**
 * Simple admin login endpoint
 * In production, this should be more secure with proper authentication
 */
export async function POST(request: NextRequest) {
  try {
    const { adminKey } = await request.json();

    // Check if the admin key matches the environment variable
    const expectedAdminKey = process.env.ADMIN_LOGIN_KEY || "admin123"; // Default for development

    if (adminKey !== expectedAdminKey) {
      return NextResponse.json(
        { success: false, error: "Invalid admin key" },
        { status: 401 }
      );
    }

    // Create admin session
    await SaveSession({
      cookies: await cookies(),
      id: "admin-999", // Special admin user ID as string
      userAddress: "admin",
      role: "admin" as const,
      maxEpoch: 0,
      randomness: "admin",
    });

    const session = {
      id: "admin-999",
      userAddress: "admin",
      role: "admin" as const,
      email: "admin@hashcred.com",
      username: "Admin User",
    };

    return NextResponse.json({
      success: true,
      message: "Admin login successful",
      session,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}

/**
 * Check admin session status
 */
export async function GET() {
  try {
    const session = await getSession(await cookies());

    if (!session || session.role !== "admin") {
      return NextResponse.json(
        { success: false, isAdmin: false },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      isAdmin: true,
      session,
    });
  } catch (error) {
    console.error("Admin session check error:", error);
    return NextResponse.json(
      { success: false, error: "Session check failed" },
      { status: 500 }
    );
  }
}
