"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wrench, Search, Plus } from "lucide-react";
import { toast } from "sonner";

export default function FixIssuerPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    error?: string;
    message?: string;
    issuerCapId?: string;
    transactionDigest?: string;
    walletAddress?: string;
    totalObjects?: number;
    issuerCaps?: Array<{ objectId: string; type: string }>;
  } | null>(null);

  const checkObjects = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test/fix-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_objects" }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success("Object check completed");
      } else {
        toast.error(data.error || "Check failed");
      }
    } catch (error) {
      console.error("Check failed:", error);
      toast.error("Check failed");
    } finally {
      setLoading(false);
    }
  };

  const createIssuerCap = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/test/fix-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create_issuer_cap" }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success(`Issuer capability created: ${data.issuerCapId}`);
      } else {
        toast.error(data.error || "Creation failed");
      }
    } catch (error) {
      console.error("Creation failed:", error);
      toast.error("Creation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🔧 Fix Issuer Capability
        </h1>
        <p className="text-gray-600">
          Diagnose and fix issuer capability ownership issues
        </p>
      </div>

      <div className="grid gap-6">
        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={checkObjects}
                disabled={loading}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                Check Wallet Objects
              </Button>

              <Button
                onClick={createIssuerCap}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Create New Issuer Cap
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Current Environment */}
        <Card>
          <CardHeader>
            <CardTitle>Environment Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Current Wallet:</strong>
                <br />
                <code className="text-xs bg-gray-100 p-1 rounded">
                  {process.env.NEXT_PUBLIC_SUI_WALLET_ADDRESS || "Not set"}
                </code>
              </div>
              <div>
                <strong>Current Issuer Cap:</strong>
                <br />
                <code className="text-xs bg-gray-100 p-1 rounded">
                  {process.env.NEXT_PUBLIC_SUI_ISSUER_CAP || "Not set"}
                </code>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Result
                <Badge variant={result.success ? "default" : "destructive"}>
                  {result.success ? "Success" : "Error"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm space-y-2">
              <p>
                <strong>Problem:</strong> The issuer capability object is owned
                by a different wallet than the one specified in environment
                variables.
              </p>

              <p>
                <strong>Solution Options:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Check what objects your current wallet owns</li>
                <li>Create a new issuer capability for your current wallet</li>
                <li>
                  Update the .env.local file with the new issuer capability ID
                </li>
              </ol>

              <p>
                <strong>Steps:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>
                  Click &quot;Check Wallet Objects&quot; to see current objects
                </li>
                <li>
                  If no IssuerCap found, click &quot;Create New Issuer Cap&quot;
                </li>
                <li>Copy the new issuer cap ID to your .env.local file</li>
                <li>Restart the development server</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
