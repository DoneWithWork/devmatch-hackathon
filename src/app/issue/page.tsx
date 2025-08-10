import React from "react";
import { CertificateIssuanceForm } from "@/components/issuer/CertificateIssuanceForm";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthLayout from "@/components/layouts/AuthLayout";
import db from "@/db/drizzle";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export default async function IssuePage() {
  const session = await getSession(await cookies());

  if (!session) {
    redirect("/auth");
  }

  // Check current user role from database to ensure we have the latest role
  const user = await db.query.users.findFirst({
    where: eq(users.id, session.id),
  });

  // Update session with current role if it doesn't match
  if (user && user.role !== session.role) {
    session.role = user.role;
    await session.save();
  }

  if (!user || user.role !== "issuer") {
    return (
      <AuthLayout>
        <div className="container mx-auto p-6 max-w-2xl">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
            <p className="text-gray-600 mb-8">
              You need to be an approved issuer to access this page.
            </p>
            <a
              href="/apply"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply to Become an Issuer
            </a>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <CertificateIssuanceForm />
    </AuthLayout>
  );
}
