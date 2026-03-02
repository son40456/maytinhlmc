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

// Cấu hình ISR: Tự động cập nhật lại trang sau mỗi 1 tiếng nếu có thay đổi từ WP
export const revalidate = 3600;

/**
 * 1. HÀM GENERATE STATIC PARAMS
 * Giúp render HTML tĩnh tại thời điểm build (SSG).
 * Next.js sẽ gọi hàm này để biết những slug nào cần được tạo file HTML sẵn.
 */
export async function generateStaticParams() {
    const query = `
        query GetAllSlugs {
            products(first: 100) {
                nodes { slug }
            }
            productCategories(first: 100) {
                nodes { slug }
            }
        }
    `;

    try {
        const { data } = await wpgraphqlFetch<any>(query);

        const productSlugs = data?.products?.nodes?.map((p: any) => ({
            slug: p.slug,
        })) || [];

        const categorySlugs = data?.productCategories?.nodes?.map((c: any) => ({
            slug: c.slug,
        })) || [];

        // Kết hợp tất cả slug sản phẩm và danh mục
        return [...productSlugs, ...categorySlugs];
    } catch (error) {
        console.error("Error generating static params:", error);
        return []; // Trả về mảng rỗng nếu lỗi để tránh crash build
    }
}

/**
 * 2. HÀM GENERATE METADATA
 */
export async function generateMetadata({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const systemParams = ['after', 'minPrice', 'maxPrice', 'sort'];
    const taxFilters = Object.entries(resolvedSearchParams)
        .filter(([key]) => !systemParams.includes(key))
        .map(([key, value]) => {
            if (!value || typeof value !== 'string') return null;
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

/**
 * 3. MAIN PAGE COMPONENT
 */
export default async function SlugPage({ params, searchParams }: {
    params: Promise<{ slug: string }>,
    searchParams: Promise<{ [key: string]: string | undefined }>
}) {
    // Await params theo chuẩn Next.js 15
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const after = resolvedSearchParams.after || "";
    const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : null;
    const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : null;
    const sort = resolvedSearchParams.sort || "date-desc";

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

    // --- TRƯỜNG HỢP: SẢN PHẨM ---
    if (nodeData?.product) {
        const product = nodeData.product;
        const cleanPrice = (priceStr: string) => priceStr?.replace(/&nbsp;/g, " ").trim() || "Liên hệ";
        const displayPrice = cleanPrice(product.price || product.regularPrice);
        const imageUrl = product.image?.sourceUrl || "";

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
                <div className="max-w-[1600px] mx-auto px-3 md:px-4 py-2 md:py-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 md:gap-2 text-[11px] md:text-xs text-slate-500 mb-3 md:mb-6 overflow-x-auto whitespace-nowrap">
                        <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                        <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                        {product.productCategories?.nodes?.[0] && (
                            <>
                                <Link href={`/${product.productCategories.nodes[0].slug}`} className="hover:text-blue-600 transition-colors">
                                    {product.productCategories.nodes[0].name}
                                </Link>
                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                            </>
                        )}
                        <span className="text-slate-900 font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="bg-white rounded-lg md:rounded-xl border border-slate-200 p-3 md:p-6 lg:p-8 mb-4 md:mb-8">
                        <div className="lg:grid gap-8 items-start" style={{ gridTemplateColumns: '62% 38%' }}>
                            <div className="lg:sticky lg:top-[88px] space-y-3 md:space-y-4">
                                <ProductGallery
                                    mainImage={product.image}
                                    galleryNodes={product.galleryImages?.nodes || []}
                                    name={product.name}
                                    salePrice={product.salePrice}
                                    regularPrice={product.regularPrice}
                                />
                                {/* Action Bar */}
                                <div className="hidden md:flex bg-slate-50 rounded-xl p-3 items-center justify-around">
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

                            <div className="space-y-4 md:space-y-6 mt-4 lg:mt-0 lg:pr-2">
                                <div>
                                    <h1 className="text-lg md:text-2xl font-bold text-slate-900 mb-2 md:mb-3 leading-tight">{product.name}</h1>
                                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm mb-3 md:mb-4 flex-wrap">
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

                                <div className="border-t border-b border-slate-100 py-4">
                                    <ProductSpecs shortDescription={product.shortDescription} attributes={product.attributes} />
                                </div>

                                <div className="bg-slate-50 p-3 md:p-5 rounded-lg md:rounded-xl border border-slate-100">
                                    {savings && (
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-slate-400 text-sm">Giá niêm yết: <span className="line-through">{cleanPrice(product.regularPrice)}</span></span>
                                            <div className="text-red-600 font-bold text-sm">Tiết kiệm {savings.saved}</div>
                                        </div>
                                    )}
                                    <div className="bg-gradient-to-r from-red-600 to-purple-600 p-3 md:p-4 rounded-lg md:rounded-xl text-center">
                                        <span className="text-white text-2xl md:text-3xl font-black">{displayPrice}</span>
                                        <p className="text-[9px] md:text-[10px] text-white/80 font-bold uppercase tracking-widest mt-0.5 md:mt-1">Giá ưu đãi trực tuyến</p>
                                    </div>
                                </div>

                                <ul className="space-y-1.5 md:space-y-2 text-xs md:text-sm text-slate-600">
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Bảo hành chính hãng 24 tháng</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Trả góp 0% qua thẻ tín dụng</li>
                                    <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>Miễn phí giao hàng toàn quốc</li>
                                </ul>

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
                        </div>
                    </div>

                    <div className="lg:grid gap-4 md:gap-8 items-start mt-4 md:mt-0" style={{ gridTemplateColumns: '62% 1fr' }}>
                        <div className="lg:sticky lg:top-[88px]">
                            {product.description && (
                                <section className="bg-white rounded-lg md:rounded-xl border border-slate-200 overflow-hidden">
                                    <div className="p-4 md:p-6 lg:p-8 border-b border-slate-100">
                                        <h3 className="text-base md:text-xl font-bold">Mô tả chi tiết sản phẩm</h3>
                                    </div>
                                    <div className="p-4 md:p-6 lg:p-8">
                                        <ExpandableDescription content={product.description} />
                                    </div>
                                </section>
                            )}
                        </div>
                        <div className="space-y-4 md:space-y-6 mt-4 md:mt-6 lg:mt-0 lg:sticky lg:top-[88px]">
                            <DetailedSpecsTable
                                shortDescription={product.shortDescription}
                                attributes={product.attributes}
                                acfDetailedSpecs={product.thongsokythuatsonbn?.thongsochitiet || ''}
                            />
                            <RelatedNews />
                        </div>
                    </div>

                    {product.related?.nodes && product.related.nodes.length > 0 && (
                        <section className="mt-8 md:mt-16">
                            <h3 className="text-lg md:text-2xl font-bold mb-8">Sản phẩm tương tự</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-6">
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

        const { data: filterData } = await wpgraphqlFetch<any>(GET_CATEGORY_FILTERS, { slugId: slug, slugStr: slug });

        const availableFilters: any[] = [];
        const seenAttrs = new Set();

        filterData?.filterDiscovery?.nodes?.forEach((p: any) => {
            p.attributes?.nodes?.forEach((attr: any) => {
                const key = attr.slug || attr.name;
                const terms = attr.terms?.nodes || [];
                if (!seenAttrs.has(key)) {
                    seenAttrs.add(key);
                    const displaySlug = key.startsWith('pa_') ? key.slice(3) : key;
                    availableFilters.push({
                        name: attr.label || attr.name,
                        slug: displaySlug,
                        rawSlug: key,
                        options: terms.map((t: any) => ({
                            slug: t.slug,
                            name: t.name,
                            logo: t.logo?.logo?.node?.sourceUrl
                        }))
                    });
                }
            });
        });

        // Hậu xử lý sắp xếp khoảng giá
        availableFilters.forEach((filter: any) => {
            if (filter.slug.includes('khoang-gia')) {
                filter.options.sort((a: any, b: any) => {
                    const extractMin = (s: string) => parseInt(s.replace('duoi-', '0-').replace('tren-', '999-').split('-')[0]) || 0;
                    return extractMin(a.slug) - extractMin(b.slug);
                });
            }
        });

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

    notFound();
}