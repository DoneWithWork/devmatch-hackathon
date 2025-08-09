import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { extractRouterConfig } from "uploadthing/server";
import { ourFileRouter } from "./api/uploadthing/core";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HashCred",
  description:
    "HashCred is a privacy-first Web3 certification platform built on the SUI blockchain that enables educational institutions and legitimate authorities to issue verifiable, tamper-proof certificates. Using zkLogin zero-knowledge authentication, users can prove their identity without exposing personal data, while employers can instantly verify credentials through a unified, public, and interoperable system. The platform combines Next.js 15, Drizzle ORM, and Layer 1 SUI smart contracts to deliver an open-source, modular, and transparent framework that solves the fragmentation, complexity, and trust issues in modern certificate verification.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="./favicon.ico" sizes="any" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="glass-container min-h-screen">{children}</div>
        <Toaster />
        <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
      </body>
    </html>
  );
}
