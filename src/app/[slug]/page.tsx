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

        // Calculate savings
        const getSavingsInfo = () => {
            if (!product.regularPrice || !product.salePrice) return null;
            const regNum = parseInt(product.regularPrice.replace(/[^\d]/g, ''));
            const saleNum = parseInt(product.salePrice.replace(/[^\d]/g, ''));
            if (!regNum || !saleNum || regNum <= saleNum) return null;
            const saved = regNum - saleNum;
            const percent = Math.round((saved / regNum) * 100);
            return { saved: saved.toLocaleString('vi-VN') + '₫', percent };
        };
        const savings = getSavingsInfo();

        return (
            <div className="bg-[#f8fafc] min-h-screen pb-16">
                <div className="max-w-[1600px] mx-auto px-4 py-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        {product.productCategories?.nodes?.[0] && (
                            <>
                                <Link
                                    href={`/${product.productCategories.nodes[0].slug}`}
                                    className="hover:text-blue-600 transition-colors"
                                >
                                    {product.productCategories.nodes[0].name}
                                </Link>
                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </>
                        )}
                        <span className="text-slate-900 font-medium truncate">{product.name}</span>
                    </nav>

                    {/* ===== TOP CARD: Gallery + Product Info ===== */}
                    <div className="bg-white rounded-xl border border-slate-200 p-6 lg:p-8 mb-8">
                        <div className="lg:grid gap-8 items-start" style={{ gridTemplateColumns: '55% 1fr' }}>

                            {/* LEFT: Gallery (sticky) */}
                            <div className="lg:sticky lg:top-[88px] space-y-4">
                                <ProductGallery
                                    mainImage={product.image}
                                    galleryNodes={product.galleryImages?.nodes || []}
                                    name={product.name}
                                    salePrice={product.salePrice}
                                    regularPrice={product.regularPrice}
                                />

                                {/* Action Bar */}
                                <div className="bg-slate-50 rounded-xl p-3 flex items-center justify-around">
                                    <button className="flex items-center gap-2 group px-4 py-2 hover:bg-white rounded-lg transition-all">
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                                        <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 uppercase tracking-wider">So sánh</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-200"></div>
                                    <button className="flex items-center gap-2 group px-4 py-2 hover:bg-white rounded-lg transition-all">
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                                        <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 uppercase tracking-wider">Chia sẻ</span>
                                    </button>
                                    <div className="w-px h-6 bg-slate-200"></div>
                                    <button className="flex items-center gap-2 group px-4 py-2 hover:bg-white rounded-lg transition-all">
                                        <svg className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                                        <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 uppercase tracking-wider">Yêu thích</span>
                                    </button>
                                </div>
                            </div>

                            {/* RIGHT: Product Info (scrolls naturally) */}
                            <div className="space-y-6 mt-6 lg:mt-0">
                                {/* Title + Meta */}
                                <div>
                                    <h1 className="text-2xl font-bold text-slate-900 mb-3 leading-tight">
                                        {product.name}
                                    </h1>
                                    <div className="flex items-center gap-4 text-sm mb-4 flex-wrap">
                                        <span className="text-slate-400">Mã SP: <span className="text-blue-600 font-medium">{product.sku || product.databaseId}</span></span>
                                        <div className="flex items-center gap-1">
                                            <div className="flex text-amber-400">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <svg key={s} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                                ))}
                                            </div>
                                            <span className="text-slate-500">(128)</span>
                                        </div>
                                        <span className="text-slate-300">|</span>
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${product.stockStatus === 'IN_STOCK' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                            <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                            {product.stockStatus === 'IN_STOCK' ? 'Còn hàng' : 'Hết hàng'}
                                        </div>
                                    </div>
                                </div>

                                {/* Specs Summary */}
                                <div className="border-t border-b border-slate-100 py-4">
                                    <ProductSpecs
                                        shortDescription={product.shortDescription}
                                        attributes={product.attributes}
                                    />
                                </div>

                                {/* Price Block */}
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    {savings && (
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-400 text-sm">Giá niêm yết: <span className="line-through">{cleanPrice(product.regularPrice)}</span></span>
                                            <div className="text-red-600 font-bold text-sm">Tiết kiệm {savings.saved}</div>
                                        </div>
                                    )}
                                    <div className="bg-gradient-to-r from-red-600 to-purple-600 p-4 rounded-xl text-center">
                                        <span className="text-white text-3xl font-black">{displayPrice}</span>
                                        <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest mt-1">Giá ưu đãi trực tuyến</p>
                                    </div>
                                </div>

                                {/* Benefits */}
                                <ul className="space-y-2 text-sm text-slate-600">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Bảo hành chính hãng 24 tháng</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Trả góp 0% qua thẻ tín dụng</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Miễn phí giao hàng toàn quốc</li>
                                </ul>

                                {/* CTA Buttons */}
                                <div className="flex flex-col gap-3 pt-2">
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

                                {/* Promotions Box */}
                                <div className="rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
                                        <h3 className="font-bold text-xs uppercase tracking-widest flex items-center gap-2 text-blue-800">
                                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>
                                            Khuyến mãi đặc biệt
                                        </h3>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">1</span></div>
                                            <p className="text-sm text-slate-700 leading-snug">Nhập mã <strong className="text-blue-600">LMC500</strong> giảm ngay 500.000đ khi thanh toán qua VNPay-QR.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">2</span></div>
                                            <p className="text-sm text-slate-700 leading-snug">Miễn phí giao hàng toàn quốc.</p>
                                        </div>
                                        <div className="flex items-start gap-3">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5"><span className="text-[10px] font-bold">3</span></div>
                                            <p className="text-sm text-slate-700 leading-snug">Tặng gói bảo dưỡng, vệ sinh PC miễn phí trọn đời.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ===== BOTTOM SECTION: Description + Specs + News ===== */}
                    <div className="lg:grid gap-8" style={{ gridTemplateColumns: '62% 1fr' }}>
                        {/* Left: Description */}
                        <div>
                            {product.description && (
                                <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-6 lg:p-8 border-b border-slate-100">
                                        <h3 className="text-xl font-bold">Mô tả chi tiết sản phẩm</h3>
                                    </div>
                                    <div className="p-6 lg:p-8">
                                        <ExpandableDescription content={product.description} />
                                    </div>
                                </section>
                            )}
                        </div>

                        {/* Right: Specs + News */}
                        <div className="space-y-6 mt-6 lg:mt-0">
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
                        <section className="mt-16">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-bold">Sản phẩm tương tự</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
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
                        </section>
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
