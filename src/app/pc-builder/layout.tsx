import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

// H1: metadata must live in a Server Component (layout or page without "use client")
// pc-builder/page.tsx uses "use client", so this layout.tsx acts as the metadata provider
export const metadata: Metadata = {
    title: 'Build PC - Xây Dựng Cấu Hình Máy Tính | LMC',
    description: 'Công cụ xây dựng cấu hình PC tùy chỉnh tại LMC. Chọn linh kiện tương thích, so sánh giá và đặt hàng trực tuyến.',
    alternates: {
        canonical: `${BASE_URL}/pc-builder`,
    },
    openGraph: {
        title: 'Build PC - Xây Dựng Cấu Hình Máy Tính | LMC',
        description: 'Công cụ xây dựng cấu hình PC tùy chỉnh tại LMC. Chọn linh kiện tương thích, so sánh giá và đặt hàng trực tuyến.',
        url: `${BASE_URL}/pc-builder`,
        type: 'website',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Build PC - Xây Dựng Cấu Hình Máy Tính | LMC',
        description: 'Công cụ xây dựng cấu hình PC tùy chỉnh tại LMC. Chọn linh kiện tương thích, so sánh giá và đặt hàng trực tuyến.',
    },
};

export default function PcBuilderLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
