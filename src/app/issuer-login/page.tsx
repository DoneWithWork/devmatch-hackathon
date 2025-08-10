"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Building2, Mail, Wallet } from "lucide-react";
import { toast } from "sonner";
import GoogleLogin from "@/components/GoogleLogin";
import { Separator } from "@/components/ui/separator";

export default function IssuerLoginPage() {
  const [email, setEmail] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!email || !walletAddress) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    // Basic wallet address validation
    if (!walletAddress.startsWith("0x") || walletAddress.length !== 66) {
      setError("Please enter a valid Sui wallet address");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/issuer-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          walletAddress: walletAddress.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Login failed");
        return;
      }

      toast.success("Successfully logged in as issuer!");
      router.push("/issuer");
    } catch (error) {
      console.error("Login error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100">
            <Building2 className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Issuer Login
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your issuer dashboard with your registered credentials
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your-email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="wallet"
                className="text-sm font-medium text-gray-700"
              >
                Wallet Address
              </Label>
              <div className="relative">
                <Wallet className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="wallet"
                  type="text"
                  placeholder="0x..."
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
                  disabled={isLoading}
                  required
                />
              </div>
              <p className="text-xs text-gray-500">
                Enter the same wallet address you used when applying to become
                an issuer
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In as Issuer"
              )}
            </Button>
          </form>

          {/* Alternative login method */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin />
          </div>

          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Need to become an issuer?{" "}
              <button
                onClick={() => router.push("/apply")}
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
              >
                Apply here
              </button>
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Not an issuer?{" "}
              <button
                onClick={() => router.push("/")}
                className="text-blue-600 hover:text-blue-700 font-medium underline-offset-4 hover:underline"
              >
                Back to Home
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
