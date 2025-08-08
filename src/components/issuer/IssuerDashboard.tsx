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
import { PlusCircle, FileText, Send, Award, ExternalLink } from "lucide-react";
import { toast } from "sonner";

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

export function IssuerDashboard() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [issuedCerts, setIssuedCerts] = useState<IssuedCertificate[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"templates" | "issued">(
    "templates"
  );

  // Issuer credentials state
  const [issuerCredentials, setIssuerCredentials] = useState({
    privateKey: "",
    issuerCapId: "",
    address: "",
  });
  const [showCredentialsDialog, setShowCredentialsDialog] = useState(false);

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

  const fetchTemplates = useCallback(async () => {
    try {
      const address = issuerCredentials.address || "default_issuer";
      const response = await fetch(
        `/api/issuer/templates?issuerAddress=${address}`
      );
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error("Failed to fetch templates:", error);
    }
  }, [issuerCredentials.address]);

  const fetchIssuedCertificates = useCallback(async () => {
    try {
      const address = issuerCredentials.address || "default_issuer";
      const response = await fetch(
        `/api/issuer/certificates?issuerAddress=${address}`
      );
      if (response.ok) {
        const data = await response.json();
        setIssuedCerts(data.certificates || []);
      }
    } catch (error) {
      console.error("Failed to fetch issued certificates:", error);
    }
  }, [issuerCredentials.address]);

  useEffect(() => {
    fetchTemplates();
    fetchIssuedCertificates();
  }, [fetchTemplates, fetchIssuedCertificates]);

  // Load credentials from localStorage on mount
  useEffect(() => {
    const savedCredentials = localStorage.getItem("issuerCredentials");
    if (savedCredentials) {
      try {
        const parsed = JSON.parse(savedCredentials);
        setIssuerCredentials(parsed);
      } catch (error) {
        console.error("Failed to parse saved credentials:", error);
      }
    }
  }, []);

  // Create a real template on the blockchain for testing
  const createRealTemplate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test/create-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Real template created! ID: ${result.templateId}`);
        // Add to templates list for immediate use
        const newRealTemplate: CertificateTemplate = {
          id: result.templateId,
          name: "Real Blockchain Template",
          description:
            "A real template created on the Sui blockchain for testing",
          fields: ["Student Name", "Course", "Grade"],
          createdAt: new Date().toISOString(),
          onChainId: result.templateId,
        };
        setTemplates((prev) => [newRealTemplate, ...prev]);
      } else {
        toast.error(`Failed to create real template: ${result.error}`);
      }
    } catch (error) {
      toast.error("Failed to create real template");
      console.error(error);
    } finally {
      setLoading(false);
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

    // Check if we have issuer credentials
    if (!issuerCredentials.privateKey || !issuerCredentials.issuerCapId) {
      toast.error("Please set up your issuer credentials first");
      setShowCredentialsDialog(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/issuer/create-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerCapId: issuerCredentials.issuerCapId,
          templateName: newTemplate.name,
          description: newTemplate.description,
          fields: newTemplate.fields.filter((f) => f.trim()),
          issuerPrivateKey: issuerCredentials.privateKey,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Template created successfully!");
        setShowCreateTemplate(false);
        setNewTemplate({ name: "", description: "", fields: [""] });
        fetchTemplates();
      } else {
        toast.error(`Failed to create template: ${result.error}`);
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

    if (!issuerCredentials.privateKey || !issuerCredentials.issuerCapId) {
      toast.error("Please set up your issuer credentials first");
      setShowCredentialsDialog(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/issuer/issue-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          issuerCapId: issuerCredentials.issuerCapId,
          templateId: selectedTemplate.onChainId,
          recipientAddress: certForm.recipientAddress,
          fieldData: certForm.fieldData,
          issuerPrivateKey: issuerCredentials.privateKey,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success("Certificate issued successfully!");
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
    if (!issuerCredentials.privateKey) {
      toast.error("Please set up your issuer credentials first");
      setShowCredentialsDialog(true);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/issuer/mint-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId: certId,
          recipientAddress,
          recipientPrivateKey: "RECIPIENT_PRIVATE_KEY", // This would need to be handled securely
          issuerPrivateKey: issuerCredentials.privateKey,
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

  const saveCredentials = () => {
    localStorage.setItem(
      "issuerCredentials",
      JSON.stringify(issuerCredentials)
    );
    setShowCredentialsDialog(false);
    toast.success("Credentials saved!");
  };

  const loadDemoCredentials = () => {
    const demoCredentials = {
      privateKey:
        "suiprivkey1qqgx3p7cnw3e3dwttececgmpq5sr6yk0pf9tvllh2yxysn3wewh0jx3f3gxp",
      issuerCapId:
        "0xd0dc22e78582f60a8fb93521a50ab95e0ebf87db8c8e2ee79e04bd10e508fb4b",
      address:
        "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
    };
    setIssuerCredentials(demoCredentials);
    toast.success("Demo credentials loaded!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Issuer Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your certificate templates and issuances
          </p>
          {issuerCredentials.address && (
            <p className="text-xs text-green-600 mt-1">
              Connected: {issuerCredentials.address.slice(0, 8)}...
              {issuerCredentials.address.slice(-8)}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowCredentialsDialog(true)}
            className={
              !issuerCredentials.privateKey
                ? "border-orange-500 text-orange-600"
                : ""
            }
          >
            {!issuerCredentials.privateKey
              ? "Setup Credentials"
              : "Update Credentials"}
          </Button>
          <Button
            variant={activeTab === "templates" ? "default" : "outline"}
            onClick={() => setActiveTab("templates")}
          >
            <FileText className="w-4 h-4 mr-2" />
            Templates ({templates.length})
          </Button>
          <Button
            variant={activeTab === "issued" ? "default" : "outline"}
            onClick={() => setActiveTab("issued")}
          >
            <Award className="w-4 h-4 mr-2" />
            Issued ({issuedCerts.length})
          </Button>
        </div>
      </div>

      <Separator />

      {/* Credentials Warning */}
      {(!issuerCredentials.privateKey || !issuerCredentials.issuerCapId) && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-orange-600 text-sm">!</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-orange-800">Setup Required</h3>
            <p className="text-sm text-orange-700">
              Please configure your issuer credentials to create templates and
              issue certificates.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCredentialsDialog(true)}
            className="border-orange-300 text-orange-700 hover:bg-orange-100"
          >
            Setup Now
          </Button>
        </div>
      )}

      {activeTab === "templates" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Certificate Templates</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={createRealTemplate}
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Real Template"}
              </Button>
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
                      Define the structure and fields for your certificates
                    </DialogDescription>
                  </DialogHeader>
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

      {/* Credentials Dialog */}
      <Dialog
        open={showCredentialsDialog}
        onOpenChange={setShowCredentialsDialog}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Issuer Credentials</DialogTitle>
            <DialogDescription>
              Enter your issuer credentials to create templates and issue
              certificates
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="private-key">Private Key</Label>
              <Input
                id="private-key"
                type="password"
                value={issuerCredentials.privateKey}
                onChange={(e) =>
                  setIssuerCredentials((prev) => ({
                    ...prev,
                    privateKey: e.target.value,
                  }))
                }
                placeholder="Your Sui private key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="issuer-cap">Issuer Cap ID</Label>
              <Input
                id="issuer-cap"
                value={issuerCredentials.issuerCapId}
                onChange={(e) =>
                  setIssuerCredentials((prev) => ({
                    ...prev,
                    issuerCapId: e.target.value,
                  }))
                }
                placeholder="Your issuer capability ID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={issuerCredentials.address}
                onChange={(e) =>
                  setIssuerCredentials((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Your Sui address"
              />
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={loadDemoCredentials} size="sm">
                Load Demo
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCredentialsDialog(false)}
                >
                  Cancel
                </Button>
                <Button onClick={saveCredentials}>Save Credentials</Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
