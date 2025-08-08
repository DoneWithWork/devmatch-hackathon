"use client";
import React, { useState } from "react";
import {
  Shield,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import AuthLayout from "@/components/layouts/AuthLayout";

interface Certificate {
  id: string;
  title: string;
  recipientName: string;
  issuerName: string;
  issueDate: string;
  expiryDate?: string;
  status: "valid" | "expired" | "revoked";
  blockchainTx: string;
  metadata?: {
    grade?: string;
    course?: string;
    institution?: string;
  };
}

const mockCertificate: Certificate = {
  id: "0xe21db89af54ce771839a3b2906a0507f749f0448fdc45593ad579b68b4fdbf0d",
  title: "Blockchain Development Bootcamp",
  recipientName: "John Doe",
  issuerName: "DevMatch Frontend Team",
  issueDate: "2025-01-08",
  status: "valid",
  blockchainTx: "6M47z8uWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q",
  metadata: {
    grade: "A+",
    course: "Advanced Blockchain Development",
    institution: "DevMatch Academy",
  },
};

export default function VerifyPage() {
  const [certificateId, setCertificateId] = useState("");
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleVerify = async () => {
    if (!certificateId.trim()) {
      setError("Please enter a certificate ID");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Mock verification - in reality, this would query the blockchain
      if (certificateId === mockCertificate.id || certificateId === "demo") {
        setCertificate(mockCertificate);
      } else {
        setError("Certificate not found or invalid ID");
        setCertificate(null);
      }
    } catch {
      setError("Error verifying certificate. Please try again.");
      setCertificate(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "valid":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "expired":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case "revoked":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "valid":
        return "bg-green-100 text-green-800";
      case "expired":
        return "bg-yellow-100 text-yellow-800";
      case "revoked":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <AuthLayout>
      <div className="container mx-auto p-6 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold">Certificate Verification</h1>
          </div>
          <p className="text-gray-600 text-lg">
            Verify the authenticity of any certificate using blockchain
            technology
          </p>
        </div>

        {/* Verification Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Verify Certificate
            </CardTitle>
            <CardDescription>
              Enter the certificate ID or transaction hash to verify its
              authenticity. Try &quot;demo&quot; to see a sample certificate.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter certificate ID (e.g., 0xe21db89a...)"
                value={certificateId}
                onChange={(e) => setCertificateId(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleVerify()}
                className="flex-1"
              />
              <Button
                onClick={handleVerify}
                disabled={isLoading}
                className="min-w-[120px]"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Certificate Details */}
        {certificate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center">
                  {getStatusIcon(certificate.status)}
                  <span className="ml-2">Certificate Details</span>
                </CardTitle>
                <Badge className={getStatusColor(certificate.status)}>
                  {certificate.status.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Certificate Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">Title:</span>
                      <p className="font-medium">{certificate.title}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Recipient:</span>
                      <p className="font-medium">{certificate.recipientName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Issuer:</span>
                      <p className="font-medium">{certificate.issuerName}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Issue Date:</span>
                      <p className="font-medium">
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Blockchain Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm text-gray-500">
                        Certificate ID:
                      </span>
                      <p className="font-mono text-sm break-all">
                        {certificate.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">
                        Transaction Hash:
                      </span>
                      <p className="font-mono text-sm break-all">
                        {certificate.blockchainTx}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-500">Network:</span>
                      <p className="font-medium">Sui Devnet</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metadata */}
              {certificate.metadata && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Additional Details
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4">
                    {certificate.metadata.grade && (
                      <div>
                        <span className="text-sm text-gray-500">Grade:</span>
                        <p className="font-medium">
                          {certificate.metadata.grade}
                        </p>
                      </div>
                    )}
                    {certificate.metadata.course && (
                      <div>
                        <span className="text-sm text-gray-500">Course:</span>
                        <p className="font-medium">
                          {certificate.metadata.course}
                        </p>
                      </div>
                    )}
                    {certificate.metadata.institution && (
                      <div>
                        <span className="text-sm text-gray-500">
                          Institution:
                        </span>
                        <p className="font-medium">
                          {certificate.metadata.institution}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Verification Status */}
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3" />
                  <div>
                    <h4 className="font-medium text-green-900">
                      Verification Successful
                    </h4>
                    <p className="text-sm text-green-700 mt-1">
                      This certificate has been verified on the blockchain and
                      is authentic. The certificate was issued by an approved
                      issuer and has not been tampered with.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>How Verification Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Enter Certificate ID</h3>
                <p className="text-sm text-gray-600">
                  Input the unique certificate identifier or blockchain
                  transaction hash
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Blockchain Lookup</h3>
                <p className="text-sm text-gray-600">
                  Our system queries the Sui blockchain to retrieve certificate
                  data
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span className="text-blue-600 font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Instant Results</h3>
                <p className="text-sm text-gray-600">
                  Get immediate verification results with full certificate
                  details
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
}
