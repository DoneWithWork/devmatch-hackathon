"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Shield,
  Menu,
  X,
  User,
  Settings,
  LogOut,
  FileText,
  Award,
  CheckSquare,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import GoogleLogin from "./GoogleLogin";

interface NavItem {
  name: string;
  path: string;
  icon?: React.ComponentType<{ className?: string }>;
  roles?: string[];
}

const AppNavbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<{ role?: string; isLoggedIn: boolean }>({
    isLoggedIn: false,
  });
  const location = usePathname();
  const router = useRouter();

  // Check authentication status
  useEffect(() => {
    // This would typically check session status
    // For now, we'll simulate based on current path
    const isAuthenticatedPath =
      location.includes("/dashboard") ||
      location.includes("/admin") ||
      location.includes("/issuer");
    if (isAuthenticatedPath) {
      setUser({ role: "user", isLoggedIn: true });
    }
  }, [location]);

  const navItems: NavItem[] = [
    { name: "Home", path: "/", icon: Shield },
    { name: "Verify Certificate", path: "/verify", icon: CheckSquare },
    // Authenticated user items
    ...(user.isLoggedIn
      ? [
          {
            name: "Dashboard",
            path: "/dashboard",
            icon: User,
            roles: ["user", "issuer", "admin"],
          },
          {
            name: "My Certificates",
            path: "/certificates",
            icon: Award,
            roles: ["user", "issuer", "admin"],
          },
          {
            name: "Issue Certificate",
            path: "/issue",
            icon: FileText,
            roles: ["issuer", "admin"],
          },
          {
            name: "Apply as Issuer",
            path: "/apply",
            icon: FileText,
            roles: ["user"],
          },
          {
            name: "Admin Panel",
            path: "/admin",
            icon: Settings,
            roles: ["admin"],
          },
          {
            name: "Test Routes",
            path: "/test",
            icon: Settings,
            roles: ["admin"],
          },
        ]
      : [
          { name: "Apply as Issuer", path: "/apply", icon: FileText },
          { name: "Test Routes", path: "/test", icon: Settings },
        ]),
  ];

  const filteredNavItems =
    user.isLoggedIn && user.role
      ? navItems.filter(
          (item) => !item.roles || item.roles.includes(user.role!)
        )
      : navItems.filter((item) => !item.roles);

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/delete", {
        method: "POST",
      });
      if (response.ok) {
        setUser({ isLoggedIn: false });
        router.push("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              HashCred
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === item.path
                    ? "bg-white/20 text-blue-700 backdrop-blur-sm"
                    : "text-gray-700 hover:bg-white/10 hover:text-blue-600"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!user.isLoggedIn ? (
              <GoogleLogin />
            ) : (
              <div className="flex items-center space-x-3">
                <div className="flex items-center px-4 py-2 rounded-lg bg-green-100/50 backdrop-blur-sm border border-green-200/50 text-green-700 font-medium">
                  <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                  Connected
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 rounded-lg bg-red-100/50 backdrop-blur-sm border border-red-200/50 text-red-700 font-medium hover:bg-red-200/50 transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 space-y-2"
          >
            {filteredNavItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === item.path
                    ? "bg-white/20 text-blue-700 backdrop-blur-sm"
                    : "text-gray-700 hover:bg-white/10 hover:text-blue-600"
                }`}
              >
                {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2 border-t border-white/20">
              {!user.isLoggedIn ? (
                <GoogleLogin />
              ) : (
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-4 py-2 rounded-lg bg-red-100/50 backdrop-blur-sm border border-red-200/50 text-red-700 font-medium"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default AppNavbar;
