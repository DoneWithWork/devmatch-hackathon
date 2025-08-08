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
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Award, Gift, Copy, Wallet } from "lucide-react";
import { toast } from "sonner";

interface Certificate {
  objectId: string;
  type: "IssuedCertificate";
  templateId: string;
  issuerAddress: string;
  recipientAddress: string;
  issuanceDate: string;
  certificateFields: Record<string, string>;
  display?: unknown;
}

interface CertificateNFT {
  objectId: string;
  type: "CertificateNFT";
  name: string;
  description: string;
  imageUrl?: string;
  certificateData: Record<string, unknown>;
  display?: unknown;
}

interface UserCertificatesData {
  success: boolean;
  userAddress: string;
  certificates: {
    count: number;
    items: Certificate[];
  };
  nfts?: {
    count: number;
    items: CertificateNFT[];
  };
  total: number;
}

export function UserCertificatesDashboard() {
  const [data, setData] = useState<UserCertificatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userAddress, setUserAddress] = useState<string>("");
  const [showWalletDialog, setShowWalletDialog] = useState(false);
  const [manualAddress, setManualAddress] = useState("");

  useEffect(() => {
    console.log("UserCertificatesDashboard mounted");
    // Check if there's a saved wallet address in localStorage
    const savedAddress = localStorage.getItem("userWalletAddress");
    console.log("Saved address from localStorage:", savedAddress);
    if (savedAddress) {
      setUserAddress(savedAddress);
      fetchUserCertificates(savedAddress);
    } else {
      console.log("No saved address, setting loading to false");
      setLoading(false);
    }
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("showWalletDialog state changed to:", showWalletDialog);
  }, [showWalletDialog]);

  const fetchUserCertificates = async (address: string) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/user/certificates?address=${address}&includeNFTs=true`
      );

      if (response.ok) {
        const result = await response.json();
        setData(result);
      } else {
        toast.error("Failed to fetch certificates");
      }
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast.error("Failed to fetch certificates");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const connectWallet = () => {
    console.log("Connect wallet button clicked!");
    setShowWalletDialog(true);
    console.log("Dialog should be opening...");
  };

  const handleManualConnect = () => {
    console.log("Manual connect clicked with address:", manualAddress);
    if (
      manualAddress &&
      manualAddress.startsWith("0x") &&
      manualAddress.length > 10
    ) {
      setUserAddress(manualAddress);
      localStorage.setItem("userWalletAddress", manualAddress);
      setShowWalletDialog(false);
      fetchUserCertificates(manualAddress);
      toast.success("Wallet connected successfully!");
    } else {
      toast.error("Please enter a valid Sui address (starts with 0x)");
    }
  };

  const disconnectWallet = () => {
    setUserAddress("");
    setData(null);
    setManualAddress("");
    localStorage.removeItem("userWalletAddress");
    toast.success("Wallet disconnected");
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    console.log("Rendering loading state");
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            Your issued certificates and NFTs
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!userAddress) {
    console.log("Rendering connect wallet state. userAddress:", userAddress);
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            Connect your wallet to view certificates
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Award className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
                <p className="text-muted-foreground">
                  Please connect your wallet to view your certificates and NFTs
                </p>
              </div>
              <Button onClick={connectWallet}>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Wallet Connection Dialog */}
        <Dialog open={showWalletDialog} onOpenChange={setShowWalletDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Connect Wallet</DialogTitle>
              <DialogDescription>
                Enter your Sui wallet address to view your certificates
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Wallet Address</Label>
                <Input
                  id="address"
                  placeholder="0x..."
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWalletDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleManualConnect}>Connect</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">Failed to load certificates</p>
        </div>
        <Button onClick={() => fetchUserCertificates(userAddress)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Certificates</h1>
          <p className="text-muted-foreground">
            Your issued certificates and NFTs • {data.total} total items
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(userAddress)}
          >
            <Copy className="w-4 h-4 mr-1" />
            {formatAddress(userAddress)}
          </Button>
          <Button
            variant="outline"
            onClick={() => fetchUserCertificates(userAddress)}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={disconnectWallet}>
            Disconnect
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Award className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{data.certificates.count}</p>
                <p className="text-sm text-muted-foreground">Certificates</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Gift className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{data.nfts?.count || 0}</p>
                <p className="text-sm text-muted-foreground">NFTs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <ExternalLink className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{data.total}</p>
                <p className="text-sm text-muted-foreground">Total Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Certificates Section */}
      {data.certificates.count > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Award className="w-5 h-5" />
            Issued Certificates ({data.certificates.count})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.certificates.items.map((cert) => (
              <Card
                key={cert.objectId}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">Certificate</CardTitle>
                      <CardDescription>
                        From {formatAddress(cert.issuerAddress)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">Issued</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Certificate Fields */}
                    <div className="space-y-2">
                      {Object.entries(cert.certificateFields).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-muted-foreground">
                              {key}:
                            </span>{" "}
                            <span>{String(value)}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Issue Date */}
                    <div className="text-xs text-muted-foreground border-t pt-2">
                      Issued: {formatDate(cert.issuanceDate)}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://suiexplorer.com/object/${cert.objectId}?network=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(cert.objectId)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy ID
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* NFTs Section */}
      {data.nfts && data.nfts.count > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Certificate NFTs ({data.nfts.count})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.nfts.items.map((nft) => (
              <Card
                key={nft.objectId}
                className="hover:shadow-md transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{nft.name}</CardTitle>
                      <CardDescription>{nft.description}</CardDescription>
                    </div>
                    <Badge>NFT</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {/* Certificate Data */}
                    <div className="space-y-2">
                      {Object.entries(nft.certificateData).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-medium text-muted-foreground">
                              {key}:
                            </span>{" "}
                            <span>{String(value)}</span>
                          </div>
                        )
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" asChild>
                        <a
                          href={`https://suiexplorer.com/object/${nft.objectId}?network=devnet`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          View NFT
                        </a>
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => copyToClipboard(nft.objectId)}
                      >
                        <Copy className="w-4 h-4 mr-1" />
                        Copy ID
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.total === 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Award className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">No Certificates Yet</h3>
                <p className="text-muted-foreground">
                  You haven&apos;t received any certificates yet. Once
                  institutions issue certificates to your address, they will
                  appear here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
