import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG, GET_CATEGORY_FILTERS } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// Components
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { CategoryFilterSort } from "@/components/ui/CategoryFilterSort";
import { ProductGallery } from "@/components/product/ProductGallery";
import { ProductSpecs } from "@/components/product/ProductSpecs";
import { StickyBuyBar } from "@/components/product/StickyBuyBar";
import { CategoryProductView } from "@/components/category/CategoryProductView";
import { ProductCard } from "@/components/ui/ProductCard";
import { DetailedSpecsTable } from "@/components/product/DetailedSpecsTable";
import { RelatedNews } from "@/components/product/RelatedNews";
import { ExpandableDescription } from "@/components/product/ExpandableDescription";

export const revalidate = 3600;

/**
 * Định nghĩa Interface cho Product Slugs
 */
interface WpSlugResponse {
    products: {
        pageInfo: {
            hasNextPage: boolean;
            endCursor: string | null;
        };
        nodes: { slug: string }[];
    };
}

/**
 * 1. HÀM GENERATE STATIC PARAMS (BUILD TOÀN BỘ SẢN PHẨM)
 */
export async function generateStaticParams() {
    const allParams: { slug: string }[] = [];
    let hasNextPage = true;
    let afterCursor: string | null = null;

    console.log("🚀 Bắt đầu quét toàn bộ slugs từ WordPress...");

    try {
        while (hasNextPage) {
            const query = `
                query GetAllProductSlugs($after: String) {
                    products(first: 100, after: $after) {
                        pageInfo {
                            hasNextPage
                            endCursor
                        }
                        nodes {
                            slug
                        }
                    }
                }
            `;

            // Bypass TypeScript inference error in loops
            const rawResult: any = await wpgraphqlFetch<any>(query, { after: afterCursor });
            const data = rawResult?.data as WpSlugResponse | undefined;

            if (data?.products?.nodes) {
                data.products.nodes.forEach((p) => {
                    if (p.slug) allParams.push({ slug: p.slug });
                });
            }

            hasNextPage = data?.products?.pageInfo?.hasNextPage || false;
            afterCursor = data?.products?.pageInfo?.endCursor || null;

            console.log(`📦 Đã lấy được ${allParams.length} slugs sản phẩm...`);
        }

        // Lấy thêm danh mục
        const catQuery = `
            query GetAllCategorySlugs {
                productCategories(first: 100) {
                    nodes { slug }
                }
            }
        `;
        const rawCatRes: any = await wpgraphqlFetch<any>(catQuery);
        const categories = rawCatRes?.data?.productCategories?.nodes || [];

        categories.forEach((c: any) => {
            if (c.slug) allParams.push({ slug: c.slug });
        });

        console.log(`✅ Hoàn tất! Tổng cộng có ${allParams.length} trang.`);
        return allParams;
    } catch (error) {
        console.error("❌ Lỗi build Static Params:", error);
        return [];
    }
}

/**
 * 2. GENERATE METADATA
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
            return { taxonomy, terms: [value], operator: 'IN' };
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
 * 3. MAIN PAGE
 */
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

    const systemParams = ['after', 'minPrice', 'maxPrice', 'sort'];
    const taxFilters = Object.entries(resolvedSearchParams)
        .filter(([key, value]) => !systemParams.includes(key) && value)
        .map(([key, value]) => {
            const cleanKey = key.startsWith('pa_') ? key.slice(3) : key;
            const taxonomy = `PA_${cleanKey.toUpperCase().replace(/-/g, '_')}`;
            return { taxonomy, terms: [value as string], operator: 'IN' };
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

        const { data: filterData } = await wpgraphqlFetch<any>(GET_CATEGORY_FILTERS, { slugId: slug, slugStr: slug });

        const availableFilters: any[] = [];
        const seenAttrs = new Set();
        filterData?.filterDiscovery?.nodes?.forEach((p: any) => {
            p.attributes?.nodes?.forEach((attr: any) => {
                const key = attr.slug || attr.name;
                if (!seenAttrs.has(key)) {
                    seenAttrs.add(key);
                    availableFilters.push({
                        name: attr.label || attr.name,
                        slug: key.startsWith('pa_') ? key.slice(3) : key,
                        rawSlug: key,
                        options: attr.terms?.nodes?.map((t: any) => ({
                            slug: t.slug,
                            name: t.name,
                            logo: t.logo?.logo?.node?.sourceUrl
                        })) || []
                    });
                }
            });
        });

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