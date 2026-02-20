import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maytinhlmc.vn',
      },
    ],
  },
};

export default nextConfig;
