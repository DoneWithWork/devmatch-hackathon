import BecomeIssuerBtn from "@/components/BecomeIssuerBtn";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

export default async function UserPage() {
  const session = await getSession(await cookies());

  // Check current user role from database to ensure we have the latest role
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });

  // Update session with current role if it doesn't match
  if (user && user.role !== session.role) {
    session.role = user.role;
    await session.save();
  }

  // If user is an approved issuer, redirect to issuer dashboard
  if (user?.role === "issuer") {
    redirect("/issuer");
  }

  // At this point, user is not an issuer
  return (
    <div>
      {session.id}
      <BecomeIssuerBtn role={user?.role ?? "user"} />
    </div>
  );
}
