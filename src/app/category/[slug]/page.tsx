import { ProductCard } from "@/components/ui/ProductCard";
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";
import { CategoryFilterSort } from "@/components/ui/CategoryFilterSort";

// Define generateMetadata for SEO later
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = await params;
    return {
        title: `Danh mục: ${resolvedParams.slug} | StoreNext`,
    };
}

export default async function CategoryPage({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ after?: string, minPrice?: string, maxPrice?: string, sort?: string }> }) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;
    const { slug } = resolvedParams;
    const after = resolvedSearchParams.after || "";

    const minPrice = resolvedSearchParams.minPrice ? parseFloat(resolvedSearchParams.minPrice) : null;
    const maxPrice = resolvedSearchParams.maxPrice ? parseFloat(resolvedSearchParams.maxPrice) : null;
    const sort = resolvedSearchParams.sort || "date-desc";

    // Ánh xạ sang cấu trúc của WPGraphQL PostObjectsConnectionOrderbyInput
    let orderBy = [{ field: "DATE", order: "DESC" }];
    if (sort === "price-asc") orderBy = [{ field: "PRICE", order: "ASC" }];
    if (sort === "price-desc") orderBy = [{ field: "PRICE", order: "DESC" }];

    // Fetch từ WPGraphQL với đầy đủ tham số
    const { data } = await wpgraphqlFetch<any>(GET_PRODUCTS_BY_CATEGORY, {
        slugId: slug,
        slugStr: slug,
        first: 12,
        after,
        minPrice,
        maxPrice,
        orderBy
    });
    const category = data?.productCategory;

    if (!category) {
        // Nếu không lấy được dữ liệu từ API, hiển thị một số sản phẩm tĩnh để test UI
        const dummyProducts = Array.from({ length: 8 }).map((_, i) => ({
            id: `dummy-${i}`,
            databaseId: 1000 + i,
            name: `Sản phẩm mẫu ${i + 1} thuộc ${slug}`,
            price: "1.000.000₫",
            imageUrl: "",
            slug: `san-pham-mau-${i + 1}`,
        }));

        return (
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-900 mb-8 capitalize">Danh mục: {slug}</h1>
                <p className="text-gray-500 mb-8">Không thể lấy dữ liệu từ API. Hiển thị dữ liệu giả định.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {dummyProducts.map((product) => (
                        <ProductCard key={product.id} {...product} />
                    ))}
                </div>
            </div>
        );
    }

    const products = data?.products?.nodes || [];
    const pageInfo = data?.products?.pageInfo;

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8 border-b border-gray-200 pb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{category.name}</h1>
                {category.description && (
                    <div className="text-gray-600" dangerouslySetInnerHTML={{ __html: category.description }} />
                )}
            </div>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Sidebar Lọc và Sắp xếp */}
                <div className="w-full lg:w-1/4 lg:flex-shrink-0">
                    <CategoryFilterSort />
                </div>

                {/* Danh sách sản phẩm */}
                <div className="w-full lg:w-3/4">
                    {products.length === 0 ? (
                        <div className="bg-gray-50 border border-gray-100 rounded-lg py-16 text-center">
                            <p className="text-gray-500 text-lg">Không tìm thấy sản phẩm nào trong cấu hình bộ lọc này.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                                {products.map((p: any) => {
                                    const productData = {
                                        id: p.id,
                                        databaseId: p.databaseId,
                                        name: p.name,
                                        price: p.price || p.regularPrice || "Liên hệ",
                                        imageUrl: p.image?.sourceUrl || "",
                                        slug: p.slug,
                                    };
                                    return <ProductCard key={productData.id} {...productData} />;
                                })}
                            </div>

                            {pageInfo?.hasNextPage && (
                                <div className="mt-12 flex justify-center">
                                    <a
                                        href={`/category/${slug}?after=${pageInfo.endCursor}${minPrice ? `&minPrice=${minPrice}` : ''}${maxPrice ? `&maxPrice=${maxPrice}` : ''}${sort !== 'date-desc' ? `&sort=${sort}` : ''}`}
                                        className="inline-flex items-center justify-center rounded-md bg-white px-6 py-3 text-sm font-medium text-gray-900 border border-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
