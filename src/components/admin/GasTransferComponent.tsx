"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Send,
  Wallet,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  Fuel,
} from "lucide-react";

interface GasTransferProps {
  currentBalance?: {
    sui: number;
    mist: number;
    formatted: string;
  };
  issuerAddress?: string;
  onTransferComplete?: () => void;
}

export function GasTransferComponent({
  currentBalance,
  issuerAddress,
  onTransferComplete,
}: GasTransferProps) {
  const [recipientAddress, setRecipientAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [amountType, setAmountType] = useState<"sui" | "mist">("sui");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    transactionHash?: string;
  } | null>(null);

  const handleTransfer = async () => {
    if (!recipientAddress || !amount) {
      setResult({
        success: false,
        message: "Please provide recipient address and amount",
      });
      return;
    }

    // Validate address format
    if (!recipientAddress.startsWith("0x") || recipientAddress.length !== 66) {
      setResult({
        success: false,
        message: "Invalid Sui address format",
      });
      return;
    }

    // Validate amount
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setResult({
        success: false,
        message: "Invalid amount",
      });
      return;
    }

    // Check if sufficient balance
    if (currentBalance) {
      const requiredMist =
        amountType === "sui" ? numAmount * 1000000000 : numAmount;
      if (requiredMist > currentBalance.mist) {
        setResult({
          success: false,
          message: "Insufficient balance",
        });
        return;
      }
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/admin/transfer-gas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientAddress,
          amount:
            amountType === "sui" ? (numAmount * 1000000000).toString() : amount,
          amountType,
          description: `Gas transfer to issuer: ${recipientAddress.slice(
            0,
            8
          )}...`,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message || "Transfer completed successfully",
          transactionHash: data.transactionHash,
        });

        // Reset form
        setRecipientAddress("");
        setAmount("");

        // Notify parent component
        if (onTransferComplete) {
          onTransferComplete();
        }
      } else {
        setResult({
          success: false,
          message: data.error || "Transfer failed",
        });
      }
    } catch (error) {
      console.error("Transfer error:", error);
      setResult({
        success: false,
        message: "Network error. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const convertAmount = (
    value: string,
    fromType: "sui" | "mist",
    toType: "sui" | "mist"
  ) => {
    const num = parseFloat(value);
    if (isNaN(num)) return "";

    if (fromType === "sui" && toType === "mist") {
      return (num * 1000000000).toFixed(0);
    } else if (fromType === "mist" && toType === "sui") {
      return (num / 1000000000).toFixed(9);
    }
    return value;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Fuel className="h-5 w-5 mr-2" />
          Gas Transfer
        </CardTitle>
        <CardDescription>
          Transfer SUI tokens to issuer wallets for transaction fees
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Balance Display */}
        {currentBalance && (
          <div className="p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-blue-600" />
                <span className="font-medium">Admin Balance</span>
              </div>
              <div className="text-right">
                <div className="font-semibold text-lg">
                  {currentBalance.formatted}
                </div>
                <div className="text-sm text-gray-600">
                  {currentBalance.mist.toLocaleString()} MIST
                </div>
              </div>
            </div>
            {issuerAddress && (
              <div className="mt-2 text-sm text-gray-600">
                <span className="font-medium">From:</span>{" "}
                {formatAddress(issuerAddress)}
              </div>
            )}
          </div>
        )}

        {/* Transfer Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient">Recipient Address</Label>
            <Input
              id="recipient"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step={amountType === "sui" ? "0.001" : "1"}
                min="0"
                placeholder={amountType === "sui" ? "0.1" : "100000000"}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Unit</Label>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant={amountType === "sui" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmountType("sui")}
                  className="flex-1"
                >
                  SUI
                </Button>
                <Button
                  type="button"
                  variant={amountType === "mist" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAmountType("mist")}
                  className="flex-1"
                >
                  MIST
                </Button>
              </div>
            </div>
          </div>

          {/* Amount Conversion Display */}
          {amount && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Conversion:</span>
                <div className="mt-1">
                  {amountType === "sui" ? (
                    <>
                      {amount} SUI = {convertAmount(amount, "sui", "mist")} MIST
                    </>
                  ) : (
                    <>
                      {amount} MIST = {convertAmount(amount, "mist", "sui")} SUI
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result Display */}
        {result && (
          <Alert
            className={
              result.success
                ? "border-green-200 bg-green-50"
                : "border-red-200 bg-red-50"
            }
          >
            <div className="flex items-start">
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              )}
              <div className="ml-3 flex-1">
                <AlertDescription
                  className={result.success ? "text-green-800" : "text-red-800"}
                >
                  {result.message}
                </AlertDescription>
                {result.transactionHash && (
                  <div className="mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://explorer.sui.io/txblock/${result.transactionHash}?network=devnet`,
                          "_blank"
                        )
                      }
                      className="text-green-700 hover:text-green-800"
                    >
                      View Transaction <Send className="h-3 w-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </Alert>
        )}

        {/* Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Gas Transfer Guidelines:</strong>
            <ul className="mt-2 space-y-1 text-sm">
              <li>• Minimum recommended transfer: 0.1 SUI (100M MIST)</li>
              <li>• Template creation costs ~8M MIST</li>
              <li>• Certificate issuance costs ~6M MIST</li>
              <li>• Certificate minting costs ~3.5M MIST</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Transfer Button */}
        <Button
          onClick={handleTransfer}
          disabled={loading || !recipientAddress || !amount}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing Transfer...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Transfer Gas
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
