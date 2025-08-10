"use client";

import { useState, useEffect } from "react";
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
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [adminAddress, setAdminAddress] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

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
          setLastUpdated(new Date());
        }
      } catch (error) {
        console.error("Failed to fetch balance:", error);
        setError("Failed to fetch balance");
      } finally {
        setLoading(false);
      }
    };

    const autoInitializeTracking = async () => {
      try {
        // Check if gas balance history exists for this address
        const historyResponse = await fetch(
          `/api/admin/gas-history?address=${adminAddress}`
        );

        if (historyResponse.ok) {
          const historyData = await historyResponse.json();

          // If no history records exist, automatically initialize
          if (!historyData.history || historyData.history.length === 0) {
            console.log("🔄 Auto-initializing gas balance tracking...");

            const initResponse = await fetch("/api/admin/init-gas-tracking", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                addresses: [adminAddress],
                forceRefresh: false,
              }),
            });

            if (initResponse.ok) {
              console.log("✅ Gas balance tracking auto-initialized");
            }
          }
        }
      } catch (error) {
        console.warn("⚠️ Auto-initialization check failed:", error);
      }
    };

    // Initial load
    loadBalance();
    autoInitializeTracking();

    // Set up Server-Sent Events for real-time balance updates
    const eventSource = new EventSource(
      `/api/admin/balance-update?address=${adminAddress}`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "balance_update" && data.address === adminAddress) {
          console.log("📡 Received balance update:", data);

          // Update balance from the real-time notification
          const suiBalance = parseFloat(data.balanceInSui);
          const mistBalance = parseInt(data.balance);

          setAdminBalance({
            sui: suiBalance,
            mist: mistBalance,
            formatted: `${suiBalance.toFixed(9)} SUI`,
          });
          setLastUpdated(new Date(data.timestamp));
        }
      } catch (error) {
        console.warn("⚠️ Failed to parse SSE data:", error);
      }
    };

    eventSource.onerror = (error) => {
      console.warn("⚠️ SSE connection error:", error);
      setError("Connection error - balance may not update in real-time");
    };

    // Listen for manual refresh events from other components
    const handleRefreshGasBalance = () => {
      loadBalance();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("refreshGasBalance", handleRefreshGasBalance);
    }

    // Cleanup
    return () => {
      eventSource.close();
      if (typeof window !== "undefined") {
        window.removeEventListener(
          "refreshGasBalance",
          handleRefreshGasBalance
        );
      }
    };
  }, [adminAddress, mounted]);

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

            {/* Auto-Update Status */}
            <div className="flex items-center gap-2">
              <div className="text-green-600">�</div>
              <Badge
                variant="outline"
                className="text-green-700 border-green-300"
              >
                Auto-Updating
              </Badge>
              {lastUpdated && (
                <span className="text-xs text-gray-500">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>

          {/* Right Section: Status Info */}
          <div className="flex items-center gap-2 shrink-0">
            {loading && (
              <Badge variant="secondary" className="animate-pulse">
                Updating...
              </Badge>
            )}
          </div>
        </div>

        {/* Wallet Address - Collapsible on mobile */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          {error && (
            <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
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
