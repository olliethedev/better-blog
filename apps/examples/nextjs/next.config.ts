import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transpilePackages: ['better-blog']
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*",
      },
    ],
  },
};

export default nextConfig;
