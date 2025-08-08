"use client";
import { Features } from "@/components/landing/Features";
import { Footer } from "@/components/landing/Footer";
import { Hero } from "@/components/landing/Hero";
import AppNavbar from "@/components/AppNavbar";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div>
      <AppNavbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Hero />
        <Features />
        <Footer />
      </motion.div>
    </div>
  );
}
