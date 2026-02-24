import { wpgraphqlFetch } from '@/lib/graphql/fetcher';
import { SEARCH_PRODUCTS } from '@/lib/graphql/queries';
import { ProductCard } from '@/components/ui/ProductCard';

export const metadata = {
    title: 'Kết quả tìm kiếm | StoreNext',
    description: 'Tìm kiếm sản phẩm tốt nhất tại StoreNext.',
};

export default async function SearchPage({
    searchParams,
}: {
    searchParams: { q?: string };
}) {
    const query = searchParams.q || '';

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-16 text-center min-h-[50vh]">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm Sản phẩm</h1>
                <p className="text-gray-600">Vui lòng nhập từ khoá vào thanh tìm kiếm trên Header.</p>
            </div>
        );
    }

    // Lấy dữ liệu tìm kiếm từ API WPGraphQL
    const { data } = await wpgraphqlFetch<any>(SEARCH_PRODUCTS, { search: query, first: 20 });
    const products = data?.products?.nodes || [];

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">
                Kết quả tìm kiếm cho: <span className="text-blue-600">"{query}"</span>
            </h1>

            {products.length === 0 ? (
                <div className="py-12 text-center bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-lg text-gray-600 mb-4">Không tìm thấy sản phẩm nào phù hợp với từ khoá của bạn.</p>
                    <p className="text-sm text-gray-500">Thử kiểm tra lại lỗi chính tả hoặc dùng từ khoá chung chung hơn.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:gap-6">
                    {products.map((product: any) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            databaseId={product.databaseId}
                            name={product.name}
                            price={product.price || product.regularPrice || '0₫'}
                            imageUrl={product.image?.sourceUrl || ''}
                            slug={product.slug}
                            sku={product.sku}
                            regularPrice={product.regularPrice}
                            salePrice={product.salePrice}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
