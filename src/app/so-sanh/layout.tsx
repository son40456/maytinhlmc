import type { Metadata } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

// H1: metadata must live in a Server Component (layout or page without "use client")
// so-sanh/page.tsx uses "use client", so this layout.tsx acts as the metadata provider
export const metadata: Metadata = {
    title: 'So Sánh Sản Phẩm - Tìm Linh Kiện Tốt Nhất | LMC',
    description: 'So sánh chi tiết thông số kỹ thuật, giá cả các sản phẩm máy tính tại LMC. Giúp bạn đưa ra lựa chọn thông minh nhất.',
    alternates: {
        canonical: `${BASE_URL}/so-sanh`,
    },
    // noindex: compare pages are user-session-specific, typically not useful to index
    robots: {
        index: false,
        follow: true,
    },
    openGraph: {
        title: 'So Sánh Sản Phẩm - Tìm Linh Kiện Tốt Nhất | LMC',
        description: 'So sánh chi tiết thông số kỹ thuật, giá cả các sản phẩm máy tính tại LMC.',
        url: `${BASE_URL}/so-sanh`,
        type: 'website',
    },
    twitter: {
        card: 'summary',
        title: 'So Sánh Sản Phẩm | LMC',
        description: 'So sánh chi tiết thông số kỹ thuật, giá cả các sản phẩm máy tính tại LMC.',
    },
};

export default function SoSanhLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
