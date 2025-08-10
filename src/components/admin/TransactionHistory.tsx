"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

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
  metadata: Record<string, unknown> | null;
  userId: number | null;
  createdAt: string;
}

interface GasBalanceRecord {
  id: number;
  address: string;
  balance: string;
  balanceInSui: string | null;
  createdAt: string;
  transaction?: Transaction;
}

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [gasHistory, setGasHistory] = useState<GasBalanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [activeTab, setActiveTab] = useState<"transactions" | "gas_history">(
    "transactions"
  );

  useEffect(() => {
    fetchTransactionData();
  }, []);

  const fetchTransactionData = async () => {
    setLoading(true);
    try {
      const [transactionsRes, gasHistoryRes] = await Promise.all([
        fetch("/api/admin/transactions"),
        fetch("/api/admin/gas-history"),
      ]);

      if (transactionsRes.ok) {
        const transData = await transactionsRes.json();
        setTransactions(transData.transactions || []);
      }

      if (gasHistoryRes.ok) {
        const gasData = await gasHistoryRes.json();
        setGasHistory(gasData.gasHistory || []);
      }
    } catch (error) {
      console.error("Failed to fetch transaction data:", error);
      // Set mock data for demonstration
      setTransactions([
        {
          id: 1,
          transactionHash: "6M47z8uWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q",
          transactionType: "template_creation",
          status: "success",
          fromAddress:
            "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
          toAddress: null,
          amount: null,
          gasUsed: "8000000",
          gasFee: "8000",
          description:
            "Created certificate template: Blockchain Development Bootcamp",
          metadata: {
            templateId:
              "0xe21db89af54ce771839a3b2906a0507f749f0448fdc45593ad579b68b4fdbf0d",
          },
          userId: 1,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          transactionHash: "8R56k9xWvuPh4AJkXnfa48LRVYFC87ysXkvSDTtAMy7q",
          transactionType: "gas_transfer",
          status: "success",
          fromAddress:
            "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
          toAddress:
            "0x9d386777d50c71d3155a348ada82e30a7b07b3a489c0ca7d96cb848cd4c83c8d",
          amount: "100000000",
          gasUsed: "1000000",
          gasFee: "1000",
          description: "Gas transfer to issuer wallet",
          metadata: { reason: "issuer_funding" },
          userId: 2,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);

      setGasHistory([
        {
          id: 1,
          address:
            "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
          balance: "19850000000",
          balanceInSui: "19.85",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          address:
            "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26",
          balance: "19950000000",
          balanceInSui: "19.95",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      success: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-800",
    };
    return variants[status as keyof typeof variants] || variants.pending;
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      gas_transfer: "bg-blue-100 text-blue-800",
      template_creation: "bg-purple-100 text-purple-800",
      certificate_issuance: "bg-green-100 text-green-800",
      certificate_mint: "bg-orange-100 text-orange-800",
      issuer_approval: "bg-indigo-100 text-indigo-800",
      admin_operation: "bg-gray-100 text-gray-800",
    };
    return variants[type as keyof typeof variants] || variants.admin_operation;
  };

  const formatAddress = (address: string | null) => {
    if (!address) return "N/A";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatAmount = (amount: string | null, suffix = "MIST") => {
    if (!amount) return "N/A";
    const num = parseInt(amount);
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(2)} SUI`;
    }
    return `${(num / 1000000).toFixed(2)}M ${suffix}`;
  };

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      !searchTerm ||
      tx.transactionHash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || tx.status === statusFilter;
    const matchesType =
      typeFilter === "all" || tx.transactionType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Transaction History</h2>
          <p className="text-gray-600">
            Monitor gas usage and transaction activity
          </p>
        </div>
        <Button onClick={fetchTransactionData} disabled={loading}>
          <RefreshCw
            className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "transactions"
              ? "bg-white shadow-sm font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Activity className="h-4 w-4 inline mr-2" />
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("gas_history")}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeTab === "gas_history"
              ? "bg-white shadow-sm font-medium"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <TrendingUp className="h-4 w-4 inline mr-2" />
          Gas Balance History
        </button>
      </div>

      {/* Filters */}
      {activeTab === "transactions" && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-1">
            <Input
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="success">Success</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="gas_transfer">Gas Transfer</SelectItem>
              <SelectItem value="template_creation">
                Template Creation
              </SelectItem>
              <SelectItem value="certificate_issuance">
                Certificate Issuance
              </SelectItem>
              <SelectItem value="certificate_mint">Certificate Mint</SelectItem>
              <SelectItem value="issuer_approval">Issuer Approval</SelectItem>
              <SelectItem value="admin_operation">Admin Operation</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Content */}
      <Card>
        <CardContent className="p-0">
          {activeTab === "transactions" ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>From/To</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gas Used</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-8 text-gray-500"
                      >
                        No transactions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {tx.transactionHash ? (
                            <div className="flex items-center space-x-2">
                              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                {formatAddress(tx.transactionHash)}
                              </code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  window.open(
                                    `https://explorer.sui.io/txblock/${tx.transactionHash}?network=devnet`,
                                    "_blank"
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400">Pending</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getTypeBadge(tx.transactionType)}>
                            {tx.transactionType.replace("_", " ")}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusBadge(tx.status)}>
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {tx.fromAddress && (
                              <div className="flex items-center text-xs">
                                <ArrowUpRight className="h-3 w-3 mr-1 text-red-500" />
                                <code>{formatAddress(tx.fromAddress)}</code>
                              </div>
                            )}
                            {tx.toAddress && (
                              <div className="flex items-center text-xs">
                                <ArrowDownLeft className="h-3 w-3 mr-1 text-green-500" />
                                <code>{formatAddress(tx.toAddress)}</code>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {tx.amount ? formatAmount(tx.amount) : "N/A"}
                        </TableCell>
                        <TableCell>
                          {tx.gasUsed
                            ? formatAmount(tx.gasUsed, "MIST")
                            : "N/A"}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {tx.description || "N/A"}
                        </TableCell>
                        <TableCell>
                          {new Date(tx.createdAt).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Balance (MIST)</TableHead>
                    <TableHead>Balance (SUI)</TableHead>
                    <TableHead>Change</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
                        Loading gas history...
                      </TableCell>
                    </TableRow>
                  ) : gasHistory.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center py-8 text-gray-500"
                      >
                        No gas history found
                      </TableCell>
                    </TableRow>
                  ) : (
                    gasHistory.map((record, index) => {
                      const prevRecord = gasHistory[index + 1];
                      const change = prevRecord
                        ? parseInt(record.balance) -
                          parseInt(prevRecord.balance)
                        : 0;

                      return (
                        <TableRow key={record.id}>
                          <TableCell>
                            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {formatAddress(record.address)}
                            </code>
                          </TableCell>
                          <TableCell>
                            {formatAmount(record.balance, "MIST")}
                          </TableCell>
                          <TableCell>
                            {record.balanceInSui || "N/A"} SUI
                          </TableCell>
                          <TableCell>
                            {change !== 0 && (
                              <div
                                className={`flex items-center ${
                                  change > 0 ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {change > 0 ? (
                                  <TrendingUp className="h-3 w-3 mr-1" />
                                ) : (
                                  <TrendingDown className="h-3 w-3 mr-1" />
                                )}
                                {change > 0 ? "+" : ""}
                                {formatAmount(change.toString(), "MIST")}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {new Date(record.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
