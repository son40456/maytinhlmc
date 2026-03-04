import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tối ưu SSG build time cho ~4000 trang
  experimental: {
    // Giảm retry từ 3 → 1: trang nào timeout thì để ISR xử lý, không lãng phí thời gian retry
    staticGenerationRetryCount: 1,
    // Tăng timeout mỗi trang từ 60s → 120s cho các trang category phức tạp
    staticGenerationMaxConcurrency: 8,
  },
  staticPageGenerationTimeout: 120,
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