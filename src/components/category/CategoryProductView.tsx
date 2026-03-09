"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { ProductCard } from "@/components/ui/ProductCard";
import { CategoryFilterSort } from "@/components/ui/CategoryFilterSort";
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_PRODUCTS_BY_CATEGORY } from "@/lib/graphql/queries";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

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
    categorySlug,
}: CategoryProductViewProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [products, setProducts] = useState(initialProducts);
    const [pageInfo, setPageInfo] = useState(initialPageInfo);
    const [loading, setLoading] = useState(false);

    // Initialize State filters from URL
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>(() => {
        const initialAttrs: Record<string, string[]> = {};
        if (searchParams) {
            searchParams.forEach((value, key) => {
                if (key.startsWith('pa_')) {
                    const attrSlug = key.slice(3);
                    const values = searchParams.getAll(key).flatMap(v => v.split(',')).filter(Boolean);
                    if (values.length > 0) {
                        initialAttrs[attrSlug] = values;
                    }
                }
            });
        }
        return initialAttrs;
    });

    const [priceRange, setPriceRange] = useState<{ min: number | null; max: number | null }>(() => {
        const minStr = searchParams?.get('min_price');
        const maxStr = searchParams?.get('max_price');
        return {
            min: minStr ? Number(minStr) : null,
            max: maxStr ? Number(maxStr) : null,
        };
    });

    const [sortOrder, setSortOrder] = useState(() => searchParams?.get('sort') || "DATE_DESC");

    // Lắng nghe sự thay đổi của searchParams (khi User click link từ Mega Menu)
    const isUpdatingFromUrl = useRef(false);
    useEffect(() => {
        if (isUpdatingFromUrl.current) return; // Bỏ qua nếu là bộ lọc tự push URL

        if (!searchParams) return;

        // Parse lại từ đầu:
        const parsedAttrs: Record<string, string[]> = {};
        searchParams.forEach((value, key) => {
            if (key.startsWith('pa_')) {
                const attrSlug = key.slice(3);
                const values = searchParams.getAll(key).flatMap(v => v.split(',')).filter(Boolean);
                if (values.length > 0) {
                    parsedAttrs[attrSlug] = values;
                }
            }
        });

        const minStr = searchParams.get('min_price');
        const maxStr = searchParams.get('max_price');
        const parsedPrice = {
            min: minStr ? Number(minStr) : null,
            max: maxStr ? Number(maxStr) : null,
        };

        const parsedSort = searchParams.get('sort') || "DATE_DESC";

        // Cập nhật trạng thái (State) chỉ khi thực sự có thay đổi
        setSelectedAttributes(prev => {
            if (JSON.stringify(prev) === JSON.stringify(parsedAttrs)) return prev;
            return parsedAttrs;
        });

        setPriceRange(prev => {
            if (prev.min === parsedPrice.min && prev.max === parsedPrice.max) return prev;
            return parsedPrice;
        });

        setSortOrder(prev => prev === parsedSort ? prev : parsedSort);
        // Note: khi state đổi, useEffect fetchProducts sẽ tự động chạy!
    }, [searchParams]);

    // Sync state to URL whenever it changes
    const updateUrlParams = useCallback(() => {
        isUpdatingFromUrl.current = true; // Mark as our own update
        const params = new URLSearchParams();

        // Add attributes preserving multiple values via comma-separation or multiple keys
        Object.entries(selectedAttributes).forEach(([key, values]) => {
            if (values && values.length > 0) {
                // To keep it standard Woo style: ?pa_thuong-hieu=gigabyte,asus
                params.set(`pa_${key}`, values.join(','));
            }
        });

        if (priceRange.min !== null) params.set('min_price', priceRange.min.toString());
        if (priceRange.max !== null) params.set('max_price', priceRange.max.toString());
        if (sortOrder !== "DATE_DESC") params.set('sort', sortOrder);

        const newQuery = params.toString();
        const newUrl = newQuery ? `${pathname}?${newQuery}` : pathname;
        router.replace(newUrl, { scroll: false });

        // Reset cờ sau khi update URL xong
        setTimeout(() => { isUpdatingFromUrl.current = false; }, 50);
    }, [selectedAttributes, priceRange, sortOrder, pathname, router]);

    const endCursorRef = useRef(initialPageInfo?.endCursor);
    useEffect(() => {
        endCursorRef.current = pageInfo?.endCursor;
    }, [pageInfo?.endCursor]);

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
                first: 24,
                after: isLoadMore ? endCursorRef.current : null,
                minPrice: priceRange.min,
                maxPrice: priceRange.max,
                orderBy,
                taxFilters: taxFilters.length > 0 ? taxFilters : null
            });

            const newProducts = data?.products?.nodes || [];
            const newPageInfo = data?.products?.pageInfo;

            if (isLoadMore) {
                setProducts(prev => {
                    const existingIds = new Set(prev.map((p: any) => p.id));
                    const uniqueNewProducts = newProducts.filter((p: any) => !existingIds.has(p.id));
                    return [...prev, ...uniqueNewProducts];
                });
            } else {
                setProducts(newProducts);
            }
            setPageInfo(newPageInfo);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, [categorySlug, selectedAttributes, priceRange, sortOrder]);

    // Re-fetch when filters change
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;

            // Nếu MỚI LOAD trang mà đã có filter (do URL truyền vào) -> cần fetch luôn
            // vì initialProducts từ Server truyền xuống lúc nào cũng là list mặc định (không filter)
            const hasFilters = Object.keys(selectedAttributes).length > 0 || priceRange.min !== null || priceRange.max !== null || sortOrder !== "DATE_DESC";
            if (!hasFilters) {
                return;
            }
        }

        updateUrlParams();
        fetchProducts();
    }, [selectedAttributes, priceRange, sortOrder, fetchProducts, updateUrlParams]);

    const handleFilterChange = (attrSlug: string, value: string) => {
        setSelectedAttributes(prev => {
            if (value === 'all') {
                const newAttrs = { ...prev };
                delete newAttrs[attrSlug];
                return newAttrs;
            }
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
            <div className="mb-4 md:mb-8 border-b border-gray-100 pb-4 md:pb-8">
                <h1 className="text-xl md:text-3xl font-black text-gray-900 mb-2 md:mb-3 tracking-tight">{category.name}</h1>
                {category.description && (
                    <div className="text-gray-500 text-sm max-w-3xl leading-relaxed" dangerouslySetInnerHTML={{ __html: category.description }} />
                )}
            </div>

            {/* Child Categories Block */}
            {(() => {
                const hasChildren = category.children?.nodes && category.children.nodes.length > 0;
                const hasParent = !!category.parent?.node;

                let activeCategory: any = null;
                let otherCategories: any[] = [];
                let isTopLevel = false;

                if (hasChildren) {
                    activeCategory = category;
                    otherCategories = category.children.nodes;
                    isTopLevel = true;
                } else if (hasParent) {
                    activeCategory = category;
                    otherCategories = [category.parent.node, ...category.parent.node.children.nodes.filter((c: any) => c.slug !== category.slug)];
                    isTopLevel = false;
                }

                if (!activeCategory && otherCategories.length === 0) return null;

                return (
                    <div className="mb-4 md:mb-8 overflow-x-auto pb-3 md:pb-4 scrollbar-hide">
                        <div className="flex gap-2 md:gap-4 min-w-max">
                            {isTopLevel ? (
                                <div className="flex-shrink-0 w-20 h-20 md:w-40 md:h-40 bg-[#d32f2f] text-white rounded-lg md:rounded-xl shadow-sm flex items-center justify-center p-2 md:p-4 text-center cursor-default">
                                    <span className="font-bold text-[10px] md:text-base leading-tight break-words">{activeCategory.name}</span>
                                </div>
                            ) : (
                                <Link
                                    href={`/${category.parent.node.slug}`}
                                    className="flex-shrink-0 w-20 h-20 md:w-40 md:h-40 bg-white border-2 border-transparent hover:border-red-500 rounded-lg md:rounded-xl shadow-sm flex flex-col items-center justify-center p-2 md:p-4 text-center transition-all hover:shadow-md cursor-pointer group"
                                >
                                    <span className="font-bold text-[10px] md:text-base leading-tight break-words text-gray-800 group-hover:text-red-500">{category.parent.node.name}</span>
                                </Link>
                            )}

                            {otherCategories.map((cat: any) => {
                                const isActive = cat.slug === category.slug;
                                if (isActive && !isTopLevel) {
                                    return (
                                        <div key={cat.slug} className="flex-shrink-0 w-20 h-20 md:w-40 md:h-40 bg-[#d32f2f] text-white rounded-lg md:rounded-xl shadow-sm flex items-center justify-center p-2 md:p-4 text-center cursor-default">
                                            <span className="font-bold text-[10px] md:text-base leading-tight break-words">{cat.name}</span>
                                        </div>
                                    );
                                }
                                return (
                                    <Link
                                        key={cat.slug}
                                        href={`/${cat.slug}`}
                                        className={`flex-shrink-0 w-20 h-20 md:w-40 md:h-40 bg-white border border-gray-100/80 rounded-lg md:rounded-xl shadow-sm flex flex-col items-center justify-center p-2 md:p-4 text-center transition-all hover:shadow-md hover:border-red-400 group relative overflow-hidden`}
                                    >
                                        {cat.image?.sourceUrl ? (
                                            <>
                                                <div className="relative w-10 h-10 md:w-20 md:h-20 mb-1 md:mb-2 transition-transform group-hover:scale-110">
                                                    <Image
                                                        src={cat.image.sourceUrl}
                                                        alt={cat.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                </div>
                                                <span className="font-semibold text-[9px] md:text-sm text-blue-600 line-clamp-2 leading-tight">{cat.name}</span>
                                            </>
                                        ) : (
                                            <span className="font-semibold text-sm md:text-base text-gray-800 group-hover:text-red-500 leading-tight break-words">{cat.name}</span>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

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
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
                                <div className="aspect-square w-full animate-shimmer" />
                                <div className="flex flex-1 flex-col p-3">
                                    <div className="h-3 animate-shimmer rounded w-1/4 mb-2" />
                                    <div className="h-4 animate-shimmer rounded w-3/4 mb-1.5" />
                                    <div className="h-4 animate-shimmer rounded w-1/2 mb-4" />
                                    <div className="mt-auto pt-3 flex items-center justify-between gap-2 border-t border-gray-50">
                                        <div className="h-6 animate-shimmer rounded w-1/2" />
                                        <div className="w-10 h-10 animate-shimmer rounded-xl shrink-0" />
                                    </div>
                                </div>
                            </div>
                        ))}
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
                    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3 lg:gap-4 transition-opacity ${loading ? 'opacity-50' : 'opacity-100'}`}>
                        {products.map((p: any, idx: number) => (
                            <ProductCard
                                key={p.id}
                                id={p.id}
                                databaseId={p.databaseId}
                                name={p.name}
                                price={(p.price || p.regularPrice || "Liên hệ").replace(/&nbsp;/g, ' ')}
                                imageUrl={p.image?.sourceUrl || ""}
                                slug={p.slug}
                                sku={p.sku}
                                regularPrice={p.regularPrice}
                                salePrice={p.salePrice}
                                category={categorySlug}
                                priority={idx < 12}
                            />
                        ))}
                    </div>
                )}

                {/* Load More */}
                {pageInfo?.hasNextPage && (
                    <div className="mt-6 md:mt-12 flex justify-center">
                        <button
                            onClick={() => fetchProducts(true)}
                            disabled={loading}
                            className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl font-bold text-sm text-gray-700 hover:bg-gray-50 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
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
