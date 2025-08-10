"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Integration with your gas-optimized smart contract functions
interface PendingIssuer {
  id: string;
  organizationName: string;
  contactEmail: string;
  website?: string | null;
  description: string;
  walletAddress: string;
  status: "pending" | "success" | "rejected" | "approved";
  appliedAt: string;
  createdAt: string;
  transactionDigest?: string | null;
  hasBlockchainIntegration?: boolean;
}

export function PendingIssuers() {
  const [pendingIssuers, setPendingIssuers] = useState<PendingIssuer[]>([]);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "success" | "rejected"
  >("all");
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  );

  // Load applications from API
  useEffect(() => {
    loadApplications();
  }, []);

  // Filter issuers based on active tab
  const filteredIssuers = pendingIssuers.filter((issuer) => {
    if (activeTab === "all") return true;
    return issuer.status === activeTab;
  });

  // Count applications by status
  const statusCounts = {
    all: pendingIssuers.length,
    pending: pendingIssuers.filter((i) => i.status === "pending").length,
    success: pendingIssuers.filter((i) => i.status === "approved").length,
    rejected: pendingIssuers.filter((i) => i.status === "rejected").length,
  };

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

  // Approve issuer - updates database status
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
              ? { ...issuer, status: "approved" as const }
              : issuer
          )
        );
        // Reload applications to get fresh data
        await loadApplications();

        // Trigger gas balance refresh by dispatching a custom event
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("refreshGasBalance"));
        }
      } else {
        // Handle error response
        let errorMessage = "Unknown error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          try {
            errorMessage = (await response.text()) || errorMessage;
          } catch {
            console.error("Failed to parse error response");
          }
        }
        console.error("Approval failed:", errorMessage);
        alert(`Approval failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Approval failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [issuerId]: false }));
    }
  };

  // Reject issuer application
  const rejectIssuer = async (issuerId: string) => {
    setLoadingStates((prev) => ({ ...prev, [issuerId]: true }));
    try {
      // Call backend API to reject the issuer
      const response = await fetch("/api/admin/reject-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ issuerId }),
      });

      if (response.ok) {
        // Update UI state
        setPendingIssuers((prev) =>
          prev.map((issuer) =>
            issuer.id === issuerId
              ? { ...issuer, status: "rejected" as const }
              : issuer
          )
        );
        // Reload applications to get fresh data
        await loadApplications();
      } else {
        // Handle error response
        let errorMessage = "Unknown error occurred";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, try to get text
          try {
            errorMessage = (await response.text()) || errorMessage;
          } catch {
            console.error("Failed to parse error response");
          }
        }
        console.error("Rejection failed:", errorMessage);
        alert(`Rejection failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error("Rejection failed:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [issuerId]: false }));
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold">Issuer Applications</h2>
        <p className="text-gray-600 mt-1">
          Review and approve issuer applications
        </p>

        {/* Status Tabs */}
        <div className="flex gap-1 mt-4 p-1 bg-gray-100 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "all"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({statusCounts.all})
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "pending"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({statusCounts.pending})
          </button>
          <button
            onClick={() => setActiveTab("success")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "success"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Approved ({statusCounts.success})
          </button>
          <button
            onClick={() => setActiveTab("rejected")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === "rejected"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Rejected ({statusCounts.rejected})
          </button>
        </div>
      </div>

      <div className="p-6">
        {filteredIssuers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === "all" ? "" : activeTab + " "}applications
            </h3>
            <p className="text-gray-500">
              {activeTab === "all"
                ? "New issuer applications will appear here for review."
                : `No applications with ${activeTab} status found.`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredIssuers.map((issuer) => (
              <div
                key={issuer.id}
                className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {issuer.organizationName}
                    </h3>
                    <p className="text-sm text-gray-500 break-all">
                      {issuer.contactEmail}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Badge
                      className={
                        issuer.status === "pending"
                          ? "bg-orange-100 text-orange-800 border-orange-200"
                          : issuer.status === "approved"
                          ? "bg-green-100 text-green-800 border-green-200"
                          : "bg-red-100 text-red-800 border-red-200"
                      }
                    >
                      {issuer.status === "pending" && "🟡 "}
                      {issuer.status === "approved" && "🟢 "}
                      {issuer.status === "rejected" && "🔴 "}
                      {issuer.status}
                    </Badge>
                    {issuer.hasBlockchainIntegration && (
                      <Badge variant="outline" className="text-xs">
                        🔗 Blockchain
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 text-sm mb-4">
                  {issuer.website && (
                    <div className="min-w-0">
                      <span className="font-medium text-gray-700">
                        Website:
                      </span>
                      <a
                        href={issuer.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline ml-2 break-all"
                      >
                        {issuer.website}
                      </a>
                    </div>
                  )}
                  <div>
                    <span className="font-medium text-gray-700">Applied:</span>
                    <span className="ml-2">
                      {new Date(issuer.appliedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm break-words">
                    <span className="font-medium text-gray-700">
                      Description:
                    </span>
                    <span className="ml-2">{issuer.description}</span>
                  </p>
                </div>

                <div className="mb-4">
                  <div className="text-xs">
                    <div className="font-medium text-gray-700 mb-1">
                      Wallet Address:
                    </div>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono break-all block">
                      {issuer.walletAddress}
                    </code>
                    {issuer.transactionDigest && (
                      <div className="mt-2">
                        <div className="font-medium text-gray-700 mb-1">
                          Transaction:
                        </div>
                        <code className="bg-green-50 px-2 py-1 rounded text-xs font-mono break-all block">
                          {issuer.transactionDigest}
                        </code>
                      </div>
                    )}
                  </div>
                </div>

                {issuer.status === "pending" && (
                  <div className="flex gap-2 pt-3 border-t">
                    <Button
                      onClick={() => approveIssuer(issuer.id)}
                      disabled={loadingStates[issuer.id] || false}
                      className="bg-green-600 hover:bg-green-700 flex-1"
                    >
                      {loadingStates[issuer.id]
                        ? "Approving..."
                        : issuer.hasBlockchainIntegration
                        ? "Approve on Blockchain"
                        : "Approve (DB Only)"}
                    </Button>
                    <Button
                      onClick={() => rejectIssuer(issuer.id)}
                      disabled={loadingStates[issuer.id] || false}
                      variant="destructive"
                      className="flex-1"
                    >
                      {loadingStates[issuer.id] ? "Rejecting..." : "Reject"}
                    </Button>
                  </div>
                )}

                {issuer.status === "approved" && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-green-700 bg-green-50 px-3 py-2 rounded border border-green-200">
                      <span className="text-lg">🟢</span>
                      <span className="font-medium">Application Approved</span>
                      {issuer.hasBlockchainIntegration && (
                        <span className="text-sm">(On Blockchain)</span>
                      )}
                    </div>
                  </div>
                )}

                {issuer.status === "rejected" && (
                  <div className="pt-3 border-t">
                    <div className="flex items-center gap-2 text-red-700 bg-red-50 px-3 py-2 rounded border border-red-200">
                      <span className="text-lg">🔴</span>
                      <span className="font-medium">Application Rejected</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
