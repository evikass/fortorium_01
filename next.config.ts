import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Disable caching completely
  onDemandEntries: {
    maxInactiveAge: 0,
    pagesBufferLength: 0,
  },
  // Generate unique build ID
  generateBuildId: async () => {
    return `fortorium-v5-${Date.now()}`;
  },
};

export default nextConfig;
