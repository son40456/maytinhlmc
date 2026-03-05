import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";

// Components
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { CategoryProductView } from "@/components/category/CategoryProductView";
import { DetailedSpecsTable } from "@/components/product/DetailedSpecsTable";
import { RelatedNews } from "@/components/product/RelatedNews";
import { ExpandableDescription } from "@/components/product/ExpandableDescription";

// ISR: Các trang đã build sẽ được phục vụ như HTML tĩnh, cache làm mới sau 1 tiếng.
export const revalidate = 3600;
export const dynamicParams = true;

/**
 * Warm-up approach: generateStaticParams trả về [] → build cực nhanh (~2-3 phút).
 * Sau khi deploy, chạy script `node scripts/warmup.js` để tự động cache toàn bộ trang qua ISR.
 */
export async function generateStaticParams() {
    return [];
}


/**
 * 2. GENERATE METADATA
 */
export async function generateMetadata({ params }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    const { data } = await wpgraphqlFetch<any>(GET_NODE_BY_SLUG, {
        slugId: slug,
        slugStr: slug,
        taxFilters: null
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
 * 3. MAIN PAGE
 */
export default async function SlugPage({ params }: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params;

    // Xóa bỏ searchParams ở Server Component để cho phép Build Tĩnh (SSG) hoàn toàn.
    // Việc lọc (filter) và sắp xếp (sort) sẽ được Client Component (CategoryProductView) xử lý sau khi load.
    const { data: nodeData } = await wpgraphqlFetch<any>(GET_NODE_BY_SLUG, {
        slugId: slug,
        slugStr: slug,
        first: 24,
        after: "",
        minPrice: null,
        maxPrice: null,
        orderBy: [{ field: "DATE", order: "DESC" }],
        taxFilters: null
    });

    if (nodeData?.product) {
        const product = nodeData.product;
        const cleanPrice = (priceStr: string) => priceStr?.replace(/&nbsp;/g, " ").trim() || "";
        const displayPrice = cleanPrice(product.salePrice || product.price || product.regularPrice) || "Liên hệ";
        const regularPrice = cleanPrice(product.regularPrice);
        const salePrice = cleanPrice(product.salePrice);
        const imageUrl = product.image?.sourceUrl || "";
        const parseVND = (s: string) => parseInt(s?.replace(/[^\d]/g, "") || "0") || 0;
        const regularNum = parseVND(regularPrice);
        const saleNum = parseVND(salePrice);
        const hasDiscount = saleNum > 0 && regularNum > 0 && saleNum < regularNum;
        const discountPct = hasDiscount ? Math.round((1 - saleNum / regularNum) * 100) : 0;
        const savingsAmount = hasDiscount ? (regularNum - saleNum).toLocaleString("vi-VN") + "₫" : "";
        const relatedProducts = product.related?.nodes || [];

        return (
            <div className="bg-[#f8fafc] min-h-screen pb-16">
                <div className="max-w-[1600px] mx-auto px-3 md:px-4 py-2 md:py-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center gap-1.5 md:gap-2 text-xs text-slate-500 mb-6">
                        <Link href="/" className="hover:text-blue-600">Trang chủ</Link>
                        <span>/</span>
                        <span className="text-slate-900 font-medium truncate">{product.name}</span>
                    </nav>

                    <div className="bg-white rounded-xl border border-slate-200 p-6 md:p-8 mb-8">
                        <div className="lg:grid gap-8" style={{ gridTemplateColumns: '62% 38%', alignItems: 'start' }}>
                            {/* Gallery sticky: dính trong khi scroll qua nội dung bên phải */}
                            <div className="sticky" style={{ top: '104px' }}>
                                <ProductGallery
                                    mainImage={product.image}
                                    galleryNodes={product.galleryImages?.nodes || []}
                                    name={product.name}
                                    salePrice={product.salePrice}
                                    regularPrice={product.regularPrice}
                                />
                            </div>
                            <div className="space-y-5">
                                <h1 className="text-xl md:text-2xl font-bold text-slate-900 leading-snug">{product.name}</h1>
                                <ProductSpecs shortDescription={product.shortDescription} attributes={product.attributes} />

                                {/* === GIÁ SẢN PHẨM === */}
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-4 space-y-3">
                                    <div className="flex items-end gap-3 flex-wrap">
                                        <span className="text-3xl md:text-4xl font-black text-red-600 leading-none">{displayPrice}</span>
                                        {hasDiscount && (
                                            <span className="text-base text-slate-400 line-through leading-none pb-1">{regularPrice}</span>
                                        )}
                                        {hasDiscount && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">-{discountPct}%</span>
                                        )}
                                    </div>
                                    {hasDiscount && (
                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="text-slate-500">Tiết kiệm:</span>
                                            <span className="font-bold text-green-600">{savingsAmount}</span>
                                        </div>
                                    )}
                                    {/* Khung khuyến mại */}
                                    <div className="border border-red-200 rounded-xl overflow-hidden">
                                        <div className="bg-red-600 px-3 py-1.5 flex items-center gap-2">
                                            <span className="text-yellow-300 text-sm">🎁</span>
                                            <span className="text-white text-xs font-bold tracking-wide uppercase">Khuyến mại áp dụng</span>
                                        </div>
                                        <ul className="bg-white px-4 py-3 space-y-2 text-[13px] text-slate-700">
                                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 flex-shrink-0">✔</span><span>Bảo hành chính hãng tại trung tâm hỗ trợ kỹ thuật LMC</span></li>
                                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 flex-shrink-0">✔</span><span>Đổi trả trong <strong>7 ngày</strong> nếu lỗi do nhà sản xuất</span></li>
                                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5 flex-shrink-0">✔</span><span>Giao hàng toàn quốc — Nhận hàng kiểm tra trước khi thanh toán</span></li>
                                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5 flex-shrink-0">✔</span><span>Hỗ trợ trả góp <strong>0%</strong> qua thẻ tín dụng</span></li>
                                        </ul>
                                    </div>
                                </div>

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

                    <div className="lg:grid gap-8 mb-8" style={{ gridTemplateColumns: '62% 1fr' }}>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                            <ExpandableDescription content={product.description} />
                        </div>
                        <div className="space-y-6">
                            <DetailedSpecsTable
                                attributes={product.attributes}
                                acfDetailedSpecs={product.thongsokythuatsonbn?.thongsochitiet || ''}
                                shortDescription={product.shortDescription}
                            />
                            <RelatedNews />
                        </div>
                    </div>

                    {/* === SẢN PHẨM LIÊN QUAN === */}
                    {relatedProducts.length > 0 && (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 mb-8">
                            <h2 className="text-lg md:text-xl font-bold text-slate-900 mb-5 flex items-center gap-2">
                                <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
                                Sản phẩm liên quan
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
                                {relatedProducts.map((rp: any) => {
                                    const rpClean = (s: string) => s?.replace(/&nbsp;/g, " ").trim() || "";
                                    const rpSale = rpClean(rp.salePrice);
                                    const rpRegular = rpClean(rp.regularPrice);
                                    const rpDisplay = rpSale || rpClean(rp.price) || "Liên hệ";
                                    const rpSaleNum = parseVND(rpSale);
                                    const rpRegularNum = parseVND(rpRegular);
                                    const rpHasDiscount = rpSaleNum > 0 && rpRegularNum > 0 && rpSaleNum < rpRegularNum;
                                    return (
                                        <Link key={rp.id} href={`/${rp.slug}`}
                                            className="group flex flex-col rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all overflow-hidden">
                                            <div className="relative aspect-square overflow-hidden bg-white">
                                                {rp.image?.sourceUrl ? (
                                                    <Image src={rp.image.sourceUrl} alt={rp.name} fill
                                                        className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                                        sizes="(max-width: 640px) 50vw, 16vw" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-slate-300 text-4xl">📦</div>
                                                )}
                                                {rpHasDiscount && (
                                                    <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                                        -{Math.round((1 - rpSaleNum / rpRegularNum) * 100)}%
                                                    </span>
                                                )}
                                            </div>
                                            <div className="p-2.5 flex flex-col gap-1">
                                                <p className="text-[12px] text-slate-700 line-clamp-2 font-medium leading-snug group-hover:text-blue-700">{rp.name}</p>
                                                <p className="text-sm font-black text-red-600">{rpDisplay}</p>
                                                {rpHasDiscount && <p className="text-[11px] text-slate-400 line-through">{rpRegular}</p>}
                                            </div>
                                        </Link>
                                    );
                                })}
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
        );
    }

    if (nodeData?.productCategory) {
        const category = nodeData.productCategory;
        const products = nodeData.categoryProducts?.nodes || [];
        const pageInfo = nodeData.categoryProducts?.pageInfo;

        // Fetch filter attributes server-side with pagination (thἀm tất cả SP, không bị giới hạn 100 items)
        const FILTER_QUERY = `
            query GetCategoryFiltersPage($slugStr: String!, $after: String) {
                filterDiscovery: products(
                    first: 100,
                    after: $after,
                    where: { categoryIn: [$slugStr] }
                ) {
                    pageInfo { hasNextPage endCursor }
                    nodes {
                        ... on SimpleProduct {
                            attributes {
                                nodes {
                                    name label
                                    ... on GlobalProductAttribute {
                                        slug
                                        terms {
                                            nodes {
                                                name slug
                                                ... on PaThuongHieu {
                                                    logo { logo { node { sourceUrl } } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        ... on VariableProduct {
                            attributes {
                                nodes {
                                    name label
                                    ... on GlobalProductAttribute {
                                        slug
                                        terms {
                                            nodes {
                                                name slug
                                                ... on PaThuongHieu {
                                                    logo { logo { node { sourceUrl } } }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        `;

        // attrMap: key = rawSlug, value = { filterEntry, seenTermSlugs }
        const attrMap = new Map<string, { entry: any; seenTerms: Set<string> }>();
        const availableFilters: any[] = [];
        let hasMorePages = true;
        let afterCursor: string | null = null;
        let pageNum = 0;

        // Lúc build SSG: limit 1 trang → build nhanh (ISR sẽ tự revalidate với full filter sau)
        // Lúc ISR revalidate: paginate đầy đủ 15 trang (1500 SP) → filter hoàn chỉnh
        const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';
        const maxFilterPages = isBuildPhase ? 1 : 15;

        while (hasMorePages && pageNum < maxFilterPages) {
            const { data: fd }: any = await wpgraphqlFetch<any>(FILTER_QUERY, {
                slugStr: slug,
                after: afterCursor,
            });
            const nodes = fd?.filterDiscovery?.nodes || [];
            hasMorePages = fd?.filterDiscovery?.pageInfo?.hasNextPage ?? false;
            afterCursor = fd?.filterDiscovery?.pageInfo?.endCursor ?? null;
            pageNum++;

            nodes.forEach((p: any) => {
                p.attributes?.nodes?.forEach((attr: any) => {
                    // Chỉ xử lý GlobalProductAttribute (có slug)
                    if (!attr.slug) return;
                    const key: string = attr.slug;

                    const newTerms = (attr.terms?.nodes || []).map((t: any) => ({
                        slug: t.slug,
                        name: t.name,
                        logo: t.logo?.logo?.node?.sourceUrl ?? null,
                    }));

                    if (!attrMap.has(key)) {
                        // Lần đầu gặp attribute này — tạo mới
                        const entry = {
                            name: attr.label || attr.name,
                            slug: key.startsWith('pa_') ? key.slice(3) : key,
                            rawSlug: key,
                            options: [] as any[],
                        };
                        const seenTerms = new Set<string>();

                        newTerms.forEach((term: any) => {
                            if (term.slug && !seenTerms.has(term.slug)) {
                                seenTerms.add(term.slug);
                                entry.options.push(term);
                            }
                        });

                        attrMap.set(key, { entry, seenTerms });
                        availableFilters.push(entry);
                    } else {
                        // Đã gặp attribute này — MERGE thêm terms mới (logic chính!)
                        const { entry, seenTerms } = attrMap.get(key)!;
                        newTerms.forEach((term: any) => {
                            if (term.slug && !seenTerms.has(term.slug)) {
                                seenTerms.add(term.slug);
                                entry.options.push(term);
                            }
                        });
                    }
                });
            });
        }

        return (
            <div className="container mx-auto px-4 py-12">
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