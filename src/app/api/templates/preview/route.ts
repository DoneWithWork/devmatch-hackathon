import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const templateUrl = searchParams.get("template");
    const metadata = searchParams.get("metadata");

    if (!templateUrl) {
      return NextResponse.json(
        { success: false, error: "Template URL is required" },
        { status: 400 }
      );
    }

    let parsedMetadata = null;
    if (metadata) {
      try {
        parsedMetadata = JSON.parse(metadata);
      } catch {
        return NextResponse.json(
          { success: false, error: "Invalid metadata JSON" },
          { status: 400 }
        );
      }
    }

    // Generate preview HTML that shows template with sample data
    const previewHtml = generatePreviewHtml(templateUrl, parsedMetadata);

    return new Response(previewHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    });
  } catch (error) {
    console.error("❌ Error generating template preview:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate preview" },
      { status: 500 }
    );
  }
}

function generatePreviewHtml(templateUrl: string, metadata: any): string {
  const sampleData = generateSampleData(metadata);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Certificate Template Preview</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 20px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
            }
            .preview-container {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                padding: 30px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.1);
            }
            .preview-header {
                text-align: center;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 2px solid #f0f0f0;
            }
            .preview-title {
                font-size: 2.5em;
                color: #333;
                margin-bottom: 10px;
                font-weight: bold;
            }
            .preview-subtitle {
                color: #666;
                font-size: 1.2em;
            }
            .template-frame {
                border: 3px solid #e0e0e0;
                border-radius: 8px;
                padding: 20px;
                margin: 20px 0;
                background: ${metadata?.design?.backgroundColor || "#ffffff"};
                color: ${metadata?.design?.textColor || "#000000"};
                min-height: 400px;
                position: relative;
                overflow: hidden;
            }
            .template-content {
                position: relative;
                z-index: 2;
            }
            .watermark {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) rotate(-45deg);
                font-size: 4em;
                color: rgba(0,0,0,0.05);
                font-weight: bold;
                z-index: 1;
                user-select: none;
                pointer-events: none;
            }
            .field-preview {
                margin: 15px 0;
                padding: 10px;
                border-left: 4px solid #667eea;
                background: rgba(102, 126, 234, 0.05);
            }
            .field-label {
                font-weight: bold;
                color: #333;
                margin-bottom: 5px;
            }
            .field-value {
                color: #666;
                font-style: italic;
            }
            .sample-data {
                margin-top: 30px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
            }
            .data-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 15px;
                margin-top: 15px;
            }
            .template-url {
                word-break: break-all;
                background: #e9ecef;
                padding: 10px;
                border-radius: 4px;
                font-family: monospace;
                margin: 10px 0;
            }
            .badge {
                display: inline-block;
                background: #007bff;
                color: white;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8em;
                margin: 2px;
            }
            .required {
                background: #dc3545;
            }
            .optional {
                background: #6c757d;
            }
        </style>
    </head>
    <body>
        <div class="preview-container">
            <div class="preview-header">
                <h1 class="preview-title">📜 Certificate Template Preview</h1>
                <p class="preview-subtitle">This is how your certificate template will look with sample data</p>
            </div>

            <div class="template-info">
                <h3>Template URL:</h3>
                <div class="template-url">${templateUrl}</div>
            </div>

            <div class="template-frame">
                <div class="watermark">${
                  metadata?.settings?.watermark || "PREVIEW"
                }</div>
                <div class="template-content">
                    <h2 style="text-align: center; margin-bottom: 30px;">
                        🎓 SAMPLE CERTIFICATE
                    </h2>
                    
                    ${
                      metadata?.fields
                        ?.map(
                          (field: any) => `
                        <div class="field-preview">
                            <div class="field-label">
                                ${field.name} 
                                <span class="badge ${
                                  field.required ? "required" : "optional"
                                }">
                                    ${field.required ? "Required" : "Optional"}
                                </span>
                            </div>
                            <div class="field-value">
                                ${
                                  sampleData[field.name] ||
                                  `Sample ${field.name}`
                                }
                            </div>
                        </div>
                    `
                        )
                        .join("") || "<p>No dynamic fields defined</p>"
                    }
                    
                    <div style="text-align: center; margin-top: 40px;">
                        <p style="font-size: 0.9em; color: #666;">
                            🔗 Powered by HashCred Blockchain Verification
                        </p>
                    </div>
                </div>
            </div>

            <div class="sample-data">
                <h3>📊 Template Configuration</h3>
                <div class="data-grid">
                    ${
                      metadata
                        ? `
                        <div>
                            <strong>Design Settings:</strong><br>
                            Layout: ${
                              metadata.design?.layout || "Not specified"
                            }<br>
                            Background: ${
                              metadata.design?.backgroundColor || "Default"
                            }<br>
                            Text Color: ${
                              metadata.design?.textColor || "Default"
                            }
                        </div>
                        <div>
                            <strong>Certificate Settings:</strong><br>
                            Auto Expiry: ${
                              metadata.settings?.autoExpiry ? "Yes" : "No"
                            }<br>
                            Transferable: ${
                              metadata.settings?.transferable ? "Yes" : "No"
                            }<br>
                            Downloadable: ${
                              metadata.settings?.downloadable ? "Yes" : "No"
                            }
                        </div>
                        <div>
                            <strong>Fields Count:</strong><br>
                            Total: ${metadata.fields?.length || 0}<br>
                            Required: ${
                              metadata.fields?.filter((f: any) => f.required)
                                .length || 0
                            }<br>
                            Optional: ${
                              metadata.fields?.filter((f: any) => !f.required)
                                .length || 0
                            }
                        </div>
                    `
                        : `
                        <div>
                            <strong>No metadata provided</strong><br>
                            Template will use default settings
                        </div>
                    `
                    }
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                <p style="color: #666;">
                    💡 This is a preview. Actual certificates will be generated using your template URL with real data.
                </p>
            </div>
        </div>
    </body>
    </html>
  `;
}

function generateSampleData(metadata: any): Record<string, string> {
  const sampleData: Record<string, string> = {
    recipientName: "John Doe",
    recipientEmail: "john.doe@example.com",
    course: "Advanced Blockchain Development",
    completionDate: "August 9, 2024",
    grade: "A+",
    instructor: "Dr. Jane Smith",
    organization: "Blockchain University",
    certificateId: "CERT-2024-001",
    issueDate: new Date().toLocaleDateString(),
  };

  // Add sample data for defined fields
  if (metadata?.fields) {
    metadata.fields.forEach((field: any) => {
      if (!sampleData[field.name]) {
        switch (field.type) {
          case "string":
            sampleData[field.name] = field.options
              ? field.options[0]
              : `Sample ${field.name}`;
            break;
          case "number":
            sampleData[field.name] = "95";
            break;
          case "date":
            sampleData[field.name] = new Date().toLocaleDateString();
            break;
          case "email":
            sampleData[field.name] = "sample@example.com";
            break;
          case "select":
            sampleData[field.name] = field.options?.[0] || "Option 1";
            break;
          default:
            sampleData[field.name] = `Sample ${field.name}`;
        }
      }
    });
  }

  return sampleData;
}
