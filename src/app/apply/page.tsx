import React from "react";
import { IssuerApplicationForm } from "@/components/admin/IssuerApplicationForm";

export default function ApplyPage() {
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-3xl font-bold mb-6">Apply as Certificate Issuer</h1>
      <p className="text-gray-600 mb-8">
        Submit your application to become a verified certificate issuer on our
        platform. Once approved, you&apos;ll be able to create certificate
        templates and issue certificates.
      </p>
      <IssuerApplicationForm />
    </div>
  );
}
