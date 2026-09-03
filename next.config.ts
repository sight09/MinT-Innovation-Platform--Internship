import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow serving images from localhost and external domains
    remotePatterns: [],
    // Enable local images from /public directory (default)
    unoptimized: false,
  },
};

export default nextConfig;
