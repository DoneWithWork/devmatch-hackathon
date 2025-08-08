import React from "react";
import AppNavbar from "@/components/AppNavbar";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="pt-16">{children}</main>
    </div>
  );
}
