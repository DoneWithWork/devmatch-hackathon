import React from "react";
import { IssuerDashboard } from "@/components/issuer/IssuerDashboard";
import { getSession } from "@/utils/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import AuthLayout from "@/components/layouts/AuthLayout";

export default async function IssuePage() {
  const session = await getSession(await cookies());

  if (!session) {
    redirect("/auth");
  }

  if (session.role !== "issuer") {
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
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Issue Certificates</h1>
        <p className="text-gray-600 mb-8">
          Create and issue certificates using your approved issuer account.
        </p>
        <IssuerDashboard />
      </div>
    </AuthLayout>
  );
}
