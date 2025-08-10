"use client";

import { useState, useEffect } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, ExternalLink, Copy, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface CertificateTemplate {
  id: string;
  templateName: string;
  templateUrl: string;
  description?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  created_at: string;
}

interface Certificate {
  id: string;
  templateId?: string;
  recipientName: string;
  recipientEmail?: string;
  status: string;
  issuedAt: string;
  expiresAt?: string;
  verificationCode: string;
  minted: boolean;
  downloadCount: number;
  // Added blockchain status flags
  isRevoked?: boolean;
}

export function CertificateManagement() {
  const [templates, setTemplates] = useState<CertificateTemplate[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createTemplateOpen, setCreateTemplateOpen] = useState(false);
  const [createCertificateOpen, setCreateCertificateOpen] = useState(false);

  // Template form state
  const [templateForm, setTemplateForm] = useState({
    templateName: "",
    templateUrl: "",
    description: "",
    metadata: "",
  });

  // Certificate form state
  const [certificateForm, setCertificateForm] = useState({
    templateId: "",
    recipientName: "",
    recipientEmail: "",
    recipientWallet: "",
    certificateData: "",
    expiresAt: "",
  });

  // Dynamic fields for certificate data
  const [certificateFields, setCertificateFields] = useState<
    Array<{ id: string; key: string; value: string }>
  >([{ id: "1", key: "", value: "" }]);

  useEffect(() => {
    fetchTemplates();
    fetchCertificates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await fetch("/api/issuer/templates");
      const data = await response.json();

      if (data.success) {
        setTemplates(data.templates);
      } else {
        toast.error("Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Error fetching templates");
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await fetch("/api/issuer/certificates");
      const data = await response.json();

      if (data.success) {
        type RawCert = {
          id: string;
          templateId?: string;
          recipientName: string;
          recipientEmail?: string;
          status: string;
          issuedAt: string;
          expiresAt?: string;
          verificationCode: string;
          minted: boolean;
          downloadCount: number;
          isRevoked?: boolean;
        };
        setCertificates(
          (data.certificates as RawCert[]).map((c) => ({
            id: c.id,
            templateId: c.templateId,
            recipientName: c.recipientName,
            recipientEmail: c.recipientEmail,
            status: c.status,
            issuedAt: c.issuedAt,
            expiresAt: c.expiresAt,
            verificationCode: c.verificationCode,
            minted: c.minted,
            downloadCount: c.downloadCount,
            isRevoked: c.isRevoked,
          }))
        );
      } else {
        toast.error("Failed to fetch certificates");
      }
      setLoading(false);
    } catch (error) {
      console.error("Error fetching certificates:", error);
      toast.error("Error fetching certificates");
      setLoading(false);
    }
  };

  // Dynamic field management functions
  const addCertificateField = () => {
    const newField = {
      id: Date.now().toString(),
      key: "",
      value: "",
    };
    setCertificateFields((prev) => [...prev, newField]);
  };

  const updateCertificateField = (
    id: string,
    field: "key" | "value",
    newValue: string
  ) => {
    setCertificateFields((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, [field]: newValue } : item
      )
    );
  };

  const removeCertificateField = (id: string) => {
    setCertificateFields((prev) => {
      const filtered = prev.filter((item) => item.id !== id);
      // Ensure at least one field remains
      return filtered.length > 0 ? filtered : [{ id: "1", key: "", value: "" }];
    });
  };

  const createTemplate = async () => {
    try {
      let metadata = null;
      if (templateForm.metadata) {
        try {
          metadata = JSON.parse(templateForm.metadata);
        } catch {
          toast.error("Invalid metadata JSON");
          return;
        }
      }

      const response = await fetch("/api/issuer/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateName: templateForm.templateName,
          templateUrl: templateForm.templateUrl,
          description: templateForm.description,
          metadata,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Template created successfully!");
        setCreateTemplateOpen(false);
        setTemplateForm({
          templateName: "",
          templateUrl: "",
          description: "",
          metadata: "",
        });
        fetchTemplates();
      } else {
        toast.error(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Error creating template");
    }
  };

  const createCertificate = async () => {
    try {
      // Build certificate data from dynamic fields
      const certificateData: Record<string, string> = {};

      // Add fields from dynamic form
      certificateFields.forEach((field) => {
        if (field.key.trim() && field.value.trim()) {
          certificateData[field.key.trim()] = field.value.trim();
        }
      });

      const response = await fetch("/api/issuer/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: certificateForm.templateId || null,
          recipientName: certificateForm.recipientName,
          recipientEmail: certificateForm.recipientEmail || null,
          recipientWallet: certificateForm.recipientWallet || null,
          certificateData,
          expiresAt: certificateForm.expiresAt || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Certificate created successfully!");
        setCreateCertificateOpen(false);
        setCertificateForm({
          templateId: "",
          recipientName: "",
          recipientEmail: "",
          recipientWallet: "",
          certificateData: "",
          expiresAt: "",
        });
        // Reset dynamic fields
        setCertificateFields([{ id: "1", key: "", value: "" }]);
        fetchCertificates();
      } else {
        toast.error(data.error || "Failed to create certificate");
      }
    } catch (error) {
      console.error("Error creating certificate:", error);
      toast.error("Error creating certificate");
    }
  };

  const copyVerificationCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Verification code copied to clipboard!");
  };

  const getVerificationUrl = (code: string) => {
    return `${window.location.origin}/api/verify?code=${code}`;
  };

  const revokeOnChain = async (certificateId: string) => {
    try {
      const res = await fetch("/api/issuer/revoke-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          certificateId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Certificate revoked on-chain");
        fetchCertificates();
      } else {
        toast.error(data.error || "Failed to revoke");
      }
    } catch {
      toast.error("Revoke failed");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Certificate Management</h2>
      </div>

      <Tabs defaultValue="certificates" className="space-y-4">
        <TabsList>
          <TabsTrigger value="certificates">Certificates</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="certificates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Issued Certificates</h3>
            <Dialog
              open={createCertificateOpen}
              onOpenChange={setCreateCertificateOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Certificate</DialogTitle>
                  <DialogDescription>
                    Issue a new certificate to a recipient
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template">Template (Optional)</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={certificateForm.templateId}
                      onChange={(e) =>
                        setCertificateForm({
                          ...certificateForm,
                          templateId: e.target.value,
                        })
                      }
                    >
                      <option value="">No template</option>
                      {templates.map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.templateName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={certificateForm.recipientName}
                      onChange={(e) =>
                        setCertificateForm({
                          ...certificateForm,
                          recipientName: e.target.value,
                        })
                      }
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={certificateForm.recipientEmail}
                      onChange={(e) =>
                        setCertificateForm({
                          ...certificateForm,
                          recipientEmail: e.target.value,
                        })
                      }
                      placeholder="Enter recipient email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientWallet">Recipient Wallet</Label>
                    <Input
                      id="recipientWallet"
                      value={certificateForm.recipientWallet}
                      onChange={(e) =>
                        setCertificateForm({
                          ...certificateForm,
                          recipientWallet: e.target.value,
                        })
                      }
                      placeholder="Enter recipient wallet address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificateData">Certificate Data</Label>
                    <div className="space-y-3">
                      {certificateFields.map((field) => (
                        <div
                          key={field.id}
                          className="flex items-center space-x-2"
                        >
                          <div className="flex-1">
                            <Input
                              placeholder="Field name (e.g., course, grade)"
                              value={field.key}
                              onChange={(e) =>
                                updateCertificateField(
                                  field.id,
                                  "key",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          <div className="flex-1">
                            <Input
                              placeholder="Field value (e.g., Blockchain 101, A+)"
                              value={field.value}
                              onChange={(e) =>
                                updateCertificateField(
                                  field.id,
                                  "value",
                                  e.target.value
                                )
                              }
                            />
                          </div>
                          {certificateFields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCertificateField(field.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCertificateField}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Field
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="expiresAt">Expiration Date</Label>
                    <Input
                      id="expiresAt"
                      type="datetime-local"
                      value={certificateForm.expiresAt}
                      onChange={(e) =>
                        setCertificateForm({
                          ...certificateForm,
                          expiresAt: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button onClick={createCertificate} className="w-full">
                    Create Certificate
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Recipient</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Issued</TableHead>
                    <TableHead>Verification Code</TableHead>
                    <TableHead>Downloads</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {certificates.map((cert) => (
                    <TableRow key={cert.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {cert.recipientName}
                          </div>
                          {cert.recipientEmail && (
                            <div className="text-sm text-gray-500">
                              {cert.recipientEmail}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            cert.isRevoked
                              ? "destructive"
                              : cert.status === "issued"
                              ? "default"
                              : cert.status === "draft"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {cert.isRevoked ? "revoked" : cert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(cert.issuedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                            {cert.verificationCode}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyVerificationCode(cert.verificationCode)
                            }
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{cert.downloadCount}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            window.open(
                              getVerificationUrl(cert.verificationCode),
                              "_blank"
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {!cert.isRevoked && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => revokeOnChain(cert.id)}
                            title="Revoke certificate"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Certificate Templates</h3>
            <Dialog
              open={createTemplateOpen}
              onOpenChange={setCreateTemplateOpen}
            >
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable certificate template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="templateName">Template Name *</Label>
                    <Input
                      id="templateName"
                      value={templateForm.templateName}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          templateName: e.target.value,
                        })
                      }
                      placeholder="Enter template name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="templateUrl">Template URL *</Label>
                    <Input
                      id="templateUrl"
                      value={templateForm.templateUrl}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          templateUrl: e.target.value,
                        })
                      }
                      placeholder="https://example.com/template"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={templateForm.description}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Describe this template"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="metadata">Metadata (JSON)</Label>
                    <Textarea
                      id="metadata"
                      value={templateForm.metadata}
                      onChange={(e) =>
                        setTemplateForm({
                          ...templateForm,
                          metadata: e.target.value,
                        })
                      }
                      placeholder='{"fields": ["name", "course"], "design": {"color": "blue"}}'
                      rows={4}
                    />
                  </div>
                  <Button onClick={createTemplate} className="w-full">
                    Create Template
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {template.templateName}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Status:</span>
                      <Badge
                        variant={template.isActive ? "default" : "secondary"}
                      >
                        {template.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Created:</span>
                      <span className="text-sm">
                        {new Date(template.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2"
                      onClick={() =>
                        window.open(template.templateUrl, "_blank")
                      }
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
