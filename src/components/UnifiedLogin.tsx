"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { User, Shield, Building2, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginOption {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  route: string;
  loginMethod: "google" | "admin" | "issuer";
}

const loginOptions: LoginOption[] = [
  {
    id: "user",
    title: "User Login",
    description: "Access your certificates and verify credentials",
    icon: User,
    color: "from-blue-500 to-cyan-500",
    route: "/dashboard",
    loginMethod: "google",
  },
  {
    id: "issuer",
    title: "Issuer Login",
    description: "Create and manage certificate templates",
    icon: Building2,
    color: "from-green-500 to-emerald-500",
    route: "/issuer",
    loginMethod: "google",
  },
  {
    id: "admin",
    title: "Admin Login",
    description: "System administration and platform management",
    icon: Shield,
    color: "from-purple-500 to-violet-500",
    route: "/admin",
    loginMethod: "admin",
  },
];

export default function UnifiedLogin() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAdminLogin = async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/admin-login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ adminKey }),
      });

      const data = await response.json();

      if (data.success) {
        setIsOpen(false);
        router.push("/admin");
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.error("Admin login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleBasedLogin = async (option: LoginOption) => {
    setSelectedRole(option.id);

    if (option.loginMethod === "google") {
      // Store intended destination and role in localStorage
      localStorage.setItem(
        "login_intent",
        JSON.stringify({
          role: option.id,
          route: option.route,
          timestamp: Date.now(),
        })
      );

      // Trigger Google OAuth flow
      // The auth callback will handle role assignment based on stored intent
      setIsOpen(false);
    } else if (option.loginMethod === "admin") {
      // Keep dialog open for admin key input
      return;
    }
  };

  const renderLoginContent = () => {
    const selectedOption = loginOptions.find((opt) => opt.id === selectedRole);

    if (selectedRole === "admin") {
      return (
        <div className="space-y-4">
          <div className="text-center mb-4">
            <div
              className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${selectedOption?.color} mb-3`}
            >
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold">Admin Authentication</h3>
            <p className="text-sm text-gray-600">
              Enter your admin key to continue
            </p>
          </div>

          <div className="space-y-3">
            <Input
              type="password"
              placeholder="Admin Key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              className="w-full"
            />

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <Button
              onClick={handleAdminLogin}
              disabled={isLoading || !adminKey}
              className="w-full"
            >
              {isLoading ? "Authenticating..." : "Login as Admin"}
            </Button>

            <div className="text-xs text-gray-500 text-center space-y-1">
              <p>
                Development key: <code>admin123</code>
              </p>
              <p>Or set ADMIN_LOGIN_KEY in environment</p>
            </div>
          </div>

          <Button
            variant="ghost"
            onClick={() => setSelectedRole(null)}
            className="w-full"
          >
            ← Back to Role Selection
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Choose Your Role</h3>
          <p className="text-sm text-gray-600">
            Select how you want to access HashCred
          </p>
        </div>

        <div className="grid gap-3">
          {loginOptions.map((option) => (
            <div
              key={option.id}
              onClick={() => handleRoleBasedLogin(option)}
              className="group cursor-pointer"
            >
              <div className="flex items-center p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200">
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-r ${option.color} mr-4`}
                >
                  <option.icon className="w-6 h-6 text-white" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {option.title}
                    </h4>
                    {option.id === "admin" && (
                      <Badge variant="secondary" className="text-xs">
                        Key Required
                      </Badge>
                    )}
                    {option.id !== "admin" && (
                      <Badge variant="outline" className="text-xs">
                        Google OAuth
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{option.description}</p>
                </div>

                <LogIn className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-gray-500 text-center">
          <p>
            New to HashCred? You&apos;ll be automatically registered after
            login.
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          size="lg"
          className="px-6 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <LogIn className="h-5 w-5 mr-2" />
          Login to HashCred
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Access HashCred Platform</DialogTitle>
          <DialogDescription>
            Choose your role to access the appropriate dashboard
          </DialogDescription>
        </DialogHeader>

        {renderLoginContent()}
      </DialogContent>
    </Dialog>
  );
}
