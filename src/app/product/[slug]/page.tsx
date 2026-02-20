import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_PRODUCT_BY_SLUG } from "@/lib/graphql/queries";
import { notFound } from "next/navigation";
import Image from "next/image";
import { AddToCartButton } from "@/components/ui/AddToCartButton";

// Cấu hình ISR cho trang chi tiết sản phẩm
export const revalidate = 3600; // Revalidate mỗi 1 giờ

// Hàm tạo metadata động cho SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { data } = await wpgraphqlFetch<any>(GET_PRODUCT_BY_SLUG, { slug: resolvedParams.slug });
    const product = data?.product;

    if (!product) {
        return { title: 'Không tìm thấy sản phẩm | StoreNext' };
    }

    return {
        title: `${product.name} | StoreNext`,
        description: product.shortDescription?.replace(/<[^>]+>/g, '') || `Mua ngay ${product.name} tại StoreNext với giá tốt nhất!`,
        openGraph: {
            images: [product.image?.sourceUrl || ""],
        },
    };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    const { slug } = resolvedParams;

    // Lấy dữ liệu sản phẩm dựa trên slug
    const { data } = await wpgraphqlFetch<any>(GET_PRODUCT_BY_SLUG, { slug });
    const product = data?.product;

    if (!product) {
        // Hiển thị fallback tĩnh (cho việc test UI khi chưa có dữ liệu)
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex flex-col md:flex-row gap-12">
                    {/* Cột hình ảnh (Fallback) */}
                    <div className="w-full md:w-1/2">
                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                            No Image Data
                        </div>
                    </div>
                    {/* Cột thông tin (Fallback) */}
                    <div className="w-full md:w-1/2">
                        <h1 className="text-3xl font-bold text-gray-900 mb-4">Sản Phẩm Mẫu (Fallback: {slug})</h1>
                        <p className="text-2xl font-bold text-blue-600 mb-6">1.000.000₫</p>
                        <div className="prose text-gray-700 mb-8 w-full">
                            Không thể kết nối đến WPGraphQL để lấy chi tiết sản phẩm này. Đây là nội dung mẫu.
                        </div>

                        <div className="flex flex-col gap-4 w-full md:w-auto">
                            <AddToCartButton
                                id="fallback-1"
                                databaseId={12345}
                                name={`Sản Phẩm Mẫu (Fallback: ${slug})`}
                                price="1.000.000₫"
                                imageUrl=""
                                slug={slug}
                                stockStatus="IN_STOCK"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const imageUrl = product.image?.sourceUrl || "";

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex flex-col md:flex-row gap-12">

                {/* Hình ảnh sản phẩm */}
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
                        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 mb-4">
                            No Image
                        </div>
                    )}

                    {/* Gallery (Nếu có) */}
                    {product.galleryImages?.nodes?.length > 0 && (
                        <div className="grid grid-cols-4 gap-4 mt-4">
                            {product.galleryImages.nodes.map((img: any, idx: number) => (
                                <div key={idx} className="relative aspect-square cursor-pointer overflow-hidden rounded-md border border-gray-200 hover:border-blue-500 transition-colors">
                                    <Image
                                        src={img.sourceUrl}
                                        alt={img.altText || `Gallery image ${idx}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Thông tin sản phẩm */}
                <div className="w-full md:w-1/2 flex flex-col">
                    <nav className="text-sm text-gray-500 mb-4">
                        Trang chủ / Sản phẩm {product.productCategories?.nodes?.[0] ? `/ ${product.productCategories.nodes[0].name}` : ''} / {product.name}
                    </nav>

                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">{product.name}</h1>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-bold text-red-600">
                            {product.price || product.regularPrice || "Liên hệ"}
                        </span>
                        {product.regularPrice && product.salePrice && (
                            <span className="text-xl text-gray-400 line-through">
                                {product.regularPrice}
                            </span>
                        )}
                    </div>

                    <div className="bg-green-50 text-green-700 px-4 py-2 rounded-md font-medium text-sm mb-8 w-max">
                        Tình trạng: {product.stockStatus === 'IN_STOCK' ? 'Còn hàng' : 'Hết hàng hoặc Liên hệ'}
                    </div>

                    {/* Short description */}
                    {product.shortDescription && (
                        <div
                            className="prose prose-sm text-gray-600 mb-8 max-w-none border-b border-gray-200 pb-8"
                            dangerouslySetInnerHTML={{ __html: product.shortDescription }}
                        />
                    )}

                    {/* Biến thể sản phẩm (VD: Size, Màu sắc...) */}
                    {product.attributes?.nodes && product.attributes.nodes.length > 0 && (
                        <div className="mb-8 space-y-4">
                            {product.attributes.nodes.map((attr: any, idx: number) => (
                                <div key={idx}>
                                    <h3 className="font-semibold text-gray-900 mb-2 uppercase text-sm">{attr.name}</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {attr.options.map((option: string, i: number) => (
                                            <button key={i} className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-blue-600 hover:text-blue-600 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none focus:border-blue-600 bg-white">
                                                {option}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Action buttons */}
                    <div className="mt-auto pt-8">
                        <AddToCartButton
                            id={product.id}
                            databaseId={product.databaseId}
                            name={product.name}
                            price={product.price || product.regularPrice || "0"}
                            imageUrl={product.image?.sourceUrl || ""}
                            slug={product.slug}
                            stockStatus={product.stockStatus || "IN_STOCK"}
                        />
                    </div>
                </div>
            </div>

            {/* Product Long Description */}
            {product.description && (
                <div className="mt-16 pt-16 border-t border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">Thông tin chi tiết</h2>
                    <div
                        className="prose max-w-none text-gray-700 w-full lg:w-2/3"
                        dangerouslySetInnerHTML={{ __html: product.description }}
                    />
                </div>
            )}
        </div>
    );
}
