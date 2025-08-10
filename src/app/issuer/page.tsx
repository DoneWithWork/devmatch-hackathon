import { IssuerDashboard } from "@/components/issuer/IssuerDashboard";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function IssuerPage() {
  const session = await getSession(await cookies());

  if (!session) {
    console.log("No session found, redirecting to auth");
    redirect("/auth");
  }

  console.log("Session ID:", session.id);
  console.log("Session role:", session.role);

  // Check current user role from database to ensure we have the latest role
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });

  console.log("Found user:", user);

  if (!user || user.role !== "issuer") {
    console.log("User not found or not issuer role, redirecting to apply");
    console.log("User role:", user?.role);
    redirect("/apply");
  }

  // Update session with current role if it doesn't match
  if (user.role !== session.role) {
    console.log("Updating session role from", session.role, "to", user.role);
    session.role = user.role;
    await session.save();
  }

  return <IssuerDashboard />;
}
