import { ProductCard } from "@/components/ui/ProductCard";
import Link from "next/link";

interface Product {
    id: string;
    databaseId?: number | undefined;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
}

interface HomeSectionProps {
    title: string;
    categorySlug: string;
    subFilters: { name: string; slug: string }[];
    products: Product[];
}

export function HomeSection({ title, categorySlug, subFilters, products }: HomeSectionProps) {
    if (!products || products.length === 0) {
        return null; // Không render section nếu không có sản phẩm
    }

    return (
        <section className="container mx-auto px-4 mb-6 md:mb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4 mb-3 md:mb-6">
                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto pb-1 md:pb-2 scrollbar-hide">
                    <div className="flex items-center bg-blue-600 rounded-md overflow-hidden flex-shrink-0 shadow-sm h-8 md:h-11">
                        <div className="bg-orange-500 w-2 md:w-3 h-full"></div>
                        <span className="px-3 md:px-5 text-white font-bold tracking-wider text-xs md:text-lg uppercase whitespace-nowrap">
                            {title}
                        </span>
                    </div>

                    <div className="flex gap-1.5 md:gap-2">
                        {subFilters && subFilters.length > 0 && subFilters.map((sub, idx) => (
                            <Link
                                key={idx}
                                href={`/${categorySlug}?pa_thuong-hieu=${sub.slug}`}
                                className="whitespace-nowrap px-2.5 md:px-4 py-1.5 md:py-2 bg-white border border-gray-200 rounded-md text-[11px] md:text-sm font-medium hover:border-blue-600 hover:text-blue-600 transition-colors shadow-sm"
                            >
                                {sub.name}
                            </Link>
                        ))}
                    </div>
                </div>

                <Link href={`/${categorySlug}`} className="text-blue-600 font-semibold text-xs md:text-sm hover:underline flex items-center gap-1 flex-shrink-0 bg-white border border-gray-200 hover:border-blue-600 px-3 md:px-4 py-1.5 md:py-2 rounded-md transition-colors shadow-sm self-start md:self-auto">
                    XEM TẤT CẢ <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-2 md:gap-3 lg:gap-4">
                {products.map((p: Product, idx: number) => (
                    <ProductCard
                        key={p.id}
                        id={p.id}
                        databaseId={p.databaseId ?? 0}
                        name={p.name}
                        price={(p.price || "Liên hệ").replace(/&nbsp;/g, ' ')}
                        imageUrl={p.imageUrl}
                        slug={p.slug}
                        category={categorySlug}
                        priority={idx < 6}
                    />
                ))}
            </div>
        </section>
    );
}
