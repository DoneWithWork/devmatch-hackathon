"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issuedDate: string;
  status: "pending" | "minted";
  onChainId?: string;
  issuerCapId: string;
  templateId: string;
  fieldData: Record<string, string>;
}

export function UserCertificatesDashboard() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [minting, setMinting] = useState<string | null>(null);

  // Fetch certificates issued to this user from your database
  useEffect(() => {
    fetchUserCertificates();
  }, []);

  const fetchUserCertificates = async () => {
    try {
      const response = await fetch("/api/user/certificates");
      const data = await response.json();
      setCertificates(data.certificates);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
    }
  };

  // Mint certificate using sponsored transaction (gas-free for user)
  const mintCertificate = async (certificateId: string) => {
    setMinting(certificateId);
    try {
      // This calls your backend which uses sponsored transactions
      // User doesn't pay gas - your app covers it with optimized budgets
      const response = await fetch("/api/user/mint-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId,
          userAddress: "USER_ZKLOGIN_ADDRESS", // Get from zkLogin
          gasBudget: 6000000, // Your optimized 6M MIST budget
        }),
      });

      const result = await response.json();

      if (result.success) {
        // Update local state
        setCertificates((prev) =>
          prev.map((cert) =>
            cert.id === certificateId
              ? { ...cert, status: "minted", onChainId: result.certificateId }
              : cert
          )
        );
      }
    } catch (error) {
      console.error("Minting failed:", error);
    } finally {
      setMinting(null);
    }
  };

  return (
    <div className="space-y-6">
      {certificates.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No certificates issued to you yet.</p>
        </div>
      ) : (
        certificates.map((cert) => (
          <div key={cert.id} className="border rounded-lg p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{cert.title}</h3>
                <p className="text-gray-600">Issued by: {cert.issuer}</p>
                <p className="text-sm text-gray-500">Date: {cert.issuedDate}</p>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    cert.status === "pending"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {cert.status === "pending" ? "Ready to Mint" : "Minted"}
                </span>
              </div>
            </div>

            {/* Certificate Details */}
            <div className="bg-gray-50 p-4 rounded space-y-2">
              {Object.entries(cert.fieldData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <span className="font-medium">{key}:</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>

            {/* On-chain info if minted */}
            {cert.status === "minted" && cert.onChainId && (
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm">
                  <strong>On-chain Certificate ID:</strong>
                  <code className="ml-2 bg-blue-100 px-2 py-1 rounded">
                    {cert.onChainId}
                  </code>
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  This certificate is now permanently stored on the Sui
                  blockchain and owned by you.
                </p>
              </div>
            )}

            {/* Mint Button */}
            {cert.status === "pending" && (
              <div className="pt-4 border-t">
                <Button
                  onClick={() => mintCertificate(cert.id)}
                  disabled={minting === cert.id}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {minting === cert.id
                    ? "Minting..."
                    : "Mint Certificate (Gas-Free!)"}
                </Button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  ⚡ Sponsored transaction - No gas fees for you!
                </p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
