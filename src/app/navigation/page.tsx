import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Award, Send, Search, Users, Settings, BookOpen } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🏆 HashCred Dashboard
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Navigate to all platform features and test the certificate system
          </p>
          <Badge variant="outline" className="text-lg px-6 py-2">
            Template-Based Certificate System
          </Badge>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Test Certificate Issuance */}
          <Card className="hover:shadow-lg transition-shadow border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Send className="h-6 w-6 text-green-600" />
                <CardTitle className="text-green-800">
                  Test Certificate Issuance
                </CardTitle>
              </div>
              <CardDescription>
                Try the template-based certificate system without authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                • Select from 6 predefined templates
                <br />
                • Auto-filled metadata
                <br />
                • No authentication required
                <br />• Perfect for testing
              </p>
              <Link href="/test-issue">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  Test Issue Certificates
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Certificate Verification */}
          <Card className="hover:shadow-lg transition-shadow border-blue-200 bg-blue-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Search className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-blue-800">
                  Certificate Verification
                </CardTitle>
              </div>
              <CardDescription>
                Verify and view certificates by blockchain address
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                • Enter certificate ID
                <br />
                • View beautiful certificate design
                <br />
                • Blockchain verification
                <br />• Public access
              </p>
              <Link href="/verify-cert">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Verify Certificate
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Official Issuer Portal */}
          <Card className="hover:shadow-lg transition-shadow border-purple-200 bg-purple-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-purple-800">Issuer Portal</CardTitle>
              </div>
              <CardDescription>
                Official certificate issuance for approved issuers
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                • Requires issuer authentication
                <br />
                • Full dashboard access
                <br />
                • Template management
                <br />• Professional features
              </p>
              <Link href="/issuer">
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  Issuer Portal
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Authentication */}
          <Card className="hover:shadow-lg transition-shadow border-orange-200 bg-orange-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-6 w-6 text-orange-600" />
                <CardTitle className="text-orange-800">
                  User Authentication
                </CardTitle>
              </div>
              <CardDescription>
                Login or register to access your certificates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                • Google OAuth login
                <br />
                • View your certificates
                <br />
                • Manage profile
                <br />• Download certificates
              </p>
              <Link href="/auth">
                <Button className="w-full bg-orange-600 hover:bg-orange-700">
                  Login / Register
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Apply to be Issuer */}
          <Card className="hover:shadow-lg transition-shadow border-indigo-200 bg-indigo-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-indigo-600" />
                <CardTitle className="text-indigo-800">
                  Become an Issuer
                </CardTitle>
              </div>
              <CardDescription>
                Apply to become a verified certificate issuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                • Submit application
                <br />
                • Document verification
                <br />
                • Admin approval process
                <br />• Issue official certificates
              </p>
              <Link href="/apply">
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Apply to Issue
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Admin Panel */}
          <Card className="hover:shadow-lg transition-shadow border-red-200 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="h-6 w-6 text-red-600" />
                <CardTitle className="text-red-800">Admin Panel</CardTitle>
              </div>
              <CardDescription>
                Administrative functions and system management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                • Approve issuer applications
                <br />
                • System monitoring
                <br />
                • Gas management
                <br />• Platform administration
              </p>
              <Link href="/admin">
                <Button className="w-full bg-red-600 hover:bg-red-700">
                  Admin Panel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Test Flow */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🧪 Quick Test Flow
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
              <Badge variant="outline" className="text-sm px-3 py-1">
                1
              </Badge>
              <span className="text-sm">Test certificate issuance</span>
              <span>→</span>
              <Badge variant="outline" className="text-sm px-3 py-1">
                2
              </Badge>
              <span className="text-sm">Copy certificate ID</span>
              <span>→</span>
              <Badge variant="outline" className="text-sm px-3 py-1">
                3
              </Badge>
              <span className="text-sm">Verify the certificate</span>
            </div>
            <div className="flex justify-center gap-4">
              <Link href="/test-issue">
                <Button size="lg" className="bg-green-600 hover:bg-green-700">
                  Start Testing
                </Button>
              </Link>
              <Link href="/verify-cert">
                <Button size="lg" variant="outline">
                  Verify Certificate
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Template Features */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            📋 Available Templates
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-2">🎓</div>
              <h3 className="text-lg font-semibold mb-2">Course Completion</h3>
              <p className="text-sm text-gray-600">
                Pre-filled with course fields, duration, grade
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="text-lg font-semibold mb-2">Achievement Award</h3>
              <p className="text-sm text-gray-600">
                Recognition certificates with performance levels
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-2">🎪</div>
              <h3 className="text-lg font-semibold mb-2">Participation</h3>
              <p className="text-sm text-gray-600">
                Event participation with role and hours
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-2">📚</div>
              <h3 className="text-lg font-semibold mb-2">
                Training Certificate
              </h3>
              <p className="text-sm text-gray-600">
                Professional training completion certificates
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-2">💪</div>
              <h3 className="text-lg font-semibold mb-2">
                Skill Certification
              </h3>
              <p className="text-sm text-gray-600">
                Skill proficiency with assessment details
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-3xl mb-2">🎨</div>
              <h3 className="text-lg font-semibold mb-2">Custom Certificate</h3>
              <p className="text-sm text-gray-600">
                Fully customizable for unique requirements
              </p>
            </div>
          </div>
        </div>

        {/* Back to Landing */}
        <div className="mt-16 text-center">
          <Link href="/">
            <Button variant="outline" size="lg">
              ← Back to Landing Page
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
