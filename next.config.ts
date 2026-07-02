import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 1. Chuyển sang dùng custom loader để fix lỗi 402
    loader: 'custom',
    loaderFile: './src/utils/imagekit-loader.ts',

    // 2. Xóa 'unoptimized: true' để ImageKit có thể nén ảnh cho bạn
    // (Nếu để unoptimized: true thì loader sẽ không chạy)

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'maytinhlmc.vn',
      },
      {
        protocol: 'https',
        hostname: 'data.maytinhlmc.vn',
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
