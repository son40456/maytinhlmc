import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from '@/components/ui/ProductCard';
import { searchProductsPaginated } from '@/app/actions/searchActions';

export const dynamic = 'force-dynamic';

const HITS_PER_PAGE = 24;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
    const params = await searchParams;
    const q = params?.q || '';
    const page = parseInt(params?.page || '1');
    return {
        title: page > 1
            ? `Kết quả tìm kiếm "${q}" - Trang ${page} | LMC`
            : `Kết quả tìm kiếm cho "${q}" | LMC`,
        description: 'Tìm kiếm sản phẩm tốt nhất tại LMC.',
        // C-Search: noindex prevents thin/duplicate content indexing for search query URLs
        robots: {
            index: false,
            follow: true,
        },
        // canonical points to base search page (without query params) to consolidate signals
        alternates: {
            canonical: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn'}/search`,
        },
    };
}


export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string; page?: string }>;
}) {
    const params = await searchParams;
    const query = params?.q || '';
    const currentPage = Math.max(1, parseInt(params?.page || '1'));

    if (!query) {
        return (
            <div className="container mx-auto px-4 py-16 text-center min-h-[50vh]">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Tìm kiếm Sản phẩm</h1>
                <p className="text-gray-600">Vui lòng nhập từ khoá vào thanh tìm kiếm trên Header.</p>
            </div>
        );
    }

    const { products, totalHits, totalPages } = await searchProductsPaginated(query, currentPage, HITS_PER_PAGE);

    const buildPageUrl = (page: number) => {
        const p = new URLSearchParams({ q: query });
        if (page > 1) p.set('page', page.toString());
        return `/search?${p.toString()}`;
    };

    // Generate page numbers to show (max 7 pages with ellipsis)
    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        const pages: (number | '...')[] = [];
        pages.push(1);
        if (currentPage > 4) pages.push('...');
        for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) {
            pages.push(i);
        }
        if (currentPage < totalPages - 3) pages.push('...');
        pages.push(totalPages);
        return pages;
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-[60vh]">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-8">
                <h1 className="text-2xl font-bold text-gray-900">
                    Kết quả tìm kiếm: <span className="text-blue-600">&quot;{query}&quot;</span>
                </h1>
                {totalHits > 0 && (
                    <p className="text-sm text-gray-500">
                        Tìm thấy <span className="font-semibold text-gray-800">{totalHits.toLocaleString()}</span> sản phẩm
                        {totalPages > 1 && (
                            <> · Trang <span className="font-semibold text-gray-800">{currentPage}</span> / {totalPages}</>
                        )}
                    </p>
                )}
            </div>

            {products.length === 0 ? (
                <div className="py-16 text-center bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-lg text-gray-600 mb-3">Không tìm thấy sản phẩm nào phù hợp.</p>
                    <p className="text-sm text-gray-400">Thử kiểm tra lại lỗi chính tả hoặc dùng từ khoá chung chung hơn.</p>
                </div>
            ) : (
                <>
                    {/* Product grid */}
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 xl:gap-6">
                        {products.map((product: any) => (
                            <ProductCard
                                key={product.id}
                                id={product.id}
                                databaseId={product.databaseId}
                                name={product.name}
                                price={product.price || product.regularPrice || '0₫'}
                                imageUrl={product.image?.sourceUrl || ''}
                                slug={product.slug || ''}
                                sku={product.sku || ''}
                                regularPrice={product.regularPrice || ''}
                                salePrice={product.salePrice || ''}
                                stockStatus={product.stockStatus || 'IN_STOCK'}
                            />
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav aria-label="Phân trang kết quả tìm kiếm" className="mt-12 flex flex-col items-center gap-4">
                            <div className="flex items-center gap-1">
                                {/* Prev */}
                                {currentPage > 1 ? (
                                    <Link
                                        href={buildPageUrl(currentPage - 1)}
                                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 transition-all shadow-sm"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Trước
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-300 cursor-not-allowed">
                                        <ChevronLeft className="w-4 h-4" /> Trước
                                    </span>
                                )}

                                {/* Page numbers */}
                                <div className="flex items-center gap-1 mx-1">
                                    {getPageNumbers().map((p, idx) =>
                                        p === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-2 py-2.5 text-gray-400 text-sm select-none">…</span>
                                        ) : (
                                            <Link
                                                key={p}
                                                href={buildPageUrl(p as number)}
                                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold transition-all ${
                                                    p === currentPage
                                                        ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                                                        : 'border border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-700'
                                                }`}
                                            >
                                                {p}
                                            </Link>
                                        )
                                    )}
                                </div>

                                {/* Next */}
                                {currentPage < totalPages ? (
                                    <Link
                                        href={buildPageUrl(currentPage + 1)}
                                        className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 transition-all shadow-sm"
                                    >
                                        Sau <ChevronRight className="w-4 h-4" />
                                    </Link>
                                ) : (
                                    <span className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-gray-100 bg-gray-50 text-sm font-semibold text-gray-300 cursor-not-allowed">
                                        Sau <ChevronRight className="w-4 h-4" />
                                    </span>
                                )}
                            </div>

                            <p className="text-xs text-gray-400">
                                Hiển thị {(currentPage - 1) * HITS_PER_PAGE + 1}–{Math.min(currentPage * HITS_PER_PAGE, totalHits)} trong số {totalHits.toLocaleString()} sản phẩm
                            </p>
                        </nav>
                    )}
                </>
            )}
        </div>
    );
}
