import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG, GET_PRODUCTS_BY_CATEGORY, GET_CATEGORY_FILTERS } from "@/lib/graphql/queries";
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
import { DetailedSpecsTable } from "@/components/product/DetailedSpecsTable";
import { RelatedNews } from "@/components/product/RelatedNews";
import { ExpandableDescription } from "@/components/product/ExpandableDescription";
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
        first: 24,
        after,
        minPrice,
        maxPrice,
        orderBy,
        taxFilters: taxFilters.length > 0 ? taxFilters : null
    });

    let filterData: any = null;
    if (nodeData?.productCategory) {
        // Fetch attribute filters in a separate cached query to prevent ?after and ?minPrice from breaking the cache
        const { data } = await wpgraphqlFetch<any>(GET_CATEGORY_FILTERS, { slugId: slug, slugStr: slug });
        filterData = data;
    }


    // --- TRƯỜNG HỢP: SẢN PHẨM ---
    if (nodeData?.product) {
        const product = nodeData.product;
        // Clean price: Bỏ &nbsp; và chuẩn hóa khoảng trắng
        const cleanPrice = (priceStr: string) => priceStr?.replace(/&nbsp;/g, " ").trim() || "Liên hệ";
        const displayPrice = cleanPrice(product.price || product.regularPrice);
        const imageUrl = product.image?.sourceUrl || "";

        return (
            <div className="bg-slate-50 min-h-screen pb-12">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                    {/* Main Product Card Background */}
                    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6 lg:p-10 mb-8">
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
                                    salePrice={product.salePrice}
                                    regularPrice={product.regularPrice}
                                />
                            </div>

                            {/* Right: Info & Buy */}
                            <div className="lg:col-span-7 xl:col-span-6 space-y-6">
                                <div>
                                    <h1 className="text-2xl lg:text-3xl xl:text-4xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-4 flex-wrap pb-4 border-b border-gray-100">
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <svg key={star} className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                                </svg>
                                            ))}
                                            <span className="text-sm font-medium text-blue-600 ml-2 hover:underline cursor-pointer">128 đánh giá</span>
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold text-xs uppercase tracking-wider">
                                            {product.stockStatus === 'IN_STOCK' ? '● Còn hàng' : '○ Hết hàng'}
                                        </div>
                                        <span className="text-gray-300">|</span>
                                        <span className="text-sm font-medium text-gray-500">Mã: {product.sku || product.databaseId}</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                                    <div className="space-y-1 bg-red-50/50 p-4 rounded-2xl border border-red-100">
                                        <p className="text-sm text-red-500 font-bold uppercase tracking-wider">Giá bán ưu đãi</p>
                                        <div className="flex items-baseline gap-3">
                                            <span className="text-4xl font-black text-red-600 tracking-tighter">
                                                {displayPrice}
                                            </span>
                                            {product.regularPrice && product.salePrice && (
                                                <span className="text-lg text-slate-400 font-medium line-through decoration-slate-300">
                                                    {cleanPrice(product.regularPrice)}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Promotions Box */}
                                    <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl overflow-hidden mt-4">
                                        <div className="bg-gradient-to-r from-blue-50 to-white px-4 py-3 border-b border-blue-100 flex items-center gap-2">
                                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                            <h3 className="font-bold text-blue-800 uppercase text-sm tracking-wide">Khuyến mãi đặc biệt</h3>
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">1</span></div>
                                                <p className="text-sm text-slate-700 leading-snug">Nhập mã <strong className="text-blue-600">LMC500</strong> giảm ngay 500.000đ khi thanh toán qua VNPay-QR (Áp dụng cho đơn hàng từ 10 Triệu).</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">2</span></div>
                                                <p className="text-sm text-slate-700 leading-snug">Miễn phí giao hàng toàn quốc.</p>
                                            </div>
                                            <div className="flex items-start gap-3">
                                                <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">3</span></div>
                                                <p className="text-sm text-slate-700 leading-snug">Tặng gói bảo dưỡng, vệ sinh PC miễn phí trọn đời (trị giá 1.500.000đ).</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100">
                                        <ProductSpecs
                                            shortDescription={product.shortDescription}
                                            attributes={product.attributes}
                                        />
                                    </div>

                                    <div className="pt-2">
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

                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 border border-slate-100">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">Chính hãng 100%</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-600 shadow-sm shrink-0 border border-slate-100">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                            </div>
                                            <span className="text-xs font-bold text-slate-700">Bảo hành siêu tốc</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main Content Area: Description + Sidebar (Specs & News) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-12">
                            {/* Left Column: Description */}
                            <div className="lg:col-span-8 space-y-8">
                                {product.description && (
                                    <ExpandableDescription content={product.description} />
                                )}
                            </div>

                            {/* Right Column: Sidebar */}
                            <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 h-max">
                                <DetailedSpecsTable
                                    shortDescription={product.shortDescription}
                                    attributes={product.attributes}
                                    acfDetailedSpecs={product.thongsokythuatsonbn?.thongsochitiet || ''}
                                />
                                <RelatedNews />
                            </div>
                        </div>

                        {/* Related Products Section */}
                        {product.related?.nodes && product.related.nodes.length > 0 && (
                            <div className="mt-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-6 uppercase tracking-tight">
                                    Sản phẩm tương tự
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
                                    {product.related.nodes.map((p: any) => (
                                        <ProductCard
                                            key={p.id}
                                            id={p.id}
                                            databaseId={p.databaseId}
                                            name={p.name}
                                            price={(p.price || p.regularPrice || "Liên hệ").replace(/&nbsp;/g, ' ')}
                                            imageUrl={p.image?.sourceUrl || ""}
                                            slug={p.slug}
                                            sku={p.sku}
                                            regularPrice={p.regularPrice}
                                            salePrice={p.salePrice}
                                            category={product.productCategories?.nodes?.[0]?.slug}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

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
                </div>
            </div>
        );
    }

    // --- TRƯỜNG HỢP: DANH MỤC ---
    if (nodeData?.productCategory) {
        const category = nodeData.productCategory;
        const products = nodeData.categoryProducts?.nodes || [];
        const pageInfo = nodeData.categoryProducts?.pageInfo;

        // Trích xuất các bộ lọc khả dụng từ filterDiscovery đã được tách rời cache
        const availableFilters: any[] = [];
        const seenAttrs = new Set();

        filterData?.filterDiscovery?.nodes?.forEach((p: any) => {
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
            <div>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <CategoryProductView
                        category={category}
                        initialProducts={products}
                        initialPageInfo={pageInfo}
                        availableFilters={availableFilters}
                        categorySlug={slug}
                    />
                </div>
            </div>
        );
    }

    // --- TRƯỜNG HỢP: KHÔNG TÌM THẤY ---
    notFound();
}
