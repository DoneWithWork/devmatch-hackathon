import React from "react";
import { UserCertificatesDashboard } from "@/components/user/UserCertificatesDashboard";

export default function CertificatesPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Certificates</h1>
      <UserCertificatesDashboard />
    </div>
  );
}
