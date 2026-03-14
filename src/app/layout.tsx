import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { GlobalModalProvider } from "@/components/common/GlobalModalProvider";

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

const SITE_NAME = "Máy Tính LMC";
const SITE_URL = "https://lmc.vn";
const SITE_DESCRIPTION = "Mua laptop, PC, linh kiện máy tính chính hãng, giá tốt nhất. Trả góp 0%, freeship toàn quốc.";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} - Laptop, PC, Linh Kiện Chính Hãng`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} - Laptop, PC, Linh Kiện Chính Hãng`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Laptop, PC, Linh Kiện Chính Hãng`,
    description: SITE_DESCRIPTION,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const logoUrl = await getSiteLogo();

  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}
      >
        <div className="flex flex-col min-h-screen text-gray-900">
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
