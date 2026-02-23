"use client";

import { useState, useEffect, useCallback } from "react";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryFilterSort } from "@/components/ui/CategoryFilterSort";
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";
import { Loader2 } from "lucide-react";

interface CategoryProductViewProps {
    category: any;
    initialProducts: any[];
    initialPageInfo: any;
    availableFilters: any[];
    categorySlug: string;
}

export function CategoryProductView({
    category,
    initialProducts,
    initialPageInfo,
    availableFilters,
    categorySlug
}: CategoryProductViewProps) {
    const [products, setProducts] = useState(initialProducts);
    const [pageInfo, setPageInfo] = useState(initialPageInfo);
    const [loading, setLoading] = useState(false);

    // State filters
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});
    const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>({ min: null, max: null });
    const [sortOrder, setSortOrder] = useState("DATE_DESC");

    // AJAX Fetch products
    const fetchProducts = useCallback(async (isLoadMore = false) => {
        setLoading(true);

        const taxFilters = Object.entries(selectedAttributes)
            .filter(([_, values]) => values.length > 0)
            .map(([key, values]) => {
                const taxonomy = `PA_${key.toUpperCase().replace(/-/g, '_')}`;
                return {
                    taxonomy,
                    terms: values,
                    operator: 'IN'
                };
            });

        let orderBy = [{ field: "DATE", order: "DESC" }];
        if (sortOrder === "PRICE_ASC") orderBy = [{ field: "PRICE", order: "ASC" }];
        if (sortOrder === "PRICE_DESC") orderBy = [{ field: "PRICE", order: "DESC" }];

        try {
            const { data } = await wpgraphqlFetch<any>(GET_PRODUCTS_BY_CATEGORY, {
                slugId: categorySlug,
                slugStr: categorySlug,
                first: 12,
                after: isLoadMore ? pageInfo?.endCursor : null,
                minPrice: priceRange.min,
                maxPrice: priceRange.max,
                orderBy,
                taxFilters: taxFilters.length > 0 ? taxFilters : null
            });

            const newProducts = data?.products?.nodes || [];
            const newPageInfo = data?.products?.pageInfo;

            if (isLoadMore) {
                setProducts(prev => [...prev, ...newProducts]);
            } else {
                setProducts(newProducts);
            }
            setPageInfo(newPageInfo);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, [categorySlug, selectedAttributes, priceRange, sortOrder, pageInfo?.endCursor]);

    // Re-fetch when filters change (not on mount)
    const [isFirstRender, setIsFirstRender] = useState(true);
    useEffect(() => {
        if (isFirstRender) {
            setIsFirstRender(false);
            return;
        }
        fetchProducts();
    }, [selectedAttributes, priceRange, sortOrder]);

    const handleFilterChange = (attrSlug: string, value: string) => {
        setSelectedAttributes(prev => {
            const current = prev[attrSlug] || [];
            const updated = current.includes(value)
                ? current.filter(v => v !== value)
                : [...current, value];
            return { ...prev, [attrSlug]: updated };
        });
    };

    const handlePriceChange = (min: number | null, max: number | null) => {
        setPriceRange({ min, max });
    };

    const clearAllFilters = () => {
        setSelectedAttributes({});
        setPriceRange({ min: null, max: null });
        setSortOrder("DATE_DESC");
    };

    return (
        <div className="w-full space-y-8">
            <div className="mb-8 border-b border-gray-100 pb-8">
                <h1 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">{category.name}</h1>
                {category.description && (
                    <div className="text-gray-500 text-sm max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: category.description }} />
                )}
            </div>

            {/* Horizontal Filter Component */}
            <CategoryFilterSort
                filters={availableFilters}
                selectedAttributes={selectedAttributes}
                onFilterChange={handleFilterChange}
                priceRange={priceRange}
                onPriceChange={handlePriceChange}
                sortOrder={sortOrder}
                onSortChange={setSortOrder}
                onClearAll={clearAllFilters}
            />

            {/* Product List */}
            <div className="relative min-h-[400px]">
                {loading && products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        <p className="text-gray-400 font-medium">Đang tải danh sách sản phẩm...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="bg-gray-50 rounded-3xl py-20 text-center border-2 border-dashed border-gray-100">
                        <p className="text-gray-400 font-medium">Không tìm thấy sản phẩm nào phù hợp với bộ lọc.</p>
                        <button
                            onClick={clearAllFilters}
                            className="mt-4 text-blue-600 font-bold hover:underline"
                        >
                            Xóa tất cả bộ lọc
                        </button>
                    </div>
                ) : (
                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                        {products.map((p: any) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                databaseId={p.databaseId}
                                name={p.name}
                                price={(p.price || p.regularPrice || "Liên hệ").replace(/&nbsp;/g, ' ')}
                                imageUrl={p.image?.sourceUrl || ""}
                                slug={p.slug}
                            />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {pageInfo?.hasNextPage && (
                    <div className="mt-12 flex justify-center">
                        <button
                            onClick={() => fetchProducts(true)}
                            disabled={loading}
                            className="px-8 py-3 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                        >
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Tải thêm sản phẩm
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
