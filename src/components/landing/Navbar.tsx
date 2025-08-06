import React, { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Menu, X, Wallet, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import GoogleLogin from "../GoogleLogin";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = usePathname();

  const navItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "Issue Certificate", path: "/issue" },
    { name: "Verify Certificate", path: "/verify" },
  ];

  const handleZkLogin = () => {
    // Simulate ZkLogin authentication
    setIsLoggedIn(true);
    alert("ZkLogin authentication successful!");
  };

  const handleConnectWallet = () => {
    // Simulate wallet connection
    setIsConnected(true);
    alert("Wallet connected successfully!");
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
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === item.path
                    ? "bg-white/20 text-blue-700 backdrop-blur-sm"
                    : "text-gray-700 hover:bg-white/10 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <GoogleLogin />
            ) : (
              <div className="flex items-center space-x-3">
                {!isConnected ? (
                  <button
                    onClick={handleConnectWallet}
                    className="px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 font-medium hover:bg-white/30 transition-all duration-200"
                  >
                    <Wallet className="h-4 w-4 inline mr-2" />
                    Connect Wallet
                  </button>
                ) : (
                  <div className="px-4 py-2 rounded-lg bg-green-100/50 backdrop-blur-sm border border-green-200/50 text-green-700 font-medium">
                    <div className="h-2 w-2 bg-green-500 rounded-full inline-block mr-2"></div>
                    Connected
                  </div>
                )}
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
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location === item.path
                    ? "bg-white/20 text-blue-700 backdrop-blur-sm"
                    : "text-gray-700 hover:bg-white/10 hover:text-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="pt-4 space-y-2">
              {!isLoggedIn ? (
                <button
                  onClick={handleZkLogin}
                  className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium"
                >
                  <User className="h-4 w-4 inline mr-2" />
                  ZkLogin
                </button>
              ) : (
                <button
                  onClick={handleConnectWallet}
                  className="w-full px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 font-medium"
                >
                  <Wallet className="h-4 w-4 inline mr-2" />
                  {isConnected ? "Wallet Connected" : "Connect Wallet"}
                </button>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};

export default Navbar;
