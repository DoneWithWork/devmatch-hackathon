import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  images: {
    remotePatterns: [new URL("https://wew033a7vo.ufs.sh/**")]
  }
};

export default nextConfig;
