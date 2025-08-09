"use client";
import { motion } from "framer-motion";
import { Shield, Zap, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            y: [0, -20, 0],
            rotate: [0, 5, 0],
          }}
          transition={{
            duration: 6,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-20 left-10 w-20 h-20 rounded-full bg-gradient-to-r from-purple-400/20 to-purple-400/20 backdrop-blur-sm"
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100/50 to-purple-100/50 backdrop-blur-sm border border-white/30"
              >
                <Zap className="h-4 w-4 text-purple-600 mr-2" />
                <span className="text-sm font-medium text-purple-700">
                  Powered by Blockchain Technology
                </span>
              </motion.div>

              <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-purple-600 via-purple-600 to-purple-800 bg-clip-text text-transparent">
                  Secure Certificate
                </span>
                <br />
                <span className="text-gray-800">Verification</span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed max-w-lg">
                Issue and verify certificates on the blockchain with
                zero-knowledge authentication. Transparent, secure, and
                tamper-proof certification system.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/sign-in"
                className="group px-8 py-4 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600 text-white font-semibold hover:from-purple-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center"
              >
                Issue Certificate
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/sign-in"
                className="px-8 py-4 rounded-xl bg-white/20 backdrop-blur-sm border border-white/30 text-gray-700 font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center"
              >
                Verify Certificate
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-6 pt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-purple-600">10K+</div>
                <div className="text-sm text-gray-600">Certificates Issued</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-purple-600">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="text-center"
              >
                <div className="text-2xl font-bold text-yellow-600">5+</div>
                <div className="text-sm text-gray-600">Blockchains</div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative"
          >
            <div className="relative">
              <motion.div
                animate={{
                  y: [0, -10, 0],
                  rotateY: [0, 5, 0],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="relative z-10 p-8 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-purple-600">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Digital Certificate
                      </div>
                      <div className="text-sm text-gray-600">
                        Blockchain Verified
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-100/50 backdrop-blur-sm border border-green-200/50 text-green-700 text-xs font-medium">
                    Verified ✓
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600">Certificate ID</div>
                    <div className="font-mono text-sm text-gray-800">
                      0x1a2b3c4d5e6f...
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Issued To</div>
                    <div className="font-semibold text-gray-800">John Doe</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">Achievement</div>
                    <div className="font-semibold text-gray-800">
                      Blockchain Development
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-white/20">
                    <div className="flex items-center space-x-2">
                      <Globe className="h-4 w-4 text-purple-500" />
                      <span className="text-sm text-gray-600">
                        Ethereum Network
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">Dec 2024</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{
                  y: [0, 15, 0],
                  rotateY: [0, -3, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-4 -right-4 w-full h-full rounded-2xl bg-gradient-to-r from-purple-400/20 to-yellow-400/20 backdrop-blur-sm border border-white/20"
              />
              <motion.div
                animate={{
                  y: [0, -5, 0],
                  rotateY: [0, 2, 0],
                }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute -top-8 -right-8 w-full h-full rounded-2xl bg-gradient-to-r from-purple-400/20 to-purple-400/20 backdrop-blur-sm border border-white/20"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
