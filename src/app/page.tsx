import type { Metadata } from "next";
import { Suspense } from "react";
import { BannerSection } from '@/components/ui/BannerSection';
import { HomeSection } from "@/components/home/HomeSection";
import { HardwareCategoryGrid } from "@/components/home/HardwareCategoryGrid";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { WebSiteSchema } from "@/components/seo/WebSiteSchema";
import { generateHomepageSEO } from "@/utils/seo";
import { getHomepageConfig, getHardwareGridConfig, getBannerConfig } from '@/app/actions/configActions';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";

const seo = generateHomepageSEO();
export const metadata: Metadata = {
  title: seo.title,
  description: seo.description,
  openGraph: seo.openGraph,
  twitter: seo.twitter,
  alternates: seo.alternates,
};

// P3: Trim product shape — chỉ lấy fields cần thiết để render ProductCardServer
// Loại bỏ description, shortDescription, attributes, categories... giảm RSC payload
interface SlimProduct {
  id: string;
  databaseId: number;
  name: string;
  price: string;
  imageUrl: string;
  slug: string;
  sku?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus?: string;
}

async function fetchSectionProducts(categorySlug: string): Promise<SlimProduct[]> {
  try {
    const { data } = await wpgraphqlFetch<any>(
      GET_PRODUCTS_BY_CATEGORY,
      {
        slugId: categorySlug,
        slugStr: categorySlug,
        first: 12,
      },
      {
        next: { revalidate: 3600 }, // ISR 1 hour
      }
    );
    const rawProducts = data?.products?.nodes || [];
    return rawProducts.map((p: any): SlimProduct => ({
      id: p.id,
      databaseId: p.databaseId,
      name: p.name,
      // Trim price string từ HTML entities
      price: (p.price || p.regularPrice || "Liên hệ").replace(/&nbsp;/g, ' '),
      // Chỉ lấy URL ảnh, không lấy altText/caption/description của ảnh
      imageUrl: p.image?.sourceUrl || "",
      slug: p.slug,
      sku: p.sku,
      regularPrice: p.regularPrice,
      salePrice: p.salePrice,
      stockStatus: p.stockStatus || 'IN_STOCK',
    }));
  } catch (error) {
    console.error(`Error fetching products for section ${categorySlug}:`, error);
    return [];
  }
}

// P3: Mỗi section là 1 async component độc lập với Suspense riêng
// → Stream từng section khi sẵn sàng, không chờ section chậm nhất
// → Giảm TTFB: user thấy nội dung trên màn hình sớm hơn (trên fold)
// → RSC payload nhỏ hơn mỗi chunk, trình duyệt parse nhanh hơn
async function HomeSectionItem({ section }: { section: any }) {
  const products = await fetchSectionProducts(section.categorySlug);
  if (!products.length) return null;
  return (
    <HomeSection
      title={section.title}
      categorySlug={section.categorySlug}
      subFilters={section.subFilters}
      products={products}
    />
  );
}

const SECTION_SKELETON = (
  <div className="container mx-auto px-4">
    <div className="h-8 w-48 bg-slate-100 animate-pulse rounded mb-4" />
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 lg:gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="aspect-square bg-slate-100 animate-pulse rounded-xl" />
      ))}
    </div>
  </div>
);

async function BannerWrapper() {
  const bannerConfig = await getBannerConfig();
  return <BannerSection config={bannerConfig} />;
}

async function HardwareGridWrapper() {
  const hardwareGridConfig = await getHardwareGridConfig();
  return <HardwareCategoryGrid config={hardwareGridConfig} />;
}

// P3: Tách sections loading — fetch config một lần, render mỗi section trong Suspense riêng
async function HomeSectionsContainer() {
  const sections = await getHomepageConfig();
  return (
    <>
      {sections.map((section: any) => (
        // Mỗi section có Suspense riêng → stream độc lập
        // Không cần chờ tất cả sections hoàn tất trước khi hiện
        <Suspense key={section.id} fallback={SECTION_SKELETON}>
          <HomeSectionItem section={section} />
        </Suspense>
      ))}
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-6 md:pb-12">
      <OrganizationSchema />
      <WebSiteSchema />
      
      {/* Hero Banner — BannerSection là Server Component, prerender ảnh slide 1 vào HTML */}
      <Suspense fallback={
        <div className="w-full">
          <div className="w-full aspect-[21/9] md:aspect-[3/1] bg-slate-100 animate-pulse rounded-none" />
          <div className="container mx-auto px-4 mt-4 hidden md:grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-[220px] bg-slate-100 animate-pulse rounded-2xl" />
            ))}
          </div>
        </div>
      }>
        <BannerWrapper />
      </Suspense>

      {/* Danh mục nổi bật */}
      <div className="mb-2 md:mb-4">
        <Suspense fallback={
          <div className="w-full h-[200px] md:h-[380px] bg-slate-100 animate-pulse rounded-xl" />
        }>
          <HardwareGridWrapper />
        </Suspense>
      </div>

      {/* P3: Dynamic Sections — mỗi section stream độc lập, không block nhau */}
      <div className="flex flex-col gap-4 md:gap-6">
        <HomeSectionsContainer />
      </div>
    </div>
  );
}
