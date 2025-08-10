import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WalletConnectProps {
  onConnect?: (address: string) => void;
  className?: string;
}

export default function WalletConnect({
  onConnect,
  className,
}: WalletConnectProps) {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkConnectionOnMount = async () => {
      if (typeof window === "undefined" || !window.suiWallet) {
        return;
      }

      try {
        const accounts = await window.suiWallet.getAccounts();
        if (accounts.length > 0) {
          setConnected(true);
          setAddress(accounts[0]);
          onConnect?.(accounts[0]);
        }
      } catch {
        console.log("No wallet connection found");
      }
    };

    checkConnectionOnMount();
  }, [onConnect]);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.suiWallet) {
      toast.error(
        "SUI Wallet not detected. Please install Sui Wallet browser extension."
      );
      return;
    }

    setLoading(true);
    try {
      await window.suiWallet.connect();
      const accounts = await window.suiWallet.getAccounts();

      if (accounts.length > 0) {
        setConnected(true);
        setAddress(accounts[0]);
        onConnect?.(accounts[0]);
        toast.success("Wallet connected successfully!");
      }
    } catch (error) {
      console.error("Wallet connection failed:", error);
      toast.error("Failed to connect wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const disconnectWallet = async () => {
    if (typeof window === "undefined" || !window.suiWallet) {
      return;
    }

    try {
      await window.suiWallet.disconnect();
      setConnected(false);
      setAddress("");
      toast.info("Wallet disconnected");
    } catch (error) {
      console.error("Disconnect failed:", error);
    }
  };

  if (connected) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="text-sm text-muted-foreground">
          Connected: {address.slice(0, 6)}...{address.slice(-4)}
        </div>
        <Button variant="outline" size="sm" onClick={disconnectWallet}>
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={connectWallet}
      disabled={loading}
      className={className}
      variant="outline"
    >
      {loading ? "Connecting..." : "Connect Wallet"}
    </Button>
  );
}
