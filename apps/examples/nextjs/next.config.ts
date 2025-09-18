import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // transpilePackages: ['better-blog']
  //ignore scripts
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
