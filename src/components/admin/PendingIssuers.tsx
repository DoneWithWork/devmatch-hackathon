"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

// Integration with your gas-optimized smart contract functions
interface PendingIssuer {
  id: string;
  issuerCapId: string;
  name: string;
  organization: string;
  email: string;
  appliedAt: string;
  status: "pending" | "approved" | "rejected";
}

export function PendingIssuers() {
  const [pendingIssuers, setPendingIssuers] = useState<PendingIssuer[]>([]);
  const [loading, setLoading] = useState(false);

  // Approve issuer using gas-optimized 3.5M MIST budget
  const approveIssuer = async (issuerCapId: string) => {
    setLoading(true);
    try {
      // Call your existing backend API that uses the optimized smart contract
      const response = await fetch("/api/admin/approve-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerCapId,
          gasBudget: 3500000, // Your tested optimal gas budget
        }),
      });

      if (response.ok) {
        // Update UI state
        setPendingIssuers((prev) =>
          prev.map((issuer) =>
            issuer.issuerCapId === issuerCapId
              ? { ...issuer, status: "approved" }
              : issuer
          )
        );
      }
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Pending Issuer Applications</h2>

      {pendingIssuers.map((issuer) => (
        <div key={issuer.id} className="border rounded-lg p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">{issuer.name}</h3>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                issuer.status === "pending"
                  ? "bg-yellow-100 text-yellow-800"
                  : issuer.status === "approved"
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {issuer.status}
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <p>
              <strong>Organization:</strong> {issuer.organization}
            </p>
            <p>
              <strong>Email:</strong> {issuer.email}
            </p>
            <p>
              <strong>Applied:</strong> {issuer.appliedAt}
            </p>
            <p>
              <strong>IssuerCap ID:</strong>{" "}
              <code className="bg-gray-100 px-2 py-1 rounded">
                {issuer.issuerCapId}
              </code>
            </p>
          </div>

          {issuer.status === "pending" && (
            <div className="flex gap-2 mt-4">
              <Button
                onClick={() => approveIssuer(issuer.issuerCapId)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                {loading ? "Approving..." : "Approve (Gas: 3.5M MIST)"}
              </Button>
              <Button variant="destructive">Reject</Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
