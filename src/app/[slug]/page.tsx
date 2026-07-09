import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import React from "react";
import Image from "next/image";
import Link from "next/link";

// Components
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { BuildPcButton } from "@/components/ui/BuildPcButton";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { CategoryProductView } from "@/components/category/CategoryProductView";
import { DetailedSpecsTable } from "@/components/product/DetailedSpecsTable";
import dynamic from 'next/dynamic';
const RelatedNews = dynamic(() => import('@/components/product/RelatedNews').then(mod => mod.RelatedNews), {
    loading: () => <div className="h-64 bg-white/50 animate-pulse rounded-2xl" />
});
const ExpandableDescription = dynamic(() => import('@/components/product/ExpandableDescription').then(mod => mod.ExpandableDescription));
const ProductReviews = dynamic(() => import('@/components/product/ProductReviews').then(mod => mod.ProductReviews), {
    loading: () => <div className="h-64 bg-white/50 animate-pulse rounded-2xl" />
});
const ProductRatingBadge = dynamic(() => import('@/components/product/ProductRatingBadge').then(mod => mod.ProductRatingBadge));
const RelatedProductsCarousel = dynamic(() => import('@/components/product/RelatedProductsCarousel').then(mod => mod.RelatedProductsCarousel), {
    loading: () => <div className="h-96 bg-white/50 animate-pulse rounded-2xl" />
});
import { generateProductSEO, generateCategorySEO } from "@/utils/seo";
import { ProductSchema } from "@/components/seo/ProductSchema";
import { BreadcrumbSchema } from "@/components/seo/BreadcrumbSchema";

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
        const seo = generateProductSEO(data.product.name, data.product.shortDescription);
        return {
            title: seo.title,
            description: seo.description,
            openGraph: { images: [data.product.image?.sourceUrl || ""] },
        };
    }

    if (data?.productCategory) {
        const seo = generateCategorySEO(data.productCategory.name);
        return {
            title: seo.title,
            description: seo.description,
        };
    }

    if (data?.post) {
        const post = data.post;
        const plainExcerpt = post.excerpt?.replace(/<[^>]+>/g, '').slice(0, 160) || '';
        return {
            title: `${post.title} | LMC`,
            description: plainExcerpt,
            openGraph: { images: [post.featuredImage?.node?.sourceUrl || ''] },
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
        const categories = product.productCategories?.nodes || [];
        let deepestCategory: any = null;
        let maxDepth = -1;
        categories.forEach((cat: any) => {
            const depth = cat.ancestors?.nodes?.length || 0;
            if (depth > maxDepth) {
                maxDepth = depth;
                deepestCategory = cat;
            }
        });

        const breadcrumbs: { name: string, slug: string }[] = [];
        if (deepestCategory) {
            const ancestors = deepestCategory.ancestors?.nodes ? [...deepestCategory.ancestors.nodes].reverse() : [];
            ancestors.forEach((anc: any) => {
                breadcrumbs.push({ name: anc.name, slug: anc.slug });
            });
            breadcrumbs.push({ name: deepestCategory.name, slug: deepestCategory.slug });
        }

        return (
            <div className="bg-[#f8fafc] dark:bg-gray-900 min-h-screen pb-16">
                <ProductSchema
                    name={product.name}
                    description={product.shortDescription || product.description || ''}
                    image={imageUrl}
                    price={saleNum > 0 ? saleNum : regularNum}
                    url={`https://maytinhlmc.vn/${product.slug}`}
                    stockStatus={product.stockStatus || "IN_STOCK"}
                    sku={product.sku}
                />
                <BreadcrumbSchema
                    items={[
                        { name: 'Trang chủ', item: 'https://maytinhlmc.vn/' },
                        ...breadcrumbs.map(bc => ({ name: bc.name, item: `https://maytinhlmc.vn/${bc.slug}` })),
                        { name: product.name, item: `https://maytinhlmc.vn/${product.slug}` }
                    ]}
                />
                <div className="max-w-[1600px] mx-auto px-3 md:px-4 py-2 md:py-4">
                    {/* Breadcrumbs */}
                    <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6">
                        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            <span>Trang chủ</span>
                        </Link>
                        {breadcrumbs.map((bc, idx) => (
                            <React.Fragment key={idx}>
                                <span>/</span>
                                <Link href={`/${bc.slug}`} className="hover:text-blue-600 truncate max-w-[200px]" title={bc.name}>{bc.name}</Link>
                            </React.Fragment>
                        ))}
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[250px] md:max-w-[400px]" title={product.name}>{product.name}</span>
                    </nav>

                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 md:p-6 lg:p-8 mb-4 md:mb-8">
                        <div className="lg:grid gap-6 lg:gap-8" style={{ gridTemplateColumns: '62% 38%', alignItems: 'start' }}>
                            {/* Gallery: sticky chỉ trên lg+ (desktop), không sticky trên mobile để tránh che nội dung */}
                            <div className="lg:sticky" style={{ top: '104px' }}>
                                <ProductGallery
                                    mainImage={product.image}
                                    galleryNodes={product.galleryImages?.nodes || []}
                                    name={product.name}
                                    salePrice={product.salePrice}
                                    regularPrice={product.regularPrice}
                                />
                            </div>

                            {/* Phần thông tin sản phẩm (phải) */}
                            <div className="space-y-3 mt-3 lg:mt-0 lg:pr-4">
                                {/* Tên sản phẩm */}
                                <h1 className="text-base md:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
                                    {product.name}
                                </h1>

                                {/* SKU + Đánh giá */}
                                <ProductRatingBadge productId={product.databaseId} sku={product.sku} />

                                {/* Thông số ngắn */}
                                <ProductSpecs shortDescription={product.shortDescription} attributes={product.attributes} />

                                {/* === KHỐI GIÁ (tách riêng) === */}
                                <div className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/30 border border-red-100 dark:border-red-900/50 rounded-xl p-3 md:p-4">
                                    <div className="flex items-end gap-2 md:gap-3 flex-wrap">
                                        <span className="text-2xl md:text-3xl lg:text-4xl font-black text-red-600 leading-none">
                                            {displayPrice}
                                        </span>
                                        {hasDiscount && (
                                            <span className="text-sm md:text-base text-slate-400 dark:text-slate-500 line-through leading-none pb-0.5">
                                                {regularPrice}
                                            </span>
                                        )}
                                        {hasDiscount && (
                                            <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                                                -{discountPct}%
                                            </span>
                                        )}
                                    </div>
                                    {hasDiscount && (
                                        <div className="flex items-center gap-2 text-sm mt-2">
                                            <span className="text-slate-500">Tiết kiệm:</span>
                                            <span className="font-bold text-green-600">{savingsAmount}</span>
                                        </div>
                                    )}
                                </div>

                                {/* === KHUNG KHUYẾN MẠI (tách riêng) === */}
                                <div className="border border-red-200 rounded-xl overflow-hidden">
                                    <div className="bg-red-600 px-3 py-1.5 flex items-center gap-2">
                                        <span className="text-yellow-300 text-sm">🎁</span>
                                        <span className="text-white text-xs font-bold tracking-wide uppercase">Khuyến mại áp dụng</span>
                                    </div>
                                    <ul className="bg-white px-3 md:px-4 py-2.5 space-y-2 text-[12px] md:text-[13px] text-slate-700">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 flex-shrink-0">✔</span>
                                            <span>Bảo hành chính hãng tại trung tâm hỗ trợ kỹ thuật LMC</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 flex-shrink-0">✔</span>
                                            <span>Đổi trả trong <strong>7 ngày</strong> nếu lỗi do nhà sản xuất</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-0.5 flex-shrink-0">✔</span>
                                            <span>Giao hàng toàn quốc — Nhận hàng kiểm tra trước khi thanh toán</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-blue-500 mt-0.5 flex-shrink-0">✔</span>
                                            <span>Hỗ trợ trả góp <strong>0%</strong> qua thẻ tín dụng</span>
                                        </li>
                                    </ul>
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

                                <BuildPcButton
                                    product={{
                                        id: product.id,
                                        databaseId: product.databaseId,
                                        name: product.name,
                                        price: displayPrice,
                                        imageUrl: imageUrl,
                                        slug: product.slug,
                                        categorySlugs: product.productCategories?.nodes?.map((c: any) => c.slug) || []
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="lg:grid gap-8 mb-8" style={{ gridTemplateColumns: '62% 1fr', alignItems: 'start' }}>
                        <div className="space-y-6">
                            <div className="bg-white rounded-xl border border-slate-200 p-6">
                                <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                                <ExpandableDescription content={product.description} />
                            </div>
                            <div id="reviews">
                                <ProductReviews productId={product.databaseId} productName={product.name} />
                            </div>
                        </div>
                        {/* Specs + Bài viết sticky chỉ trên lg+ */}
                        <div className="lg:sticky space-y-6" style={{ top: '104px' }}>
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
                        <div className="mb-8">
                            <RelatedProductsCarousel products={relatedProducts} />
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
                                                    logo {
                                                        logo {
                                                            node { sourceUrl }
                                                        }
                                                    }
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
                                                    logo {
                                                        logo {
                                                            node { sourceUrl }
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
                <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-slate-400">Đang tải cấu trúc danh mục...</div>}>
                    <CategoryProductView
                        category={category}
                        initialProducts={products}
                        initialPageInfo={pageInfo}
                        availableFilters={availableFilters}
                        categorySlug={slug}
                    />
                </Suspense>
            </div>
        );
    }

    if (nodeData?.post) {
        const post = nodeData.post;
        const formatDate = (dateStr: string) => {
            return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' });
        };

        return (
            <div className="bg-white dark:bg-gray-900 min-h-screen">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    {/* Breadcrumb */}
                    <nav className="flex items-center flex-wrap gap-1.5 md:gap-2 text-sm md:text-base text-slate-500 dark:text-slate-400 mb-6">
                        <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            <span>Trang chủ</span>
                        </Link>
                        <span>/</span>
                        <Link href="/tin-tuc" className="hover:text-blue-600">Tin tức</Link>
                        <span>/</span>
                        <span className="text-slate-900 dark:text-white font-medium truncate max-w-[250px] md:max-w-[400px]">{post.title}</span>
                    </nav>

                    {/* Featured Image */}
                    {post.featuredImage?.node?.sourceUrl && (
                        <div className="relative w-full h-64 md:h-96 mb-8 rounded-2xl overflow-hidden">
                            <Image
                                src={post.featuredImage.node.sourceUrl}
                                alt={post.featuredImage.node.altText || post.title}
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>
                    )}

                    {/* Title */}
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-4">
                        {post.title}
                    </h1>

                    {/* Meta info */}
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400 mb-8 pb-6 border-b border-slate-200 dark:border-slate-700">
                        <span>{formatDate(post.date)}</span>
                        {post.author?.node?.name && (
                            <>
                                <span>•</span>
                                <span>{post.author.node.name}</span>
                            </>
                        )}
                    </div>

                    {/* Content */}
                    <div
                        className="prose prose-slate max-w-none"
                        dangerouslySetInnerHTML={{ __html: post.content || '' }}
                    />
                </div>
            </div>
        );
    }

    notFound();
}// trigger rebuild
