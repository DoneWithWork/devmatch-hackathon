"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  PlusCircle,
  FileText,
  Send,
  Award,
  ExternalLink,
  Fuel,
  User,
  Wallet,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import { IssuerGasTracking } from "./IssuerGasTracking";
import { CertificateIssuanceForm } from "./CertificateIssuanceForm";
import WalletConnect from "@/components/ui/wallet-connect";

interface CertificateTemplate {
  id: string;
  name: string;
  description: string;
  fields: string[];
  createdAt: string;
  onChainId?: string;
}

interface IssuedCertificate {
  id: string;
  templateId: string;
  templateName: string;
  recipientAddress: string;
  fieldData: Record<string, string>;
  status: "issued" | "minted";
  issuedAt: string;
  onChainId?: string;
  nftId?: string;
}

interface UserSession {
  id: string;
  userAddress: string;
  role: "issuer" | "admin" | "user";
  maxEpoch?: number;
  randomness?: string;
}

interface GasBalance {
  mist: string;
  sui: string;
  formatted: string;
  lastUpdated: string;
}

export function IssuerDashboard() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuedCerts, setIssuedCerts] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "templates" | "issue" | "issued" | "gas"
  >("templates");

  // User session and balance state
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [gasBalance, setGasBalance] = useState<GasBalance | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  // Form states
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [showIssueCert, setShowIssueCert] = useState(false);
  const [selectedTemplate, setSelectedTemplate] =
    useState<CertificateTemplate | null>(null);

  // Template creation form
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    fields: [""], // Start with one empty field
  });

  // Certificate issuance form
  const [certForm, setCertForm] = useState({
    recipientAddress: "",
    fieldData: {} as Record<string, string>,
  });

  // Fetch user session and issuer status
  const fetchUserSession = useCallback(async () => {
    console.log("Fetching user session...");
    try {
      const response = await fetch("/api/auth/session");
      console.log("Session response status:", response.status);
      if (response.ok) {
        const data = await response.json();
        console.log("Session data received:", data);
        setUserSession(data);

        // Check if user is an approved issuer
        if (data?.role === "issuer") {
          console.log("User is approved issuer");
          setIsApproved(true);
        } else {
          console.log("User role:", data?.role);
        }
      } else {
        console.log("Session response not ok");
      }
    } catch (error) {
      console.error("Failed to fetch user session:", error);
    }
  }, []);

  // Fetch gas balance
  const fetchGasBalance = useCallback(async () => {
    if (!userSession?.userAddress) return;

    try {
      const response = await fetch("/api/auth/gas-balance");
      if (response.ok) {
        const data = await response.json();
        setGasBalance({
          mist: data.balance,
          sui: data.formatted,
          formatted: data.formatted,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch gas balance:", error);
    }
  }, [userSession?.userAddress]);

  const fetchTemplates = useCallback(async () => {
    if (!isApproved) return;

    try {
      const response = await fetch("/api/issuer/templates");
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
      toast.error("Failed to fetch templates");
    }
  }, [isApproved]);

  const fetchIssuedCertificates = useCallback(async () => {
    if (!isApproved) return;

    try {
      const response = await fetch("/api/issuer/certificates");
      if (response.ok) {
        const data = await response.json();
        setIssuedCerts(data.certificates || []);
      }
    } catch (error) {
      console.error("Failed to fetch issued certificates:", error);
      toast.error("Failed to fetch issued certificates");
    }
  }, [isApproved]);

  useEffect(() => {
    fetchUserSession();
  }, [fetchUserSession]);

  useEffect(() => {
    if (userSession) {
      fetchGasBalance();
      fetchTemplates();
      fetchIssuedCertificates();
    }
  }, [userSession, fetchGasBalance, fetchTemplates, fetchIssuedCertificates]);

  const copyAddress = () => {
    if (userSession?.userAddress) {
      navigator.clipboard.writeText(userSession.userAddress);
      toast.success("Address copied to clipboard!");
    }
  };
  const createTemplate = async () => {
    if (
      !newTemplate.name ||
      !newTemplate.description ||
      newTemplate.fields.some((f) => !f.trim())
    ) {
      toast.error("Please fill in all template fields");
      return;
    }
    setLoading(true);
    try {
      console.log("🔄 Starting template creation with client-side signing");

      // Step 1: Get transaction bytes from server
      const transactionResponse = await fetch("/api/issuer/create-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newTemplate.name,
          description: newTemplate.description,
          attributes: newTemplate.fields.filter((f) => f.trim()),
        }),
      });

      const transactionResult = await transactionResponse.json();

      if (!transactionResult.requiresSigning) {
        toast.error(
          `Server error: ${transactionResult.error || "Unknown error"}`
        );
        return;
      }

      console.log("📦 Received transaction bytes for signing");

      // Step 2: Check for wallet connection
      if (typeof window === "undefined" || !window.suiWallet) {
        toast.error(
          "SUI Wallet not found. Please install and connect a SUI wallet."
        );
        return;
      }

      // Step 3: Sign transaction with wallet
      toast.info("Please sign the transaction in your wallet...");

      try {
        const signedTransaction = await window.suiWallet.signTransactionBlock({
          transactionBlock: new Uint8Array(transactionResult.transactionBytes),
        });

        console.log("✅ Transaction signed successfully");

        // Step 4: Submit signed transaction to server
        const submitResponse = await fetch("/api/issuer/create-template", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newTemplate.name,
            description: newTemplate.description,
            attributes: newTemplate.fields.filter((f) => f.trim()),
            signedTransaction: {
              transactionBlockBytes: Array.from(
                signedTransaction.transactionBlockBytes
              ),
              signature: signedTransaction.signature,
            },
          }),
        });

        const submitResult = await submitResponse.json();

        if (submitResult.success) {
          toast.success(
            "Template created successfully with blockchain verification!"
          );
          setShowCreateTemplate(false);
          setNewTemplate({ name: "", description: "", fields: [""] });
          fetchTemplates();
        } else {
          toast.error(`Failed to create template: ${submitResult.error}`);
        }
      } catch (walletError) {
        console.error("Wallet signing failed:", walletError);
        toast.error("Transaction signing failed. Please try again.");
      }
    } catch (error) {
      toast.error("Failed to create template");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const issueCertificate = async () => {
    if (!selectedTemplate || !certForm.recipientAddress) {
      toast.error("Please select template and recipient address");
      return;
    }
    if (!userSession?.userAddress) {
      toast.error("User session not found");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/issuer/issue-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.onChainId,
          recipientAddress: certForm.recipientAddress,
          fieldData: certForm.fieldData,
          walletAddress: userSession.userAddress,
          // Don't pass issuerPrivateKey from client - let API handle it
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success(
          "Certificate issued successfully!" +
            (result.clientProvidedId
              ? ` Link ID: ${result.clientProvidedId}`
              : "")
        );
        setShowIssueCert(false);
        setCertForm({ recipientAddress: "", fieldData: {} });
        setSelectedTemplate(null);
        fetchIssuedCertificates();
      } else {
        toast.error(`Failed to issue certificate: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to issue certificate");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const mintCertificate = async (certId: string, recipientAddress: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/issuer/mint-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: certId,
          recipientAddress,
          payGasWithIssuer: true,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Certificate minted as NFT!");
        fetchIssuedCertificates();
      } else {
        toast.error(`Failed to mint certificate: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to mint certificate");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const addTemplateField = () => {
    setNewTemplate((prev) => ({
      ...prev,
      fields: [...prev.fields, ""],
    }));
  };

  const updateTemplateField = (index: number, value: string) => {
    setNewTemplate((prev) => ({
      ...prev,
      fields: prev.fields.map((field, i) => (i === index ? value : field)),
    }));
  };

  const removeTemplateField = (index: number) => {
    setNewTemplate((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  const refreshBalance = () => {
    fetchGasBalance();
    toast.success("Balance refreshed!");
  };

  // Loading state
  if (!userSession) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading...</div>
          <div className="text-muted-foreground">Fetching user session</div>
        </div>
      </div>
    );
  }

  // Not approved issuer state
  if (!isApproved) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Not an Approved Issuer</h3>
          <p className="mt-2 text-muted-foreground">
            You need to apply and be approved as an issuer to access this
            dashboard.
          </p>
          <Button
            className="mt-4"
            onClick={() => (window.location.href = "/apply")}
          >
            Apply to be an Issuer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your certificate templates and issuances
          </p>

          {/* User Info Card */}
          <Card className="mt-4 max-w-md">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Current User</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      Address:
                    </span>
                    <div className="flex items-center gap-1">
                      <code className="text-xs bg-muted px-1 rounded">
                        {userSession.userAddress.slice(0, 8)}...
                        {userSession.userAddress.slice(-8)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={copyAddress}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Role:</span>
                    <Badge variant="secondary" className="text-xs">
                      {userSession.role}
                    </Badge>
                  </div>

                  {/* Wallet Connection for Template Creation */}
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs font-medium">
                        Wallet Connection
                      </span>
                    </div>
                    <WalletConnect
                      className="w-full"
                      onConnect={(address) => {
                        console.log("Wallet connected:", address);
                        toast.success(
                          "Wallet connected for transaction signing"
                        );
                      }}
                    />
                  </div>

                  {gasBalance && (
                    <div className="flex items-center gap-2">
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Balance:
                      </span>
                      <span className="text-xs font-mono">
                        {gasBalance.formatted}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={refreshBalance}
                        className="h-6 w-6 p-0"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-2">
          <Button
            variant={activeTab === "templates" ? "default" : "outline"}
            onClick={() => setActiveTab("templates")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates ({templates.length})
          </Button>
          <Button
            variant={activeTab === "issue" ? "default" : "outline"}
            onClick={() => setActiveTab("issue")}
          >
            <Send className="w-4 h-4 mr-2" />
            Issue Certificates
          </Button>
          <Button
            variant={activeTab === "issued" ? "default" : "outline"}
            onClick={() => setActiveTab("issued")}
          >
            <Award className="w-4 h-4 mr-2" />
            Issued ({issuedCerts.length})
          </Button>
          <Button
            variant={activeTab === "gas" ? "default" : "outline"}
            onClick={() => setActiveTab("gas")}
          >
            <Fuel className="w-4 h-4 mr-2" />
            Gas Tracking
          </Button>
        </div>
      </div>

      <Separator />

      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Certificate Templates</h2>
            <div className="flex gap-2">
              {/* Removed deprecated Create Real Template test button */}
              <Dialog
                open={showCreateTemplate}
                onOpenChange={setShowCreateTemplate}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create Certificate Template</DialogTitle>
                    <DialogDescription>
                      Define the structure and fields for your certificates.
                      This will create a blockchain template that you can use to
                      issue certificates.
                    </DialogDescription>
                  </DialogHeader>

                  {/* Wallet Signing Info */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <Wallet className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">
                          Wallet Signing Required
                        </p>
                        <p className="text-blue-700">
                          Template creation requires blockchain verification.
                          You&apos;ll be prompted to sign a transaction with
                          your connected wallet.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="template-name">Template Name</Label>
                      <Input
                        id="template-name"
                        value={newTemplate.name}
                        onChange={(e) =>
                          setNewTemplate((prev) => ({
                            ...prev,
                            name: e.target.value,
                          }))
                        }
                        placeholder="e.g., Course Completion Certificate"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="template-description">Description</Label>
                      <Textarea
                        id="template-description"
                        value={newTemplate.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                          setNewTemplate((prev) => ({
                            ...prev,
                            description: e.target.value,
                          }))
                        }
                        placeholder="Describe what this certificate represents"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Certificate Fields</Label>
                      <div className="space-y-2">
                        {newTemplate.fields.map((field, index) => (
                          <div key={index} className="flex gap-2">
                            <Input
                              value={field}
                              onChange={(e) =>
                                updateTemplateField(index, e.target.value)
                              }
                              placeholder={`Field ${
                                index + 1
                              } (e.g., Student Name)`}
                            />
                            {newTemplate.fields.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeTemplateField(index)}
                              >
                                Remove
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button variant="outline" onClick={addTemplateField}>
                          Add Field
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateTemplate(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={createTemplate} disabled={loading}>
                        {loading ? "Creating..." : "Create Template"}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card
                key={template.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Fields:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.fields.map((field, index) => (
                          <Badge key={index} variant="secondary">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-muted-foreground">
                        Created{" "}
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedTemplate(template);
                          setShowIssueCert(true);
                        }}
                      >
                        <Send className="w-4 h-4 mr-1" />
                        Issue
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "issued" && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Issued Certificates</h2>
          <div className="space-y-2">
            {issuedCerts.map((cert) => (
              <Card key={cert.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{cert.templateName}</h3>
                        <Badge
                          variant={
                            cert.status === "minted" ? "default" : "secondary"
                          }
                        >
                          {cert.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Recipient: {cert.recipientAddress.slice(0, 8)}...
                        {cert.recipientAddress.slice(-8)}
                      </p>
                      <div className="space-y-1">
                        {Object.entries(cert.fieldData).map(([key, value]) => (
                          <p key={key} className="text-sm">
                            <span className="font-medium">{key}:</span> {value}
                          </p>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Issued {new Date(cert.issuedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {cert.onChainId && (
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={`https://suiexplorer.com/object/${cert.onChainId}?network=devnet`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View
                          </a>
                        </Button>
                      )}
                      {cert.status === "issued" && (
                        <Button
                          size="sm"
                          onClick={() =>
                            mintCertificate(
                              cert.onChainId!,
                              cert.recipientAddress
                            )
                          }
                          disabled={loading}
                        >
                          Mint NFT
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === "issue" && (
        <div className="space-y-4">
          <CertificateIssuanceForm />
        </div>
      )}

      {activeTab === "gas" && <IssuerGasTracking />}

      {/* Issue Certificate Dialog */}
      <Dialog open={showIssueCert} onOpenChange={setShowIssueCert}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Issue Certificate</DialogTitle>
            <DialogDescription>
              Issue a new certificate using the template:{" "}
              {selectedTemplate?.name}
            </DialogDescription>
          </DialogHeader>
          {selectedTemplate && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="recipient-address">Recipient Address</Label>
                <Input
                  id="recipient-address"
                  value={certForm.recipientAddress}
                  onChange={(e) =>
                    setCertForm((prev) => ({
                      ...prev,
                      recipientAddress: e.target.value,
                    }))
                  }
                  placeholder="0x..."
                />
              </div>
              <div className="space-y-3">
                <Label>Certificate Data</Label>
                <div className="space-y-3">
                  {selectedTemplate.fields.map((field) => (
                    <div key={field} className="space-y-1">
                      <Label htmlFor={field}>{field}</Label>
                      <Input
                        id={field}
                        value={certForm.fieldData[field] || ""}
                        onChange={(e) =>
                          setCertForm((prev) => ({
                            ...prev,
                            fieldData: {
                              ...prev.fieldData,
                              [field]: e.target.value,
                            },
                          }))
                        }
                        placeholder={`Enter ${field.toLowerCase()}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowIssueCert(false)}
                >
                  Cancel
                </Button>
                <Button onClick={issueCertificate} disabled={loading}>
                  {loading ? "Issuing..." : "Issue Certificate"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
