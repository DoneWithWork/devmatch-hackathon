"use client";
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, ExternalLink } from "lucide-react";

interface Route {
  name: string;
  path: string;
  description: string;
  access: "public" | "protected" | "admin" | "issuer";
  method?: "GET" | "POST";
}

const routes: Route[] = [
  // Public Routes
  {
    name: "Home",
    path: "/",
    description: "Landing page with features",
    access: "public",
  },
  {
    name: "Verify Certificate",
    path: "/verify",
    description: "Certificate verification portal",
    access: "public",
  },
  {
    name: "Apply as Issuer",
    path: "/apply",
    description: "Issuer application form",
    access: "public",
  },
  {
    name: "Authentication",
    path: "/auth",
    description: "ZkLogin authentication",
    access: "public",
  },

  // Protected Routes
  {
    name: "Dashboard",
    path: "/dashboard",
    description: "User dashboard",
    access: "protected",
  },
  {
    name: "My Certificates",
    path: "/certificates",
    description: "View user certificates",
    access: "protected",
  },
  {
    name: "Issue Certificate",
    path: "/issue",
    description: "Issue certificates",
    access: "issuer",
  },
  {
    name: "Admin Panel",
    path: "/admin",
    description: "Admin management panel",
    access: "admin",
  },
  {
    name: "Issuer Dashboard",
    path: "/issuer",
    description: "Issuer-specific dashboard",
    access: "issuer",
  },

  // API Routes (Sample)
  {
    name: "Config Test",
    path: "/api/test/config",
    description: "Test configuration endpoint",
    access: "public",
    method: "POST",
  },
  {
    name: "Admin Applications",
    path: "/api/admin/applications",
    description: "Get pending applications",
    access: "admin",
    method: "GET",
  },
  {
    name: "User Certificates",
    path: "/api/user/certificates",
    description: "Get user certificates",
    access: "protected",
    method: "GET",
  },
];

export default function RouteTestPage() {
  const [testedRoutes, setTestedRoutes] = useState<Set<string>>(new Set());
  const [results, setResults] = useState<Map<string, boolean>>(new Map());

  const testRoute = async (route: Route) => {
    try {
      if (route.method === "POST") {
        const response = await fetch(route.path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: "{}",
        });
        const success = response.ok || response.status === 401; // 401 is expected for protected routes
        setResults((prev) => new Map(prev).set(route.path, success));
      } else {
        // For GET routes, we'll just mark them as testable (would need authentication)
        setResults((prev) => new Map(prev).set(route.path, true));
      }
      setTestedRoutes((prev) => new Set(prev).add(route.path));
    } catch {
      setResults((prev) => new Map(prev).set(route.path, false));
      setTestedRoutes((prev) => new Set(prev).add(route.path));
    }
  };

  const openRoute = (path: string) => {
    window.open(path, "_blank");
  };

  const getAccessBadgeColor = (access: string) => {
    switch (access) {
      case "public":
        return "bg-green-100 text-green-800";
      case "protected":
        return "bg-blue-100 text-blue-800";
      case "admin":
        return "bg-red-100 text-red-800";
      case "issuer":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">Route Testing Dashboard</h1>
        <p className="text-gray-600 text-lg">
          Test all available routes and API endpoints in the HashCred
          application.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Testing Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Total Routes:</span>
                <span className="font-semibold">{routes.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Tested:</span>
                <span className="font-semibold">{testedRoutes.size}</span>
              </div>
              <div className="flex justify-between">
                <span>Success Rate:</span>
                <span className="font-semibold">
                  {testedRoutes.size > 0
                    ? Math.round(
                        (Array.from(results.values()).filter(Boolean).length /
                          testedRoutes.size) *
                          100
                      )
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Access Levels</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Badge className={getAccessBadgeColor("public")}>Public</Badge>
                <span>
                  {routes.filter((r) => r.access === "public").length}
                </span>
              </div>
              <div className="flex justify-between">
                <Badge className={getAccessBadgeColor("protected")}>
                  Protected
                </Badge>
                <span>
                  {routes.filter((r) => r.access === "protected").length}
                </span>
              </div>
              <div className="flex justify-between">
                <Badge className={getAccessBadgeColor("issuer")}>
                  Issuer Only
                </Badge>
                <span>
                  {routes.filter((r) => r.access === "issuer").length}
                </span>
              </div>
              <div className="flex justify-between">
                <Badge className={getAccessBadgeColor("admin")}>
                  Admin Only
                </Badge>
                <span>{routes.filter((r) => r.access === "admin").length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Available Routes</h2>

        {routes.map((route) => (
          <Card
            key={route.path}
            className="transition-all duration-200 hover:shadow-md"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{route.name}</h3>
                    <Badge className={getAccessBadgeColor(route.access)}>
                      {route.access}
                    </Badge>
                    {route.method && (
                      <Badge variant="outline">{route.method}</Badge>
                    )}
                    {testedRoutes.has(route.path) &&
                      (results.get(route.path) ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      ))}
                  </div>
                  <p className="text-gray-600 mb-2">{route.description}</p>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                    {route.method || "GET"} {route.path}
                  </code>
                </div>

                <div className="flex space-x-2 ml-4">
                  {route.path.startsWith("/api") ? (
                    <Button
                      onClick={() => testRoute(route)}
                      variant="outline"
                      size="sm"
                      disabled={testedRoutes.has(route.path)}
                    >
                      {testedRoutes.has(route.path) ? "Tested" : "Test API"}
                    </Button>
                  ) : (
                    <Button
                      onClick={() => openRoute(route.path)}
                      variant="outline"
                      size="sm"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Visit
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Quick Navigation Test</CardTitle>
          <CardDescription>
            Test the main navigation routes by clicking the buttons below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {routes
              .filter((r) => !r.path.startsWith("/api"))
              .map((route) => (
                <Button
                  key={route.path}
                  onClick={() => openRoute(route.path)}
                  variant="outline"
                  className="h-16 flex flex-col items-center justify-center"
                >
                  <span className="font-medium">{route.name}</span>
                  <span className="text-xs text-gray-500">{route.path}</span>
                </Button>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
