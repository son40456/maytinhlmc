import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maytinhlmc.vn',
      },
      {
        protocol: 'https',
        hostname: 'next.maytinhlmc.vn',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/category/:slug',
        destination: '/:slug',
        permanent: true,
      },
      {
        source: '/product/:slug',
        destination: '/:slug',
        permanent: true,
      },
    ];
  },
};



export default nextConfig;
