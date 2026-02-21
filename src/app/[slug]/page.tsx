import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG, GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/ui/AddToCartButton";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryFilterSort } from "@/components/ui/CategoryFilterSort";

// ISR config
export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { data } = await wpgraphqlFetch<any>(GET_NODE_BY_SLUG, {
        slugId: slug,
        slugStr: slug
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
    searchParams: Promise<{ after?: string, minPrice?: string, maxPrice?: string, sort?: string }>
}) {
    const { slug } = await params;
    const resolvedSearchParams = await searchParams;

    const after = resolvedSearchParams.after || "";
    const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : null;
    const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : null;
    const sort = resolvedSearchParams.sort || "date-desc";

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
        orderBy
    });

    // --- TRƯỜNG HỢP: SẢN PHẨM ---
    if (nodeData?.product) {
        const product = nodeData.product;
        const imageUrl = product.image?.sourceUrl || "";

        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-12">
                    <div className="w-full md:w-1/2">
                        {imageUrl ? (
                            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 mb-4">
                                <Image
                                    src={imageUrl}
                                    alt={product.image?.altText || product.name}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    priority
                                />
                            </div>
                        ) : (
                            <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-4">No Image</div>
                        )}
                        {product.galleryImages?.nodes?.length > 0 && (
                            <div className="grid grid-cols-4 gap-4 mt-4">
                                {product.galleryImages.nodes.map((img: any, idx: number) => (
                                    <div key={idx} className="relative aspect-square cursor-pointer overflow-hidden rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                                        <Image src={img.sourceUrl} alt={img.altText || `Gallery image ${idx}`} fill className="object-cover" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="w-full md:w-1/2 flex flex-col">
                        <nav className="text-sm text-gray-500 mb-4">
                            Trang chủ / {product.productCategories?.nodes?.[0]?.name} / {product.name}
                        </nav>
                        <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>
                        <div className="flex items-center gap-4 mb-6">
                            <span className="text-3xl font-bold text-red-600">{product.price || product.regularPrice || "Liên hệ"}</span>
                        </div>
                        <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md font-medium text-sm mb-8 w-max">
                            Tình trạng: {product.stockStatus === 'IN_STOCK' ? 'Còn hàng' : 'Hết hàng'}
                        </div>
                        {product.shortDescription && (
                            <div className="prose prose-sm text-gray-600 mb-8 max-w-none border-b border-gray-200 pb-8" dangerouslySetInnerHTML={{ __html: product.shortDescription }} />
                        )}
                        <div className="mt-auto pt-8">
                            <AddToCartButton
                                id={product.id}
                                databaseId={product.databaseId}
                                name={product.name}
                                price={product.price || product.regularPrice || "0"}
                                imageUrl={imageUrl}
                                slug={product.slug}
                                stockStatus={product.stockStatus || "IN_STOCK"}
                            />
                        </div>
                    </div>
                </div>
                {product.description && (
                    <div className="mt-16 pt-16 border-t border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900 mb-8">Thông tin chi tiết</h2>
                        <div className="prose max-w-none text-gray-700 w-full" dangerouslySetInnerHTML={{ __html: product.description }} />
                    </div>
                )}
            </div>
        );
    }

    // --- TRƯỜNG HỢP: DANH MỤC ---
    if (nodeData?.productCategory) {
        const category = nodeData.productCategory;
        const products = nodeData.categoryProducts?.nodes || [];
        const pageInfo = nodeData.categoryProducts?.pageInfo;

        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 border-b border-gray-200 pb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                    {category.description && (
                        <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: category.description }} />
                    )}
                </div>
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="w-full lg:w-1/4 lg:flex-shrink-0">
                        <CategoryFilterSort />
                    </div>
                    <div className="w-full lg:w-3/4">
                        {products.length === 0 ? (
                            <div className="bg-gray-50 rounded-lg py-16 text-center text-gray-500">
                                Không tìm thấy sản phẩm nào.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    {products.map((p: any) => (
                                        <ProductCard
                                            key={p.id}
                                            id={p.id}
                                            databaseId={p.databaseId}
                                            name={p.name}
                                            price={p.price || p.regularPrice || "Liên hệ"}
                                            imageUrl={p.image?.sourceUrl || ""}
                                            slug={p.slug}
                                        />
                                    ))}
                                </div>
                                {pageInfo?.hasNextPage && (
                                    <div className="mt-12 flex justify-center">
                                        <a
                                            href={`/${slug}?after=${pageInfo.endCursor}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${sort !== 'date-desc' ? `&sort=${sort}` : ''}`}
                                            className="px-6 py-3 border border-gray-300 rounded hover:bg-gray-50 font-medium"
                                        >
                                            Tải thêm
                                        </a>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // --- TRƯỜNG HỢP: KHÔNG TÌM THẤY ---
    notFound();
}
