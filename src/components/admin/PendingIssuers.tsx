"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

// Integration with your gas-optimized smart contract functions
interface PendingIssuer {
  id: string;
  organizationName: string;
  contactEmail: string;
  website?: string | null;
  description: string;
  walletAddress: string;
  status: "pending" | "success" | "rejected";
  appliedAt: string;
  createdAt: string;
}

export function PendingIssuers() {
  const [pendingIssuers, setPendingIssuers] = useState<PendingIssuer[]>([]);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Load applications from API
  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await fetch("/api/admin/applications");
      if (response.ok) {
        const data = await response.json();
        setPendingIssuers(data.applications || []);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
    }
  };

  // Approve issuer using gas-optimized 3.5M MIST budget
  const approveIssuer = async (issuerId: string) => {
    setLoadingStates((prev) => ({ ...prev, [issuerId]: true }));
    try {
      const issuer = pendingIssuers.find((i) => i.id === issuerId);
      if (!issuer) return;

      // Call your existing backend API that uses the optimized smart contract
      const response = await fetch("/api/admin/approve-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerId,
          walletAddress: issuer.walletAddress,
          gasBudget: 3500000, // Your tested optimal gas budget
        }),
      });

      if (response.ok) {
        // Update UI state
        setPendingIssuers((prev) =>
          prev.map((issuer) =>
            issuer.id === issuerId
              ? { ...issuer, status: "success" as const }
              : issuer
          )
        );
        // Reload applications to get fresh data
        await loadApplications();
      } else {
        const error = await response.text();
        console.error("Approval failed:", error);
      }
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [issuerId]: false }));
    }
  };

  return (
    <div className="space-y-4 p-6">
      <h2 className="text-2xl font-bold">Pending Issuer Applications</h2>

      {pendingIssuers.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No pending applications found.
        </div>
      ) : (
        pendingIssuers.map((issuer) => (
          <div key={issuer.id} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">
                {issuer.organizationName}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-sm ${
                  issuer.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : issuer.status === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {issuer.status === "success" ? "approved" : issuer.status}
              </span>
            </div>

            <div className="space-y-2 text-sm">
              <p>
                <strong>Contact Email:</strong> {issuer.contactEmail}
              </p>
              {issuer.website && (
                <p>
                  <strong>Website:</strong>
                  <a
                    href={issuer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-2"
                  >
                    {issuer.website}
                  </a>
                </p>
              )}
              <p>
                <strong>Description:</strong> {issuer.description}
              </p>
              <p>
                <strong>Wallet Address:</strong>{" "}
                <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                  {issuer.walletAddress}
                </code>
              </p>
              <p>
                <strong>Applied:</strong>{" "}
                {new Date(issuer.appliedAt).toLocaleDateString()}
              </p>
            </div>

            {issuer.status === "pending" && (
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => approveIssuer(issuer.id)}
                  disabled={loadingStates[issuer.id] || false}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loadingStates[issuer.id]
                    ? "Approving..."
                    : "Approve (Gas: 3.5M MIST)"}
                </Button>
                <Button variant="destructive">Reject</Button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
