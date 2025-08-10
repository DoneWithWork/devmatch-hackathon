"use client";

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
  CheckCircle,
  Mail,
  Wallet,
  Users,
  FileText,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function IssuerInfoPage() {
  const router = useRouter();

  const steps = [
    {
      step: 1,
      title: "Apply as Issuer",
      description: "Submit your organization details and domain verification",
      icon: FileText,
      status: "Apply",
      action: () => router.push("/apply"),
    },
    {
      step: 2,
      title: "Admin Approval",
      description: "Wait for admin review and blockchain setup",
      icon: Users,
      status: "Pending",
      action: null,
    },
    {
      step: 3,
      title: "Login as Issuer",
      description: "Use your registered email and wallet address to log in",
      icon: Shield,
      status: "Login",
      action: () => router.push("/issuer-login"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="container mx-auto max-w-4xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Become a Credential Issuer
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Join our platform to issue verifiable certificates and credentials
          </p>
          <Badge variant="outline" className="text-lg px-4 py-2">
            <CheckCircle className="mr-2 h-5 w-5 text-green-500" />
            Blockchain-Verified Credentials
          </Badge>
        </div>

        {/* Process Steps */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {steps.map((step) => (
            <Card key={step.step} className="relative overflow-hidden">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 rounded-full bg-blue-100">
                  <step.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {step.step}
                </div>
                <CardTitle className="text-xl">{step.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {step.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                {step.action && (
                  <Button
                    onClick={step.action}
                    className="w-full"
                    variant={step.step === 3 ? "default" : "outline"}
                  >
                    {step.status}
                  </Button>
                )}
                {!step.action && (
                  <Badge variant="secondary" className="w-full py-2">
                    {step.status}
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Existing Issuers Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Already an Approved Issuer?
            </CardTitle>
            <CardDescription>
              If you&apos;ve already been approved as an issuer, you can log in
              with your credentials
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Mail className="h-4 w-4 text-gray-500" />
                  Email Address
                </h4>
                <p className="text-sm text-gray-600">
                  Use the same email address you provided when applying as an
                  issuer
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-gray-500" />
                  Wallet Address
                </h4>
                <p className="text-sm text-gray-600">
                  Enter the Sui wallet address from your original application
                </p>
              </div>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => router.push("/issuer-login")}
                className="w-full md:w-auto"
                size="lg"
              >
                Login as Issuer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Features for Issuers */}
        <Card>
          <CardHeader>
            <CardTitle>What You Can Do as an Issuer</CardTitle>
            <CardDescription>
              Access powerful tools to manage and issue verifiable credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-700">
                  Issue Certificates
                </h4>
                <p className="text-sm text-gray-600">
                  Create and issue blockchain-verified certificates to
                  recipients
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-700">
                  Manage Templates
                </h4>
                <p className="text-sm text-gray-600">
                  Create reusable certificate templates for your organization
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-purple-700">
                  Track Analytics
                </h4>
                <p className="text-sm text-gray-600">
                  Monitor certificate issuance and verification metrics
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-orange-700">
                  Gas Management
                </h4>
                <p className="text-sm text-gray-600">
                  Receive gas transfers from admin for blockchain transactions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="text-center mt-12">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="mr-4"
          >
            Back to Home
          </Button>
          <Button onClick={() => router.push("/test")}>Test All Routes</Button>
        </div>
      </div>
    </div>
  );
}
