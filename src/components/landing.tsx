"use client";
import { Footer } from "@/components/landing/Footer";
import { motion } from "framer-motion";
import { ReactNode } from "react";
export default function Landing({ children }: { children?: ReactNode }) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="glass-container"
      >
        <div>{children}</div>
        <Footer />
      </motion.div>
    </div>
  );
}
