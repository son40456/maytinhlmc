import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";
import { HardwareCategoryGrid } from "@/components/home/HardwareCategoryGrid";
import type { Metadata } from "next";

const SITE_URL = "https://lmc.vn";

export const metadata: Metadata = {
  title: "Máy Tính LMC - Laptop, PC, Linh Kiện Chính Hãng",
  description: "Mua laptop, PC, linh kiện máy tính chính hãng, giá tốt nhất tại Hà Nội. Trả góp 0%, freeship toàn quốc, bảo hành chính hãng.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "Máy Tính LMC - Laptop, PC, Linh Kiện Chính Hãng",
    description: "Mua laptop, PC, linh kiện máy tính chính hãng, giá tốt nhất tại Hà Nội. Trả góp 0%, freeship toàn quốc, bảo hành chính hãng.",
    url: SITE_URL,
    type: "website",
    siteName: "Máy Tính LMC",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Máy Tính LMC",
  "url": SITE_URL,
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/search?q={search_term_string}` },
    "query-input": "required name=search_term_string",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Máy Tính LMC",
  "url": SITE_URL,
  "telephone": "+84",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "VN",
  },
  "priceRange": "₫₫",
};

const dummyProducts = [
  {
    id: "1",
    name: "Laptop Gaming TỐI THƯỢNG 15.6 inch 144Hz",
    price: "24.990.000₫",
    imageUrl: "",
    slug: "laptop-gaming-1",
  },
  {
    id: "2",
    name: "PC Văn phòng mượt mà - Trải nghiệm siêu êm",
    price: "12.500.000₫",
    imageUrl: "",
    slug: "pc-van-phong",
  },
  {
    id: "3",
    name: "Bàn phím cơ Không Dây siêu cấp Pro Max",
    price: "1.250.000₫",
    imageUrl: "",
    slug: "ban-phim-co",
  },
  {
    id: "4",
    name: "Chuột Gaming RGB cực chất, DPI 16000",
    price: "850.000₫",
    imageUrl: "",
    slug: "chuot-gaming",
  },
  {
    id: "5",
    name: "Màn hình 27 inch 2K IPS 165Hz",
    price: "6.500.000₫",
    imageUrl: "",
    slug: "man-hinh-2k",
  },
];

import { getHomepageConfig, getHardwareGridConfig } from '@/app/actions/configActions';

export default async function Home() {
  // Read dynamic homepage config (via KV or fallback to fs)
  let sections = await getHomepageConfig();
  let hardwareGridConfig = await getHardwareGridConfig();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <div className="flex flex-col gap-6 md:gap-10 pb-6 md:pb-12">
      {/* Hero Banner */}
      <section className="bg-blue-600 text-white py-10 md:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl md:text-5xl font-extrabold tracking-tight mb-3 md:mb-6">
            Nâng Tầm Trải Nghiệm Công Nghệ
          </h1>
          <p className="text-sm md:text-xl max-w-2xl mx-auto mb-4 md:mb-8 text-blue-100">
            Săn deal công nghệ siêu hot mỗi ngày. Tận hưởng trải nghiệm mua sắm nhanh chóng, tiện lợi qua hệ thống Next.js siêu tốc.
          </p>
          <div className="flex justify-center gap-3 md:gap-4">
            <Link href="/category/all">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 font-bold">
                Khám phá ngay
              </Button>
            </Link>
            <Link href="/sale">
              <Button size="lg" variant="outline" className="text-white border-white hover:bg-blue-700">
                Sản phẩm Sale
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Danh mục nổi bật */}
      <div className="mb-2 md:mb-4">
        <HardwareCategoryGrid config={hardwareGridConfig} />
      </div>

      {/* Dynamic Sections từ Cấu hình Admin */}
      <div className="flex flex-col gap-4 md:gap-6">
        {sections.map((section: any) => (
          <HomeSection
            key={section.id}
            title={section.title}
            categorySlug={section.categorySlug}
            subFilters={section.subFilters}
          />
        ))}
      </div>

    </div>
    </>
  );
}
