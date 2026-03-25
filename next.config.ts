import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Force fresh builds
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
};

export default nextConfig;
