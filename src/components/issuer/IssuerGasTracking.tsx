"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Fuel,
  TrendingUp,
  TrendingDown,
  Wallet,
  History,
  Filter,
  RefreshCw,
  ExternalLink,
  Info,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

interface Transaction {
  id: number;
  transactionHash: string | null;
  transactionType: string;
  status: string;
  fromAddress: string | null;
  toAddress: string | null;
  amount: string | null;
  gasUsed: string | null;
  gasFee: string | null;
  description: string | null;
  createdAt: string;
  gasBalance: string | null;
  gasBalanceInSui: string | null;
}

interface Balance {
  mist: string;
  sui: string;
  formatted: string;
}

interface Statistics {
  totalTransactions: number;
  gasTransfersReceived: number;
  certificatesIssued: number;
  templatesCreated: number;
  totalGasUsed: number;
  currentBalance: {
    id: number;
    address: string;
    balance: string;
    balanceInSui: string;
    transactionId: number;
    created_at: Date;
  } | null;
}

export function IssuerGasTracking() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance | null>(null);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch("/api/issuer/balance");
      const data = await response.json();

      if (data.success) {
        setBalance(data.balance);
      } else {
        toast.error("Failed to fetch balance");
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
      toast.error("Failed to fetch balance");
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("type", filter);
      }

      const response = await fetch(
        `/api/issuer/transactions?${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setTransactions(data.transactions);
        setStatistics(data.statistics);
      } else {
        toast.error("Failed to fetch transactions");
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to fetch transactions");
    }
  }, [filter]);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    await Promise.all([fetchBalance(), fetchTransactions()]);
    setIsLoading(false);
  }, [fetchBalance, fetchTransactions]);

  useEffect(() => {
    refreshData();
  }, [filter, refreshData]);

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchTerm) return true;
    return (
      tx.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.transactionType.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "default",
      pending: "secondary",
      failed: "destructive",
      cancelled: "outline",
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status}
      </Badge>
    );
  };

  const getTransactionTypeBadge = (type: string) => {
    const colors = {
      gas_transfer: "bg-green-100 text-green-800",
      template_creation: "bg-blue-100 text-blue-800",
      certificate_issuance: "bg-purple-100 text-purple-800",
      certificate_mint: "bg-orange-100 text-orange-800",
      issuer_approval: "bg-gray-100 text-gray-800",
      admin_operation: "bg-red-100 text-red-800",
    } as const;

    return (
      <Badge
        className={
          colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"
        }
      >
        {type.replace(/_/g, " ")}
      </Badge>
    );
  };

  const formatAmount = (
    amount: string | null,
    type: "SUI" | "MIST" = "SUI"
  ) => {
    if (!amount) return "N/A";

    if (type === "SUI") {
      const amountInSui = parseInt(amount) / 1_000_000_000;
      return `${amountInSui.toFixed(6)} SUI`;
    }

    return `${parseInt(amount).toLocaleString()} MIST`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Fuel className="h-6 w-6" />
            Gas Tracking & Balance
          </h2>
          <p className="text-gray-600">
            Monitor your gas usage and transaction history
          </p>
        </div>
        <Button onClick={refreshData} disabled={isLoading} size="sm">
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Balance Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Current Gas Balance
          </CardTitle>
          <CardDescription>
            Your current SUI balance for gas payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {balance ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">SUI Balance</p>
                <p className="text-2xl font-bold text-blue-600">
                  {balance.formatted}
                </p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">MIST Balance</p>
                <p className="text-xl font-semibold">
                  {parseInt(balance.mist).toLocaleString()}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">Status</p>
                <p className="text-lg font-semibold text-green-600">
                  {parseFloat(balance.sui) > 0.1 ? "Sufficient" : "Low Balance"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {balance && parseFloat(balance.sui) < 0.1 && (
            <Alert className="mt-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your gas balance is low. Contact admin for a gas transfer to
                continue issuing certificates.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-gray-600">Gas Received</p>
                  <p className="text-xl font-bold">
                    {statistics.gasTransfersReceived}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Gas Used</p>
                  <p className="text-xl font-bold">
                    {statistics.totalGasUsed.toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-gray-600">Total Transactions</p>
                  <p className="text-xl font-bold">
                    {statistics.totalTransactions}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-gray-600">Certificates Issued</p>
                  <p className="text-xl font-bold">
                    {statistics.certificatesIssued}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Transaction History
          </CardTitle>
          <CardDescription>
            All gas-related transactions and certificate operations
          </CardDescription>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="gas_transfer">Gas Transfers</SelectItem>
                <SelectItem value="template_creation">
                  Template Creation
                </SelectItem>
                <SelectItem value="certificate_issuance">
                  Certificate Issuance
                </SelectItem>
                <SelectItem value="certificate_mint">
                  Certificate Minting
                </SelectItem>
              </SelectContent>
            </Select>

            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-[300px]"
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTransactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        {getTransactionTypeBadge(tx.transactionType)}
                      </TableCell>
                      <TableCell>{getStatusBadge(tx.status)}</TableCell>
                      <TableCell>{formatAmount(tx.amount)}</TableCell>
                      <TableCell>
                        {tx.gasUsed ? formatAmount(tx.gasUsed, "MIST") : "N/A"}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {tx.description || "N/A"}
                      </TableCell>
                      <TableCell>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {tx.transactionHash && (
                          <Button variant="ghost" size="sm" asChild>
                            <a
                              href={`https://suiscan.xyz/devnet/tx/${tx.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
