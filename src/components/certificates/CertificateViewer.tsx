"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Award, Calendar, User } from "lucide-react";
import { toast } from "sonner";

// Same badge styles as issuer
const BADGE_STYLES = {
  classic: {
    name: "Classic",
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    textColor: "#ffffff",
    border: "2px solid #4a5568",
  },
  modern: {
    name: "Modern",
    background: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    textColor: "#ffffff",
    border: "none",
  },
  professional: {
    name: "Professional",
    background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    textColor: "#ffffff",
    border: "1px solid #2d3748",
  },
  gold: {
    name: "Gold",
    background: "linear-gradient(135deg, #ffd89b 0%, #19547b 100%)",
    textColor: "#1a202c",
    border: "2px solid #d69e2e",
  },
  minimal: {
    name: "Minimal",
    background: "#ffffff",
    textColor: "#2d3748",
    border: "2px solid #e2e8f0",
  },
};

interface Certificate {
  id: string;
  recipientName: string;
  certificateTitle: string;
  description?: string;
  issuerName?: string;
  customFields?: Record<string, string>;
  style?: string;
  issuedAt: string;
  onChainAddress?: string;
  isValid: boolean;
}

export function CertificateViewer() {
  const [searchAddress, setSearchAddress] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const searchCertificate = async () => {
    if (!searchAddress.trim()) {
      toast.error("Please enter a certificate address");
      return;
    }

    setLoading(true);
    setError("");
    setCertificate(null);

    try {
      // First try to find by ID in our database
      const response = await fetch(
        `/api/certificates/${encodeURIComponent(searchAddress)}`
      );
      const data = await response.json();

      if (data.success && data.certificate) {
        setCertificate(data.certificate);
      } else {
        setError("Certificate not found or invalid address");
      }
    } catch (err) {
      console.error("Error fetching certificate:", err);
      setError(
        "Error fetching certificate. Please check the address and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderCertificate = (cert: Certificate) => {
    const style =
      BADGE_STYLES[cert.style as keyof typeof BADGE_STYLES] ||
      BADGE_STYLES.classic;

    return (
      <div className="space-y-6">
        {/* Certificate Visual */}
        <div
          className="w-full max-w-lg mx-auto p-8 rounded-lg shadow-xl"
          style={{
            background: style.background,
            color: style.textColor,
            border: style.border,
          }}
        >
          <div className="text-center space-y-6">
            <div className="text-4xl">🏆</div>
            <h1 className="text-2xl font-bold">{cert.certificateTitle}</h1>
            <p className="text-lg opacity-90">This certifies that</p>
            <p className="text-xl font-bold">{cert.recipientName}</p>
            {cert.description && (
              <p className="text-base opacity-90">{cert.description}</p>
            )}

            {cert.customFields &&
              Object.entries(cert.customFields).map(([key, value]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{key}:</span> {value}
                </div>
              ))}

            <div className="pt-6 border-t border-current/20 space-y-2">
              {cert.issuerName && (
                <p className="text-sm opacity-75">
                  Issued by: {cert.issuerName}
                </p>
              )}
              <p className="text-sm opacity-75">
                {new Date(cert.issuedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Certificate Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Certificate Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Recipient:</span>
                <span className="text-sm">{cert.recipientName}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Issued:</span>
                <span className="text-sm">
                  {new Date(cert.issuedAt).toLocaleDateString()}
                </span>
              </div>

              {cert.onChainAddress && (
                <div className="flex items-center gap-2 col-span-2">
                  <ExternalLink className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">On-chain Address:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {cert.onChainAddress}
                  </code>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={cert.isValid ? "default" : "destructive"}>
                {cert.isValid ? "✓ Valid" : "✗ Invalid"}
              </Badge>
              <span className="text-xs text-gray-500">
                {cert.isValid
                  ? "This certificate is verified on-chain"
                  : "This certificate could not be verified"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Certificate Verification</h1>
        <p className="text-gray-600">
          Enter a certificate address to verify and view the certificate
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle>Search Certificate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter certificate ID or on-chain address"
              value={searchAddress}
              onChange={(e) => setSearchAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchCertificate()}
              className="flex-1"
            />
            <Button onClick={searchCertificate} disabled={loading}>
              {loading ? (
                "Searching..."
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}
        </CardContent>
      </Card>

      {/* Certificate Display */}
      {certificate && renderCertificate(certificate)}

      {/* Example addresses for testing */}
      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-gray-600">
          <p>
            <strong>For Recipients:</strong> Use the certificate ID or on-chain
            address you received to verify your certificate.
          </p>
          <p>
            <strong>For Verifiers:</strong> Anyone can verify a
            certificate&apos;s authenticity by entering its address here.
          </p>
          <p>
            <strong>Blockchain Verification:</strong> Certificates are stored
            on-chain, making them tamper-proof and permanently verifiable.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
