"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Send, Users } from "lucide-react";
import { toast } from "sonner";

interface TemplateField {
  name: string;
  type: "string" | "number" | "date" | "email" | "array" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    min?: number;
    max?: number;
  };
}

interface Template {
  id: string;
  templateName: string;
  templateUrl: string;
  description?: string;
  category?: string;
  tags?: string[];
  fields?: TemplateField[];
  design?: {
    backgroundColor: string;
    textColor: string;
    layout: "portrait" | "landscape";
  };
  settings?: {
    autoExpiry: boolean;
    expiryDays?: number;
    transferable: boolean;
    downloadable: boolean;
    watermark: string;
  };
  isActive: boolean;
  usageCount: number;
}

interface Recipient {
  id: string;
  recipientName: string;
  recipientEmail?: string;
  recipientWallet?: string;
  fieldData: Record<string, string>;
}

export function CertificateIssuanceForm() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [issuing, setIssuing] = useState(false);

  // Single certificate form
  const [singleForm, setSingleForm] = useState({
    recipientName: "",
    recipientEmail: "",
    recipientWallet: "",
    fieldData: {} as Record<string, string>,
  });

  // Bulk certificate form
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [bulkCsv, setBulkCsv] = useState("");

  const [activeTab, setActiveTab] = useState("single");

  useEffect(() => {
    fetchTemplates();
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
      setLoading(false);
    } catch (error) {
      console.error("Error fetching templates:", error);
      toast.error("Error fetching templates");
      setLoading(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    setSelectedTemplate(template || null);

    // Reset field data when template changes
    setSingleForm((prev) => ({
      ...prev,
      fieldData: {},
    }));

    setRecipients([]);
  };

  const updateFieldData = (fieldName: string, value: string) => {
    setSingleForm((prev) => ({
      ...prev,
      fieldData: {
        ...prev.fieldData,
        [fieldName]: value,
      },
    }));
  };

  const addRecipient = () => {
    const newRecipient: Recipient = {
      id: Math.random().toString(36).substr(2, 9),
      recipientName: "",
      recipientEmail: "",
      recipientWallet: "",
      fieldData: {},
    };
    setRecipients((prev) => [...prev, newRecipient]);
  };

  const updateRecipient = (id: string, updates: Partial<Recipient>) => {
    setRecipients((prev) =>
      prev.map((recipient) =>
        recipient.id === id ? { ...recipient, ...updates } : recipient
      )
    );
  };

  const removeRecipient = (id: string) => {
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  const processCsvData = () => {
    if (!bulkCsv.trim()) {
      toast.error("Please provide CSV data");
      return;
    }

    try {
      const lines = bulkCsv.trim().split("\n");
      const headers = lines[0].split(",").map((h) => h.trim());

      const newRecipients: Recipient[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(",").map((v) => v.trim());
        const recipient: Recipient = {
          id: Math.random().toString(36).substr(2, 9),
          recipientName: "",
          recipientEmail: "",
          recipientWallet: "",
          fieldData: {},
        };

        headers.forEach((header, index) => {
          const value = values[index] || "";

          if (header.toLowerCase().includes("name")) {
            recipient.recipientName = value;
          } else if (header.toLowerCase().includes("email")) {
            recipient.recipientEmail = value;
          } else if (header.toLowerCase().includes("wallet")) {
            recipient.recipientWallet = value;
          } else {
            recipient.fieldData[header] = value;
          }
        });

        newRecipients.push(recipient);
      }

      setRecipients(newRecipients);
      toast.success(`Processed ${newRecipients.length} recipients from CSV`);
    } catch {
      toast.error("Failed to process CSV data");
    }
  };

  const issueSingleCertificate = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    if (!singleForm.recipientName) {
      toast.error("Recipient name is required");
      return;
    }

    // Validate required fields
    const requiredFields =
      selectedTemplate.fields?.filter((f) => f.required) || [];
    for (const field of requiredFields) {
      if (!singleForm.fieldData[field.name]) {
        toast.error(`${field.name} is required`);
        return;
      }
    }

    setIssuing(true);
    try {
      const response = await fetch("/api/issuer/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          recipientName: singleForm.recipientName,
          recipientEmail: singleForm.recipientEmail || null,
          recipientWallet: singleForm.recipientWallet || null,
          certificateData: singleForm.fieldData,
          expiresAt: selectedTemplate.settings?.autoExpiry
            ? new Date(
                Date.now() +
                  (selectedTemplate.settings.expiryDays || 365) *
                    24 *
                    60 *
                    60 *
                    1000
              ).toISOString()
            : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Certificate issued successfully!");

        // Reset form
        setSingleForm({
          recipientName: "",
          recipientEmail: "",
          recipientWallet: "",
          fieldData: {},
        });
      } else {
        toast.error(data.error || "Failed to issue certificate");
      }
    } catch (error) {
      console.error("Error issuing certificate:", error);
      toast.error("Error issuing certificate");
    } finally {
      setIssuing(false);
    }
  };

  const issueBulkCertificates = async () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    if (recipients.length === 0) {
      toast.error("Please add recipients");
      return;
    }

    setIssuing(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const recipient of recipients) {
        try {
          const response = await fetch("/api/issuer/certificates", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              templateId: selectedTemplate.id,
              recipientName: recipient.recipientName,
              recipientEmail: recipient.recipientEmail || null,
              recipientWallet: recipient.recipientWallet || null,
              certificateData: recipient.fieldData,
              expiresAt: selectedTemplate.settings?.autoExpiry
                ? new Date(
                    Date.now() +
                      (selectedTemplate.settings.expiryDays || 365) *
                        24 *
                        60 *
                        60 *
                        1000
                  ).toISOString()
                : null,
            }),
          });

          const data = await response.json();

          if (data.success) {
            successCount++;
          } else {
            errorCount++;
            console.error(
              `Failed to issue certificate for ${recipient.recipientName}:`,
              data.error
            );
          }
        } catch (error) {
          errorCount++;
          console.error(
            `Error issuing certificate for ${recipient.recipientName}:`,
            error
          );
        }
      }

      toast.success(
        `Issued ${successCount} certificates successfully. ${errorCount} failed.`
      );

      if (successCount > 0) {
        setRecipients([]);
        setBulkCsv("");
      }
    } catch (error) {
      console.error("Error in bulk issuance:", error);
      toast.error("Error in bulk certificate issuance");
    } finally {
      setIssuing(false);
    }
  };

  const renderDynamicFields = (
    fieldData: Record<string, string>,
    onUpdate: (name: string, value: string) => void
  ) => {
    if (!selectedTemplate?.fields) return null;

    return selectedTemplate.fields.map((field) => (
      <div key={field.name}>
        <Label htmlFor={field.name}>
          {field.name}
          {field.required && <span className="text-red-500">*</span>}
        </Label>

        {field.type === "select" ? (
          <Select
            value={fieldData[field.name] || ""}
            onValueChange={(value) => onUpdate(field.name, value)}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={field.placeholder || `Select ${field.name}`}
              />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : field.type === "date" ? (
          <Input
            type="date"
            value={fieldData[field.name] || ""}
            onChange={(e) => onUpdate(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        ) : field.type === "email" ? (
          <Input
            type="email"
            value={fieldData[field.name] || ""}
            onChange={(e) => onUpdate(field.name, e.target.value)}
            placeholder={field.placeholder}
          />
        ) : field.type === "number" ? (
          <Input
            type="number"
            value={fieldData[field.name] || ""}
            onChange={(e) => onUpdate(field.name, e.target.value)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
          />
        ) : (
          <Input
            type="text"
            value={fieldData[field.name] || ""}
            onChange={(e) => onUpdate(field.name, e.target.value)}
            placeholder={field.placeholder}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
          />
        )}
      </div>
    ));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading templates...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Issue Certificates</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          📜 {templates.length} Templates Available
        </Badge>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Template</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select
              value={selectedTemplate?.id || ""}
              onValueChange={handleTemplateSelect}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a certificate template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map((template) => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <span>{template.templateName}</span>
                      {template.category && (
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTemplate && (
              <div className="p-4 bg-gray-50 rounded border">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <strong>Description:</strong>{" "}
                    {selectedTemplate.description || "No description"}
                  </div>
                  <div>
                    <strong>Fields:</strong>{" "}
                    {selectedTemplate.fields?.length || 0} dynamic fields
                  </div>
                  <div>
                    <strong>Usage:</strong> {selectedTemplate.usageCount}{" "}
                    certificates issued
                  </div>
                  <div>
                    <strong>Settings:</strong>
                    {selectedTemplate.settings?.autoExpiry &&
                      ` Auto-expires in ${
                        selectedTemplate.settings.expiryDays || 365
                      } days`}
                    {selectedTemplate.settings?.transferable &&
                      " • Transferable"}
                    {selectedTemplate.settings?.downloadable &&
                      " • Downloadable"}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single Certificate</TabsTrigger>
            <TabsTrigger value="bulk">Bulk Issuance</TabsTrigger>
          </TabsList>

          {/* Single Certificate */}
          <TabsContent value="single" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Issue Single Certificate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="recipientName">Recipient Name *</Label>
                    <Input
                      id="recipientName"
                      value={singleForm.recipientName}
                      onChange={(e) =>
                        setSingleForm((prev) => ({
                          ...prev,
                          recipientName: e.target.value,
                        }))
                      }
                      placeholder="Enter recipient name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="recipientEmail">Recipient Email</Label>
                    <Input
                      id="recipientEmail"
                      type="email"
                      value={singleForm.recipientEmail}
                      onChange={(e) =>
                        setSingleForm((prev) => ({
                          ...prev,
                          recipientEmail: e.target.value,
                        }))
                      }
                      placeholder="Enter recipient email"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipientWallet">
                    Recipient Wallet (Optional)
                  </Label>
                  <Input
                    id="recipientWallet"
                    value={singleForm.recipientWallet}
                    onChange={(e) =>
                      setSingleForm((prev) => ({
                        ...prev,
                        recipientWallet: e.target.value,
                      }))
                    }
                    placeholder="Enter recipient wallet address"
                  />
                </div>

                {/* Dynamic Fields */}
                <div className="space-y-4">
                  <Label className="text-lg font-medium">
                    Certificate Data
                  </Label>
                  <div className="grid grid-cols-2 gap-4">
                    {renderDynamicFields(singleForm.fieldData, updateFieldData)}
                  </div>
                </div>

                <Button
                  onClick={issueSingleCertificate}
                  disabled={issuing}
                  className="w-full"
                  size="lg"
                >
                  {issuing ? (
                    <>Loading...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Issue Certificate
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Bulk Certificates */}
          <TabsContent value="bulk" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* CSV Input */}
              <Card>
                <CardHeader>
                  <CardTitle>CSV Data Import</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="csvData">CSV Data</Label>
                    <Textarea
                      id="csvData"
                      value={bulkCsv}
                      onChange={(e) => setBulkCsv(e.target.value)}
                      placeholder="name,email,course,grade&#10;John Doe,john@example.com,Blockchain 101,A+&#10;Jane Smith,jane@example.com,Smart Contracts,A"
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={processCsvData}
                    variant="outline"
                    className="w-full"
                  >
                    Process CSV Data
                  </Button>
                </CardContent>
              </Card>

              {/* Manual Entry */}
              <Card>
                <CardHeader>
                  <CardTitle>Manual Entry</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={addRecipient}
                    variant="outline"
                    className="w-full"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Add Recipient
                  </Button>

                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="p-3 border rounded space-y-2"
                      >
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Name"
                            value={recipient.recipientName}
                            onChange={(e) =>
                              updateRecipient(recipient.id, {
                                recipientName: e.target.value,
                              })
                            }
                          />
                          <Input
                            placeholder="Email"
                            value={recipient.recipientEmail}
                            onChange={(e) =>
                              updateRecipient(recipient.id, {
                                recipientEmail: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeRecipient(recipient.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {recipients.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    Review & Issue ({recipients.length} certificates)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={issueBulkCertificates}
                    disabled={issuing}
                    className="w-full"
                    size="lg"
                  >
                    {issuing ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Issue All Certificates
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {!selectedTemplate && (
        <Card>
          <CardContent className="text-center py-12">
            <AlertCircle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Template Selected
            </h3>
            <p className="text-gray-600">
              Please select a certificate template above to start issuing
              certificates.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
