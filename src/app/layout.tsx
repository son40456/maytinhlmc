import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobalModalProvider } from "@/components/common/GlobalModalProvider";
import { ThemeSync } from "@/components/common/ThemeSync";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

import { getSiteLogo } from "@/lib/getSiteLogo";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Máy Tính LMC – Laptop, PC, Linh Kiện Chính Hãng',
    template: '%s | LMC',
  },
  description: 'Mua laptop, PC, linh kiện máy tính chính hãng tại LMC. Giá rẻ nhất, bảo hành chính hãng, trả góp 0%, giao hàng toàn quốc.',
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: BASE_URL,
    siteName: 'Máy Tính LMC',
    title: 'Máy Tính LMC – Laptop, PC, Linh Kiện Chính Hãng',
    description: 'Mua laptop, PC, linh kiện máy tính chính hãng tại LMC. Giá rẻ nhất, bảo hành chính hãng, trả góp 0%, giao hàng toàn quốc.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Máy Tính LMC – Laptop, PC, Linh Kiện Chính Hãng',
    description: 'Mua laptop, PC, linh kiện máy tính chính hãng tại LMC. Giá rẻ nhất, bảo hành chính hãng, trả góp 0%, giao hàng toàn quốc.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = await getSiteLogo();

  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white`}
      >
        <ThemeSync />
        <div className="flex flex-col min-h-screen text-gray-900 dark:text-white">
          <Header logoUrl={logoUrl} />
          <main className="flex-1 pb-16 lg:pb-0">
            <GlobalModalProvider>
              {children}
            </GlobalModalProvider>
          </main>
          <Footer logoUrl={logoUrl} />
        </div>
      </body>
    </html>
  );
}
