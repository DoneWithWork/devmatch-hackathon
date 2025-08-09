"use client";
import { motion } from "framer-motion";
import { ReactNode } from "react";

export default function Deco({ children }: { children: ReactNode }) {
  return (
    <div className="w-full">
      <div className="absolute inset-0 overflow-hidden -z-1 bg-transparent pointer-events-none">
        <motion.div
          animate={{
            y: [0, 10, 0],
            x: [0, 0, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-[30%] w-32 h-32 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-400/20 backdrop-blur-sm -z-10"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            rotate: [0, -5, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-40 right-20 w-32 h-32 rounded-full bg-gradient-to-r from-purple-400/20 to-yellow-400/20 backdrop-blur-sm"
        />
        <motion.div
          animate={{
            y: [0, -15, 0],
            x: [0, 10, 0],
          }}
          transition={{
            duration: 7,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-20 left-1/4 w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400/20 to-purple-400/20 backdrop-blur-sm"
        />
      </div>
      <div className="z-10 relative">{children}</div>
    </div>
  );
}
