import { checkTXTRecord } from "@/lib/dns";
import { PendingIssuers } from "@/components/admin/PendingIssuers";
import React from "react";

export default async function AdminPage() {
  const status = await checkTXTRecord({
    domain: "google.com",
    matchingKey: "hashcred",
    matchingValue: process.env.NEXT_PUBLIC_DNS_KEY!,
  });
  console.log("DNS verification status:", status);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* DNS Status */}
      <div className="mb-8 p-4 rounded-lg bg-blue-50">
        <h2 className="text-lg font-semibold mb-2">DNS Verification</h2>
        <p className="text-sm text-gray-600">
          Status: {status ? "✅ Verified" : "❌ Not verified"}
        </p>
      </div>

      {/* Issuer Management */}
      <PendingIssuers />
    </div>
  );
}
