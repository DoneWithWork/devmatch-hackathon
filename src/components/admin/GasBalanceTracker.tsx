"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface BalanceInfo {
  sui: number;
  mist: number;
  formatted: string;
}

export function GasBalanceTracker() {
  const [adminBalance, setAdminBalance] = useState<BalanceInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [adminAddress, setAdminAddress] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    // Get the dynamic admin address
    const fetchAdminAddress = async () => {
      try {
        const response = await fetch("/api/admin/address");
        if (response.ok) {
          const data = await response.json();
          setAdminAddress(data.adminAddress);
        } else {
          // Fallback to hardcoded address if API fails
          setAdminAddress(
            "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26"
          );
        }
      } catch (error) {
        console.error("Failed to fetch admin address:", error);
        // Fallback to hardcoded address
        setAdminAddress(
          "0xfba0b09a12c7a64fe9654c404271c678825a0e9ebdf91a6361b5305018058a26"
        );
      }
    };

    fetchAdminAddress();
  }, []);

  useEffect(() => {
    if (!mounted || !adminAddress) return;

    const loadBalance = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/balance?address=${adminAddress}`
        );
        if (response.ok) {
          const data = await response.json();
          setAdminBalance(data.balance);
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBalance();

    // Listen for gas balance refresh events from other components
    const handleRefreshGasBalance = () => {
      loadBalance();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("refreshGasBalance", handleRefreshGasBalance);
    }

    // Cleanup event listener
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "refreshGasBalance",
          handleRefreshGasBalance
        );
      }
    };
  }, [adminAddress, mounted]);

  const fetchBalance = async () => {
    if (!adminAddress) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/balance?address=${adminAddress}`
      );
      if (response.ok) {
        const data = await response.json();
        setAdminBalance(data.balance);
      }
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    } finally {
      setLoading(false);
    }
  };

  const startGasTracking = async () => {
    setTracking(true);
    await fetchBalance(); // Get starting balance

    // Auto-stop tracking after 30 seconds
    setTimeout(() => {
      setTracking(false);
    }, 30000);
  };

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Left Section: Balance Info */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="text-lg">💰</div>
              <div className="min-w-0">
                <h3 className="font-semibold text-sm text-gray-900">
                  Admin Balance
                </h3>
                {adminBalance ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-lg font-bold text-blue-600 break-words">
                      {adminBalance.sui.toFixed(2)} SUI
                    </span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {adminBalance.mist.toLocaleString()} MIST
                    </Badge>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm animate-pulse">
                    Loading...
                  </div>
                )}
              </div>
            </div>

            {/* Gas Estimates */}
            <div className="flex items-center gap-3 text-sm">
              <div className="text-amber-600">⚡</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="font-mono text-xs">
                  Approve: ~1.32M
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  Issue: ~6M
                </Badge>
              </div>
            </div>

            {/* Tracking Status */}
            {tracking && (
              <div className="flex items-center gap-2">
                <div className="text-green-600">🔍</div>
                <Badge
                  variant="outline"
                  className="text-green-700 border-green-300"
                >
                  Tracking Active
                </Badge>
              </div>
            )}
          </div>

          {/* Right Section: Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={startGasTracking}
              disabled={tracking}
              size="sm"
              variant={tracking ? "secondary" : "outline"}
              className="min-w-[100px]"
            >
              {tracking ? "Tracking..." : "Track Gas"}
            </Button>
            <Button
              onClick={fetchBalance}
              disabled={loading}
              size="sm"
              variant="outline"
              className="min-w-[90px]"
            >
              {loading ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        {/* Wallet Address - Collapsible on mobile */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Wallet:</span>
            <code className="ml-2 bg-gray-100 px-2 py-1 rounded font-mono break-all">
              {adminAddress}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
