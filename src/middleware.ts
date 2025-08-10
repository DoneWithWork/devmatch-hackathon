import { cookies } from "next/headers";
import { getSession } from "./utils/session";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const session = await getSession(await cookies());
  const pathname = request.nextUrl.pathname;

  // Check if user is trying to access protected routes
  if (pathname.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (pathname.startsWith("/issuer") && pathname !== "/issuer-login") {
    // Only check if user is logged in, let the page-level check handle role verification
    // This allows for cases where the session role hasn't been updated yet but database has
    if (!session) {
      return NextResponse.redirect(new URL("/issuer-login", request.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/issuer/:path*"],
};
