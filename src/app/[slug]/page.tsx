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
// Cho phép các slug không có trong generateStaticParams vẫn được render on-demand và cache lại.
export const dynamicParams = true;

/**
 * 1. HÀM GENERATE STATIC PARAMS
 *    - Trên server production: Pre-build 100 sản phẩm & danh mục mới nhất.
 *    - Trên máy dev (không kết nối được WP API): Trả về mảng rỗng, ISR xử lý toàn bộ.
 *    - Các trang còn lại luôn được render & cache on-demand (ISR).
 */
export async function generateStaticParams() {
    try {
        const allParams: { slug: string }[] = [];

        // Chỉ lấy 100 sản phẩm mới nhất để build trước (tránh timeout)
        const productQuery = `
            query GetTopProductSlugs {
                products(first: 100) {
                    nodes { slug }
                }
            }
        `;
        const rawProducts: any = await wpgraphqlFetch<any>(productQuery);
        rawProducts?.data?.products?.nodes?.forEach((p: any) => {
            if (p.slug) allParams.push({ slug: p.slug });
        });

        // Lấy toàn bộ danh mục (nhỏ gọn, không timeout)
        const catQuery = `
            query GetAllCategorySlugs {
                productCategories(first: 200) {
                    nodes { slug }
                }
            }
        `;
        const rawCats: any = await wpgraphqlFetch<any>(catQuery);
        rawCats?.data?.productCategories?.nodes?.forEach((c: any) => {
            if (c.slug) allParams.push({ slug: c.slug });
        });

        console.log(`✅ Pre-build: ${allParams.length} trang. Còn lại sẽ cache ISR khi người dùng truy cập.`);
        return allParams;
    } catch (error: any) {
        // Nếu không kết nối được WordPress API (VD: build local), bỏ qua và để ISR xử lý tất cả.
        console.warn("⚠️ Không thể kết nối WordPress API lúc build. ISR sẽ xử lý tất cả trang on-demand:", error?.message);
        return [];
    }
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
        const cleanPrice = (priceStr: string) => priceStr?.replace(/&nbsp;/g, " ").trim() || "Liên hệ";
        const displayPrice = cleanPrice(product.price || product.regularPrice);
        const imageUrl = product.image?.sourceUrl || "";

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
                        <div className="lg:grid gap-8 items-start" style={{ gridTemplateColumns: '62% 38%' }}>
                            <ProductGallery
                                mainImage={product.image}
                                galleryNodes={product.galleryImages?.nodes || []}
                                name={product.name}
                                salePrice={product.salePrice}
                                regularPrice={product.regularPrice}
                            />
                            <div className="space-y-6">
                                <h1 className="text-2xl font-bold text-slate-900">{product.name}</h1>
                                <ProductSpecs shortDescription={product.shortDescription} attributes={product.attributes} />
                                <div className="bg-slate-50 p-5 rounded-xl border border-slate-100">
                                    <div className="bg-gradient-to-r from-red-600 to-purple-600 p-4 rounded-xl text-center">
                                        <span className="text-white text-3xl font-black">{displayPrice}</span>
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

                    <div className="lg:grid gap-8" style={{ gridTemplateColumns: '62% 1fr' }}>
                        <div className="bg-white rounded-xl border border-slate-200 p-6">
                            <h3 className="text-xl font-bold mb-4">Mô tả sản phẩm</h3>
                            <ExpandableDescription content={product.description} />
                        </div>
                        <div className="space-y-6">
                            {/* ĐÃ FIX LỖI THIẾU PROPS Ở ĐÂY */}
                            <DetailedSpecsTable
                                attributes={product.attributes}
                                acfDetailedSpecs={product.thongsokythuatsonbn?.thongsochitiet || ''}
                                shortDescription={product.shortDescription}
                            />
                            <RelatedNews />
                        </div>
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

        while (hasMorePages && pageNum < 15) { // tối đa 1500 sản phẩm
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