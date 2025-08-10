"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Copy, Download, ExternalLink } from "lucide-react";
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

interface TemplateMetadata {
  fields: TemplateField[];
  design: {
    backgroundColor: string;
    textColor: string;
    layout: "portrait" | "landscape";
    dimensions: { width: number; height: number };
  };
  settings: {
    autoExpiry: boolean;
    expiryDays?: number;
    transferable: boolean;
    downloadable: boolean;
    watermark: string;
  };
}

export function EnhancedTemplateManager() {
  const [templateForm, setTemplateForm] = useState({
    templateName: "",
    templateUrl: "",
    description: "",
    category: "",
    tags: "",
  });

  const [metadata, setMetadata] = useState<TemplateMetadata>({
    fields: [
      {
        name: "recipientName",
        type: "string",
        required: true,
        placeholder: "Enter recipient name",
        validation: { minLength: 2, maxLength: 100 },
      },
    ],
    design: {
      backgroundColor: "#ffffff",
      textColor: "#000000",
      layout: "landscape",
      dimensions: { width: 842, height: 595 },
    },
    settings: {
      autoExpiry: false,
      transferable: true,
      downloadable: true,
      watermark: "Official Certificate",
    },
  });

  const [currentField, setCurrentField] = useState<TemplateField>({
    name: "",
    type: "string",
    required: false,
    placeholder: "",
  });

  const [previewUrl, setPreviewUrl] = useState("");

  const addField = () => {
    if (!currentField.name) {
      toast.error("Field name is required");
      return;
    }

    setMetadata((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...currentField }],
    }));

    setCurrentField({
      name: "",
      type: "string",
      required: false,
      placeholder: "",
    });

    toast.success("Field added successfully");
  };

  const removeField = (index: number) => {
    setMetadata((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
    toast.success("Field removed");
  };

  const generatePreviewUrl = () => {
    const baseUrl = window.location.origin;
    const preview = `${baseUrl}/api/templates/preview?template=${encodeURIComponent(
      templateForm.templateUrl
    )}&metadata=${encodeURIComponent(JSON.stringify(metadata))}`;
    setPreviewUrl(preview);
    return preview;
  };

  const createTemplate = async () => {
    try {
      const response = await fetch("/api/issuer/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...templateForm,
          metadata,
          tags: templateForm.tags.split(",").map((tag) => tag.trim()),
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Template created successfully!");

        // Reset form
        setTemplateForm({
          templateName: "",
          templateUrl: "",
          description: "",
          category: "",
          tags: "",
        });

        // Keep one default field
        setMetadata((prev) => ({
          ...prev,
          fields: [prev.fields[0]],
        }));
      } else {
        toast.error(data.error || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      toast.error("Error creating template");
    }
  };

  const copyJsonMetadata = () => {
    navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
    toast.success("Metadata JSON copied to clipboard!");
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Enhanced Template Manager</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          📜 Certificate Templates
        </Badge>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="fields">Dynamic Fields</TabsTrigger>
          <TabsTrigger value="design">Design & Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview & Export</TabsTrigger>
        </TabsList>

        {/* Basic Information */}
        <TabsContent value="basic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  placeholder="e.g., Blockchain Developer Certificate"
                />
              </div>

              <div>
                <Label htmlFor="templateUrl">Template URL *</Label>
                <div className="flex gap-2">
                  <Input
                    id="templateUrl"
                    value={templateForm.templateUrl}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        templateUrl: e.target.value,
                      })
                    }
                    placeholder="https://your-cdn.com/templates/certificate.pdf"
                  />
                  <Button variant="outline" size="icon">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  URL to your certificate template file (PDF, PNG, SVG, or HTML)
                </p>
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
                  placeholder="Describe what this certificate template is for..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={templateForm.category}
                    onChange={(e) =>
                      setTemplateForm({
                        ...templateForm,
                        category: e.target.value,
                      })
                    }
                  >
                    <option value="">Select category</option>
                    <option value="education">Education</option>
                    <option value="professional">Professional</option>
                    <option value="achievement">Achievement</option>
                    <option value="training">Training</option>
                    <option value="certification">Certification</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma-separated)</Label>
                  <Input
                    id="tags"
                    value={templateForm.tags}
                    onChange={(e) =>
                      setTemplateForm({ ...templateForm, tags: e.target.value })
                    }
                    placeholder="blockchain, programming, course, university"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dynamic Fields */}
        <TabsContent value="fields" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dynamic Certificate Fields</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Current Fields */}
              <div className="space-y-2">
                <Label>Current Fields</Label>
                {metadata.fields.map((field, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant={field.required ? "default" : "secondary"}>
                        {field.name}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {field.type}
                      </span>
                      {field.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeField(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>

              {/* Add New Field */}
              <div className="border-t pt-4 space-y-4">
                <Label>Add New Field</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Field Name</Label>
                    <Input
                      value={currentField.name}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          name: e.target.value,
                        })
                      }
                      placeholder="e.g., courseName, grade, instructor"
                    />
                  </div>
                  <div>
                    <Label>Field Type</Label>
                    <select
                      className="w-full p-2 border rounded"
                      value={currentField.type}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          type: e.target.value as TemplateField["type"],
                        })
                      }
                    >
                      <option value="string">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
                      <option value="email">Email</option>
                      <option value="select">Dropdown</option>
                      <option value="array">List</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Placeholder</Label>
                    <Input
                      value={currentField.placeholder || ""}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          placeholder: e.target.value,
                        })
                      }
                      placeholder="Placeholder text for users"
                    />
                  </div>
                  <div className="flex items-center space-x-2 pt-6">
                    <input
                      type="checkbox"
                      checked={currentField.required}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          required: e.target.checked,
                        })
                      }
                    />
                    <Label>Required Field</Label>
                  </div>
                </div>

                {currentField.type === "select" && (
                  <div>
                    <Label>Options (comma-separated)</Label>
                    <Input
                      value={currentField.options?.join(", ") || ""}
                      onChange={(e) =>
                        setCurrentField({
                          ...currentField,
                          options: e.target.value
                            .split(",")
                            .map((opt) => opt.trim()),
                        })
                      }
                      placeholder="Option 1, Option 2, Option 3"
                    />
                  </div>
                )}

                <Button onClick={addField}>Add Field</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design & Settings */}
        <TabsContent value="design" className="space-y-4">
          <div className="grid grid-cols-2 gap-6">
            {/* Design */}
            <Card>
              <CardHeader>
                <CardTitle>Design Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <Input
                      type="color"
                      value={metadata.design.backgroundColor}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          design: {
                            ...prev.design,
                            backgroundColor: e.target.value,
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Text Color</Label>
                    <Input
                      type="color"
                      value={metadata.design.textColor}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          design: { ...prev.design, textColor: e.target.value },
                        }))
                      }
                    />
                  </div>
                </div>

                <div>
                  <Label>Layout</Label>
                  <select
                    className="w-full p-2 border rounded"
                    value={metadata.design.layout}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        design: {
                          ...prev.design,
                          layout: e.target.value as "portrait" | "landscape",
                        },
                      }))
                    }
                  >
                    <option value="landscape">Landscape</option>
                    <option value="portrait">Portrait</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Width (px)</Label>
                    <Input
                      type="number"
                      value={metadata.design.dimensions.width}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          design: {
                            ...prev.design,
                            dimensions: {
                              ...prev.design.dimensions,
                              width: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Height (px)</Label>
                    <Input
                      type="number"
                      value={metadata.design.dimensions.height}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          design: {
                            ...prev.design,
                            dimensions: {
                              ...prev.design.dimensions,
                              height: parseInt(e.target.value),
                            },
                          },
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Certificate Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={metadata.settings.autoExpiry}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            autoExpiry: e.target.checked,
                          },
                        }))
                      }
                    />
                    <Label>Auto Expiry</Label>
                  </div>

                  {metadata.settings.autoExpiry && (
                    <div>
                      <Label>Expiry Days</Label>
                      <Input
                        type="number"
                        value={metadata.settings.expiryDays || 365}
                        onChange={(e) =>
                          setMetadata((prev) => ({
                            ...prev,
                            settings: {
                              ...prev.settings,
                              expiryDays: parseInt(e.target.value),
                            },
                          }))
                        }
                        placeholder="365"
                      />
                    </div>
                  )}

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={metadata.settings.transferable}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            transferable: e.target.checked,
                          },
                        }))
                      }
                    />
                    <Label>Transferable</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={metadata.settings.downloadable}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            downloadable: e.target.checked,
                          },
                        }))
                      }
                    />
                    <Label>Downloadable</Label>
                  </div>

                  <div>
                    <Label>Watermark Text</Label>
                    <Input
                      value={metadata.settings.watermark}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            watermark: e.target.value,
                          },
                        }))
                      }
                      placeholder="Official Certificate"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview & Export */}
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview & Export</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4 mb-4">
                <Button onClick={generatePreviewUrl} variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Generate Preview URL
                </Button>
                <Button onClick={copyJsonMetadata} variant="outline">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Metadata JSON
                </Button>
              </div>

              {previewUrl && (
                <div className="p-4 bg-gray-50 rounded border">
                  <Label>Preview URL:</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={previewUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(previewUrl);
                        toast.success("Preview URL copied!");
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <Label>Metadata JSON Preview:</Label>
                <Textarea
                  value={JSON.stringify(metadata, null, 2)}
                  readOnly
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex justify-end">
                <Button onClick={createTemplate} size="lg">
                  Create Template
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
