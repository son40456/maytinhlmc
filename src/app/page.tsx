import { ProductSlider } from "@/components/home/ProductSlider";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_FEATURED_PRODUCTS } from "@/lib/graphql/queries";
import { HomeSection } from "@/components/home/HomeSection";
import fs from "fs/promises";
import path from "path";

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

export default async function Home() {
  // Read dynamic homepage config
  let sections = [];
  try {
    const dataFilePath = path.join(process.cwd(), 'src', 'data', 'homepageConfig.json');
    const fileData = await fs.readFile(dataFilePath, 'utf-8');
    sections = JSON.parse(fileData);
  } catch (error) {
    console.error('Error reading homepage config in Home:', error);
  }

  // Fetch real data from WPGraphQL
  const { data } = await wpgraphqlFetch<any>(GET_FEATURED_PRODUCTS, { first: 10 }, {
    next: { revalidate: 3600 } // ISR: Revalidate mỗi giờ
  });

  const rawProducts = data?.products?.nodes;

  // Ánh xạ dữ liệu trả về hoặc dùng fallback
  const displayProducts = rawProducts && rawProducts.length > 0
    ? rawProducts.map((p: any) => ({
      id: p.id,
      databaseId: p.databaseId,
      name: p.name,
      price: p.price || p.regularPrice || "Liên hệ",
      imageUrl: p.image?.sourceUrl || "",
      slug: p.slug,
    }))
    : dummyProducts;

  return (
    <div className="flex flex-col gap-10 pb-12 bg-gray-50 min-h-screen">
      {/* Hero Banner */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6">
            Nâng Tầm Trải Nghiệm Công Nghệ
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-blue-100">
            Săn deal công nghệ siêu hot mỗi ngày. Tận hưởng trải nghiệm mua sắm nhanh chóng, tiện lợi qua hệ thống Next.js siêu tốc.
          </p>
          <div className="flex justify-center gap-4">
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

      {/* Dynamic Sections từ Cấu hình Admin */}
      <div className="flex flex-col gap-6">
        {sections.map((section: any) => (
          <HomeSection
            key={section.id}
            title={section.title}
            categorySlug={section.categorySlug}
            subFilters={section.subFilters}
          />
        ))}
      </div>

      {/* Featured Products */}
      <section className="container mx-auto px-4 sm:px-6 lg:px-8 mt-6 overflow-hidden">
        <div className="flex justify-between items-center mb-6 border-b-2 border-red-600 pb-3">
          <h2 className="text-xl md:text-2xl font-bold uppercase text-gray-900 tracking-wide z-10">Sản phẩm nổi bật</h2>
          <Link href="/category/new" className="text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-500 font-bold text-sm bg-white px-4 py-1.5 rounded-full transition-all shadow-sm whitespace-nowrap z-10">
            Xem tất cả &rarr;
          </Link>
        </div>

        <ProductSlider products={displayProducts} />
      </section>
    </div>
  );
}
