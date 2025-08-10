"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Key,
  Shield,
  Database,
} from "lucide-react";
import { toast } from "sonner";

interface SystemStatus {
  addressMatch: boolean;
  ownershipMatch: boolean;
  issuerApproved: boolean;
  databaseConnected: boolean;
  blockchainConnected: boolean;
}

interface IssuerInfo {
  id: string;
  name: string;
  email: string;
  organization: string;
  approved: boolean;
  owner: string;
}

export default function SystemAdminPanel() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [issuerInfo, setIssuerInfo] = useState<IssuerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("status");

  const checkSystemStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/system-status");
      const data = await response.json();

      if (data.success) {
        setSystemStatus(data.status);
        setIssuerInfo(data.issuerInfo);
        toast.success("System status updated");
      } else {
        toast.error("Failed to check system status");
      }
    } catch (error) {
      toast.error("Error checking system status");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const approveIssuer = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/approve-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Issuer approved successfully!");
        await checkSystemStatus(); // Refresh status
      } else {
        toast.error(data.error || "Failed to approve issuer");
      }
    } catch (error) {
      toast.error("Error approving issuer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createNewIssuer = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/create-issuer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "Platform Issuer",
          email: "issuer@platform.com",
          organization: "HashCred Platform",
        }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("New issuer created and approved!");
        await checkSystemStatus(); // Refresh status
      } else {
        toast.error(data.error || "Failed to create issuer");
      }
    } catch (error) {
      toast.error("Error creating issuer");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/test-database");
      const data = await response.json();

      if (data.success) {
        toast.success("Database connection successful!");
      } else {
        toast.error("Database connection failed");
      }
    } catch {
      toast.error("Error testing database");
    } finally {
      setLoading(false);
    }
  };

  const resetEnvironment = async () => {
    if (
      !confirm(
        "Are you sure you want to reset the environment configuration? This will use backup values."
      )
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/admin/reset-environment", {
        method: "POST",
      });

      const data = await response.json();

      if (data.success) {
        toast.success(
          "Environment reset successfully! Please restart the server."
        );
      } else {
        toast.error("Failed to reset environment");
      }
    } catch {
      toast.error("Error resetting environment");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusBadge = (
    status: boolean,
    trueText: string,
    falseText: string
  ) => (
    <Badge variant={status ? "default" : "destructive"} className="ml-2">
      {status ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" /> {trueText}
        </>
      ) : (
        <>
          <XCircle className="w-3 h-3 mr-1" /> {falseText}
        </>
      )}
    </Badge>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="w-8 h-8 mr-3" />
            System Administration
          </h1>
          <p className="text-muted-foreground">
            Manage blockchain configuration, issuer approvals, and system health
          </p>
        </div>
        <Button onClick={checkSystemStatus} disabled={loading}>
          {loading ? "Checking..." : "Refresh Status"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="status">System Status</TabsTrigger>
          <TabsTrigger value="issuer">Issuer Management</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="tools">Admin Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Health Overview
              </CardTitle>
              <CardDescription>
                Real-time status of all system components
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {systemStatus ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Address Derivation</span>
                      {getStatusBadge(
                        systemStatus.addressMatch,
                        "Correct",
                        "Mismatch"
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Capability Ownership</span>
                      {getStatusBadge(
                        systemStatus.ownershipMatch,
                        "Matched",
                        "Mismatch"
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Issuer Approval</span>
                      {getStatusBadge(
                        systemStatus.issuerApproved,
                        "Approved",
                        "Pending"
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span>Database Connection</span>
                      {getStatusBadge(
                        systemStatus.databaseConnected,
                        "Connected",
                        "Error"
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Blockchain Connection</span>
                      {getStatusBadge(
                        systemStatus.blockchainConnected,
                        "Connected",
                        "Error"
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Loading system status...
                  </p>
                </div>
              )}

              {issuerInfo && (
                <div className="mt-6">
                  <Separator className="mb-4" />
                  <h4 className="font-semibold mb-3">
                    Current Issuer Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p>
                        <strong>Name:</strong> {issuerInfo.name}
                      </p>
                      <p>
                        <strong>Email:</strong> {issuerInfo.email}
                      </p>
                      <p>
                        <strong>Organization:</strong> {issuerInfo.organization}
                      </p>
                    </div>
                    <div>
                      <p>
                        <strong>Status:</strong>
                        <Badge
                          variant={
                            issuerInfo.approved ? "default" : "secondary"
                          }
                          className="ml-2"
                        >
                          {issuerInfo.approved ? "Approved" : "Pending"}
                        </Badge>
                      </p>
                      <p>
                        <strong>Capability ID:</strong>
                      </p>
                      <code className="text-xs bg-muted p-1 rounded">
                        {issuerInfo.id}
                      </code>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {systemStatus && !systemStatus.issuerApproved && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Action Required:</strong> The current issuer capability
                needs approval before certificate templates can be created. Use
                the &ldquo;Issuer Management&rdquo; tab to approve or create a
                new issuer.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="issuer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Issuer Management</CardTitle>
              <CardDescription>
                Approve pending issuers or create new issuer capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Approve Current Issuer
                    </CardTitle>
                    <CardDescription>
                      Approve the existing issuer capability for your wallet
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={approveIssuer}
                      disabled={
                        loading || (systemStatus?.issuerApproved ?? false)
                      }
                      className="w-full"
                    >
                      {loading
                        ? "Approving..."
                        : systemStatus?.issuerApproved
                        ? "Already Approved"
                        : "Approve Issuer"}
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Create New Issuer</CardTitle>
                    <CardDescription>
                      Create and approve a new issuer capability
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={createNewIssuer}
                      disabled={loading}
                      variant="outline"
                      className="w-full"
                    >
                      {loading ? "Creating..." : "Create New Issuer"}
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Note:</strong> Issuer approval requires admin
                  privileges. The system will automatically handle the approval
                  process using the configured admin capability.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Key className="w-5 h-5 mr-2" />
                Environment Configuration
              </CardTitle>
              <CardDescription>
                View and manage system configuration (Read-only for security)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>Current Wallet Address</Label>
                  <code className="block bg-muted p-2 rounded text-sm font-mono mt-1">
                    {systemStatus ? "0x9d38...c8d" : "Loading..."}
                  </code>
                </div>
                <div>
                  <Label>Issuer Capability ID</Label>
                  <code className="block bg-muted p-2 rounded text-sm font-mono mt-1">
                    {issuerInfo
                      ? `${issuerInfo.id.slice(0, 10)}...${issuerInfo.id.slice(
                          -10
                        )}`
                      : "Loading..."}
                  </code>
                </div>
                <div>
                  <Label>Package ID</Label>
                  <code className="block bg-muted p-2 rounded text-sm font-mono mt-1">
                    0x6619...60fc
                  </code>
                </div>
                <div>
                  <Label>Network</Label>
                  <Badge>Sui Devnet</Badge>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Security Notice:</strong> Full configuration details
                  are not displayed here for security reasons. Check the backup
                  files (ADDRESSES_BACKUP.md) for complete configuration details
                  if needed.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Database Tools
                </CardTitle>
                <CardDescription>
                  Test and manage database connections
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testDatabaseConnection}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? "Testing..." : "Test Database Connection"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Environment Reset</CardTitle>
                <CardDescription>
                  Reset configuration to backup values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={resetEnvironment}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading ? "Resetting..." : "Reset to Backup"}
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Important system details and backup information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm space-y-2">
                <p>
                  <strong>Backup Files Created:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>
                    <code>ADDRESSES_BACKUP.md</code> - Critical addresses and
                    recovery instructions
                  </li>
                  <li>
                    <code>ENVIRONMENT_BACKUP.md</code> - Complete environment
                    configuration
                  </li>
                  <li>
                    <code>.env.local.backup</code> - Direct copy of working
                    configuration
                  </li>
                </ul>
              </div>

              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Recovery Ready:</strong> All critical configuration
                  has been backed up. If anything goes wrong, refer to the
                  backup files for complete recovery instructions.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
