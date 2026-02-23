import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG, GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { CategoryFilterSort } from "@/components/ui/CategoryFilterSort";
import Link from "next/link";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { CategoryProductView } from "@/components/category/CategoryProductView";
import { ProductCard } from "@/components/ui/ProductCard";
export const revalidate = 3600;

export async function generateMetadata({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    // Thu thập các bộ lọc taxonomy từ URL (tự động)
    const systemParams = ['after', 'minPrice', 'maxPrice', 'sort'];
    const taxFilters = Object.entries(resolvedSearchParams)
        .filter(([key]) => !systemParams.includes(key))
        .map(([key, value]) => {
            if (!value || typeof value !== 'string') return null;
            // Làm đẹp URL: Bỏ tiền tố pa_ nếu có, chuẩn hóa thành Enum (vd: chipset -> PA_CHIPSET)
            const cleanKey = key.startsWith('pa_') ? key.slice(3) : key;
            const taxonomy = `PA_${cleanKey.toUpperCase().replace(/-/g, '_')}`;
            return {
                taxonomy,
                terms: [value],
                operator: 'IN'
            };
        })
        .filter(f => f !== null);

    const { data } = await wpgraphqlFetch<any>(GET_NODE_BY_SLUG, {
        slugId: slug,
        slugStr: slug,
        taxFilters: taxFilters.length > 0 ? taxFilters : null
    });

    if (data?.product) {
        return {
            title: `${data.product.name} | LMC`,
            description: data.product.shortDescription?.replace(/<[^>]+>/g, '') || `Mua ngay ${data.product.name} tại LMC!`,
            openGraph: { images: [data.product.image?.sourceUrl || ""] },
        };
    }

    if (data?.productCategory) {
        return {
            title: `${data.productCategory.name} | LMC`,
            description: `Khám phá các sản phẩm ${data.productCategory.name} tại LMC.`,
        };
    }

    return { title: '404 - Không tìm thấy trang | LMC' };
}

export default async function SlugPage({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const after = resolvedSearchParams.after || "";
    const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : null;
    const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : null;
    const sort = resolvedSearchParams.sort || "date-desc";

    // Xây dựng bộ lọc taxonomy động
    const systemParams = ['after', 'minPrice', 'maxPrice', 'sort'];
    const taxFilters = Object.entries(resolvedSearchParams)
        .filter(([key, value]) => !systemParams.includes(key) && value)
        .map(([key, value]) => {
            const cleanKey = key.startsWith('pa_') ? key.slice(3) : key;
            const taxonomy = `PA_${cleanKey.toUpperCase().replace(/-/g, '_')}`;
            return {
                taxonomy,
                terms: [value as string],
                operator: 'IN'
            };
        });

    let orderBy = [{ field: "DATE", order: "DESC" }];
    if (sort === "price-asc") orderBy = [{ field: "PRICE", order: "ASC" }];
    if (sort === "price-desc") orderBy = [{ field: "PRICE", order: "DESC" }];

    // 1. Kiểm tra Slug & Lấy dữ liệu (Gộp chung để giảm round-trip)
    const { data: nodeData } = await wpgraphqlFetch<any>(GET_NODE_BY_SLUG, {
        slugId: slug,
        slugStr: slug,
        first: 12,
        after,
        minPrice,
        maxPrice,
        orderBy,
        taxFilters: taxFilters.length > 0 ? taxFilters : null
    });


    // --- TRƯỜNG HỢP: SẢN PHẨM ---
    if (nodeData?.product) {
        const product = nodeData.product;
        // Clean price: Bỏ &nbsp; và chuẩn hóa khoảng trắng
        const cleanPrice = (priceStr: string) => priceStr?.replace(/&nbsp;/g, " ").trim() || "Liên hệ";
        const displayPrice = cleanPrice(product.price || product.regularPrice);
        const imageUrl = product.image?.sourceUrl || "";

        return (
            <div className="bg-gray-50/50 min-h-screen">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Breadcrumbs */}
                    <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap pb-2">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                        <span>/</span>
                        {product.productCategories?.nodes?.[0] && (
                            <>
                                <Link
                                    href={`/${product.productCategories.nodes[0].slug}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {product.productCategories.nodes[0].name}
                                </Link>
                                <span>/</span>
                            </>
                        )}
                        <span className="text-gray-900 font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left: Photos */}
                        <div className="lg:col-span-5 xl:col-span-6">
                            <ProductGallery
                                mainImage={product.image}
                                galleryNodes={product.galleryImages?.nodes || []}
                                name={product.name}
                            />
                        </div>

                        {/* Right: Info & Buy */}
                        <div className="lg:col-span-7 xl:col-span-6 space-y-8">
                            <div>
                                <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
                                    {product.name}
                                </h1>
                                <div className="flex items-center gap-4 flex-wrap">
                                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                                        {product.stockStatus === 'IN_STOCK' ? '● Còn hàng' : '○ Hết hàng'}
                                    </div>
                                    <span className="text-gray-400">|</span>
                                    <span className="text-sm text-gray-500">Mã: {product.databaseId}</span>
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                <div className="space-y-1">
                                    <p className="text-sm text-gray-400 font-medium">Giá bán ưu đãi</p>
                                    <div className="flex items-baseline gap-3">
                                        <span className="text-4xl font-black text-red-600 tracking-tighter">
                                            {displayPrice}
                                        </span>
                                        {product.regularPrice && product.salePrice && (
                                            <span className="text-lg text-gray-400 line-through">
                                                {cleanPrice(product.regularPrice)}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <ProductSpecs
                                        shortDescription={product.shortDescription}
                                        attributes={product.attributes}
                                    />
                                </div>

                                <div className="pt-6 border-t border-gray-100">
                                    <AddToCartButton
                                        id={product.id}
                                        databaseId={product.databaseId}
                                        name={product.name}
                                        price={displayPrice}
                                        imageUrl={imageUrl}
                                        slug={product.slug}
                                        stockStatus={product.stockStatus || "IN_STOCK"}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">Chính hãng 100%</span>
                                    </div>
                                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                        </div>
                                        <span className="text-xs font-bold text-gray-700">Bảo hành siêu tốc</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Description Section */}
                    {product.description && (
                        <div className="mt-16 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 lg:p-12">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-blue-600 w-max">
                                Thông tin chi tiết
                            </h2>
                            <div className="prose max-w-none prose-blue prose-img:rounded-2xl" dangerouslySetInnerHTML={{ __html: product.description }} />
                        </div>
                    )}

                    {/* Related Products Section */}
                    {product.related?.nodes && product.related.nodes.length > 0 && (
                        <div className="mt-16">
                            <h2 className="text-2xl font-bold text-gray-900 mb-8">
                                Sản phẩm liên quan
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
                                {product.related.nodes.map((p: any) => (
                                    <ProductCard
                                        key={p.id}
                                        id={p.id}
                                        databaseId={p.databaseId}
                                        name={p.name}
                                        price={(p.price || p.regularPrice || "Liên hệ").replace(/&nbsp;/g, ' ')}
                                        imageUrl={p.image?.sourceUrl || ""}
                                        slug={p.slug}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <StickyBuyBar
                    id={product.id}
                    databaseId={product.databaseId}
                    name={product.name}
                    price={displayPrice}
                    imageUrl={imageUrl}
                    slug={product.slug}
                    stockStatus={product.stockStatus || "IN_STOCK"}
                />
            </div>
        );
    }

    // --- TRƯỜNG HỢP: DANH MỤC ---
    if (nodeData?.productCategory) {
        const category = nodeData.productCategory;
        const products = nodeData.categoryProducts?.nodes || [];
        const pageInfo = nodeData.categoryProducts?.pageInfo;

        // Trích xuất các bộ lọc khả dụng từ filterDiscovery
        const availableFilters: any[] = [];
        const seenAttrs = new Set();

        nodeData.filterDiscovery?.nodes?.forEach((p: any) => {
            p.attributes?.nodes?.forEach((attr: any) => {
                const key = attr.slug || attr.name;
                const terms = attr.terms?.nodes || [];

                if (!seenAttrs.has(key)) {
                    seenAttrs.add(key);
                    const displaySlug = key.startsWith('pa_') ? key.slice(3) : key;

                    const optionsMap = new Map();
                    terms.forEach((t: any) => {
                        const logoUrl = t.logo?.logo?.node?.sourceUrl;
                        optionsMap.set(t.slug, { name: t.name, logo: logoUrl });
                    });

                    availableFilters.push({
                        name: attr.label || attr.name,
                        slug: displaySlug,
                        rawSlug: key,
                        options: Array.from(optionsMap.entries()).map(([slug, data]) => ({ slug, name: data.name, logo: data.logo }))
                    });
                } else {
                    const existing = availableFilters.find(f => f.rawSlug === key);
                    if (existing) {
                        const existingSlugs = new Set(existing.options.map((o: any) => o.slug));
                        terms.forEach((t: any) => {
                            if (!existingSlugs.has(t.slug)) {
                                const logoUrl = t.logo?.logo?.node?.sourceUrl;
                                existing.options.push({ slug: t.slug, name: t.name, logo: logoUrl });
                                existingSlugs.add(t.slug);
                            }
                        });
                    }
                }
            });
        });

        // Hậu xử lý: Sắp xếp các lựa chọn khoảng giá theo thứ tự tự nhiên (tăng dần)
        availableFilters.forEach((filter: any) => {
            if (filter.slug.includes('khoang-gia')) {
                filter.options.sort((a: any, b: any) => {
                    const extractMin = (slug: string) => {
                        let minStr = slug.replace('duoi-', '0-').replace('tren-', '999-').replace(/trieu/g, '');
                        return parseInt(minStr.split('-')[0]) || 0;
                    };
                    return extractMin(a.slug) - extractMin(b.slug);
                });
            }
        });

        // Tạo URL cho Load More bảo toàn tất cả searchParams
        const getLoadMoreUrl = () => {
            const params = new URLSearchParams();
            Object.entries(resolvedSearchParams).forEach(([key, value]) => {
                if (value) params.set(key, value);
            });
            params.set('after', pageInfo?.endCursor || "");
            return `/${slug}?${params.toString()}`;
        };

        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <CategoryProductView
                    category={category}
                    initialProducts={products}
                    initialPageInfo={pageInfo}
                    availableFilters={availableFilters}
                    categorySlug={slug}
                />
            </div>
        );
    }

    // --- TRƯỜNG HỢP: KHÔNG TÌM THẤY ---
    notFound();
}
