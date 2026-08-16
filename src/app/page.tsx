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

async function fetchSectionProducts(categorySlug: string) {
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
    return rawProducts.map((p: any) => ({
      id: p.id,
      databaseId: p.databaseId,
      name: p.name,
      price: p.price || p.regularPrice || "Liên hệ",
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

async function BannerWrapper() {
  const bannerConfig = await getBannerConfig();
  return <BannerSection config={bannerConfig} />;
}

async function HardwareGridWrapper() {
  const hardwareGridConfig = await getHardwareGridConfig();
  return <HardwareCategoryGrid config={hardwareGridConfig} />;
}

async function HomeSectionsWrapper() {
  const sections = await getHomepageConfig();
  const productsBySections = await Promise.all(
    sections.map((section: any) => fetchSectionProducts(section.categorySlug))
  );

  return (
    <>
      {sections.map((section: any, idx: number) => (
        <HomeSection
          key={section.id}
          title={section.title}
          categorySlug={section.categorySlug}
          subFilters={section.subFilters}
          products={productsBySections[idx]}
        />
      ))}
    </>
  );
}

export default function Home() {
  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-6 md:pb-12">
      <OrganizationSchema />
      <WebSiteSchema />
      
      {/* Hero Banner Slider + Small Banners */}
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

      {/* Dynamic Sections từ Cấu hình Admin */}
      <div className="flex flex-col gap-4 md:gap-6">
        <Suspense fallback={
          <div className="w-full flex flex-col gap-4">
            <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg" />
            <div className="h-[400px] bg-slate-100 animate-pulse rounded-lg" />
          </div>
        }>
          <HomeSectionsWrapper />
        </Suspense>
      </div>
    </div>
  );
}
