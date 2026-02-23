import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";
import { ProductSlider } from "@/components/home/ProductSlider";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface HomeSectionProps {
    title: string;
    categorySlug: string;
    subFilters: { name: string; slug: string }[];
}

export async function HomeSection({ title, categorySlug, subFilters }: HomeSectionProps) {
    // Fetch products by category
    let rawProducts = [];
    try {
        const { data } = await wpgraphqlFetch<any>(
            GET_PRODUCTS_BY_CATEGORY,
            {
                slugId: categorySlug,
                slugStr: categorySlug,
                first: 10, // Tăng lên 10 để slider có thể trượt nhiều hơn
            },
            {
                next: { revalidate: 3600 } // ISR 1 hour
            }
        );
        rawProducts = data?.products?.nodes || [];
    } catch (error) {
        console.error(`Error fetching products for section ${categorySlug}:`, error);
    }

    if (!rawProducts || rawProducts.length === 0) {
        return null; // Không render section nếu không có sản phẩm
    }

    // Map data
    const displayProducts = rawProducts.map((p: any) => ({
        id: p.id,
        databaseId: p.databaseId,
        name: p.name,
        price: p.price || p.regularPrice || "Liên hệ",
        imageUrl: p.image?.sourceUrl || "",
        slug: p.slug,
    }));

    return (
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 mb-12 overflow-hidden">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 border-b-2 border-red-600 pb-3 gap-4">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-gray-900 tracking-wide z-10">
                    {title}
                </h2>

                <div className="flex flex-wrap items-center gap-2 md:gap-3 z-10">
                    {subFilters && subFilters.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {subFilters.map((sub, idx) => (
                                <Link
                                    key={idx}
                                    href={`/${categorySlug}?pa_thuong-hieu=${sub.slug}`}
                                    className="px-4 py-1.5 bg-white hover:bg-gray-50 text-gray-700 hover:text-blue-600 border border-gray-200 hover:border-blue-500 text-xs md:text-sm font-bold rounded-full shadow-sm transition-all whitespace-nowrap"
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link href={`/${categorySlug}`}>
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white font-bold h-8 md:h-9 px-4 rounded-full text-xs md:text-sm whitespace-nowrap shadow-sm">
                            Xem tất cả &rarr;
                        </Button>
                    </Link>
                </div>
            </div>

            <ProductSlider products={displayProducts} />
        </section>
    );
}
