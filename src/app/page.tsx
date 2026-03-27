import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { HomeSection } from "@/components/home/HomeSection";
import { HardwareCategoryGrid } from "@/components/home/HardwareCategoryGrid";
import { OrganizationSchema } from "@/components/seo/OrganizationSchema";
import { WebSiteSchema } from "@/components/seo/WebSiteSchema";
import { generateHomepageSEO } from "@/utils/seo";
import { getHomepageConfig, getHardwareGridConfig } from '@/app/actions/configActions';
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
    }));
  } catch (error) {
    console.error(`Error fetching products for section ${categorySlug}:`, error);
    return [];
  }
}

export default async function Home() {
  // Fetch cấu hình KV song song
  const [sections, hardwareGridConfig] = await Promise.all([
    getHomepageConfig(),
    getHardwareGridConfig(),
  ]);

  // Fetch tất cả products của các sections song song (thay vì waterfall)
  const productsBySections = await Promise.all(
    sections.map((section: any) => fetchSectionProducts(section.categorySlug))
  );

  return (
    <div className="flex flex-col gap-6 md:gap-10 pb-6 md:pb-12">
      <OrganizationSchema />
      <WebSiteSchema />
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
        {sections.map((section: any, idx: number) => (
          <HomeSection
            key={section.id}
            title={section.title}
            categorySlug={section.categorySlug}
            subFilters={section.subFilters}
            products={productsBySections[idx]}
          />
        ))}
      </div>

    </div>
  );
}
