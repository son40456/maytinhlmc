"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X, Plus, Cpu, ChevronLeft, ChevronRight, Sparkles, Filter } from "lucide-react";

// Local query to fetch all required products upfront for instant client-side filtering
const GET_ALL_CATEGORY_PRODUCTS = `
  query GetAllCategoryProducts($slugStr: String!, $first: Int = 100, $after: String) {
    products(first: $first, after: $after, where: { categoryIn: [$slugStr], orderby: [{ field: DATE, order: DESC }] }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          sku
          price
          regularPrice
          salePrice
          image { sourceUrl }
          attributes {
            nodes { 
              name label 
              ... on GlobalProductAttribute { 
                slug 
                terms { nodes { name slug } }
              }
            }
          }
          thongsokythuatsonbn {
            thongsochitiet
          }
          thongtinsanpham {
            chinhSachBaoHanh
          }
        }
        ... on VariableProduct {
          sku
          price
          regularPrice
          salePrice
          image { sourceUrl }
          attributes {
            nodes { 
              name label 
              ... on GlobalProductAttribute { 
                slug 
                terms { nodes { name slug } }
              }
            }
          }
          thongsokythuatsonbn {
            thongsochitiet
          }
          thongtinsanpham {
            chinhSachBaoHanh
          }
        }
      }
    }
  }
`;

interface ProductSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    categoryId: string;
    categoryName: string;
    categorySlug: string;
    compatibilityFilter?: { keywords: string[]; label: string } | null;
    onSelect: (product: any) => void;
}

export function ProductSelectModal({ isOpen, onClose, categoryId, categoryName, categorySlug, compatibilityFilter, onSelect }: ProductSelectModalProps) {
    const [allProducts, setAllProducts] = useState<any[]>([]);
    const [displayedProducts, setDisplayedProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [bgLoading, setBgLoading] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(24);

    // Filters & Search State
    const [searchTermInput, setSearchTermInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("DATE_DESC");
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>({});
    const [availableFilters, setAvailableFilters] = useState<any[]>([]);

    // Compatibility auto-filter state
    const [compatFilterActive, setCompatFilterActive] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTermInput), 150); // Faster debounce for local array
        return () => clearTimeout(timer);
    }, [searchTermInput]);

    // Helper to dynamically extract filters from loaded products
    const extractAndSetFilters = (products: any[]) => {
        const attributeMap = new Map();
        products.forEach((product: any) => {
            const attrs = product.attributes?.nodes || [];
            attrs.forEach((attr: any) => {
                if (!attr.slug) return;
                const taxSlug = attr.slug.startsWith('pa_') ? attr.slug : `pa_${attr.slug}`;
                if (!attributeMap.has(taxSlug)) {
                    attributeMap.set(taxSlug, {
                        name: attr.label || attr.name,
                        slug: taxSlug,
                        options: new Map()
                    });
                }
                const terms = attr.terms?.nodes || [];
                terms.forEach((term: any) => {
                    attributeMap.get(taxSlug).options.set(term.slug, term.name);
                });
            });
        });

        const parsedFilters = Array.from(attributeMap.values()).map(attr => ({
            ...attr,
            options: (Array.from(attr.options.entries()) as [string, string][]).map(([slug, name]) => ({ slug, name }))
        }));
        setAvailableFilters(parsedFilters);
    };

    // Effect 1: Fetch ALL products for this category (Initial fast fetch + Background fetch)
    useEffect(() => {
        if (!isOpen || !categorySlug) return;

        let isMounted = true;
        const abortController = new AbortController();

        const loadProducts = async () => {
            setLoading(true);

            // Reset local state when category changes
            setSearchTermInput("");
            setDebouncedSearch("");
            setSortOrder("DATE_DESC");
            setSelectedAttributes({});

            try {
                // 1. Initial Fast Load: Fetch only the first 10 items to display immediately
                const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://next.maytinhlmc.vn/graphql';
                const initialResponse: Response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: GET_ALL_CATEGORY_PRODUCTS,
                        variables: { slugStr: categorySlug, first: 10, after: null }
                    }),
                    signal: abortController.signal
                });
                const initialData: any = await initialResponse.json();

                if (!isMounted) return;

                const initialProducts = initialData.data?.products?.nodes || [];
                let allFetchedProducts = [...initialProducts];

                setAllProducts(allFetchedProducts);
                extractAndSetFilters(allFetchedProducts); // Generate initial filters
                setLoading(false); // Turn off loading spinner for immediate interaction

                // 2. Background Load: Fetch the remaining pages silently
                let hasNextPage = initialData.data?.products?.pageInfo?.hasNextPage || false;
                let endCursor = initialData.data?.products?.pageInfo?.endCursor || null;

                if (hasNextPage && isMounted) setBgLoading(true);

                while (hasNextPage && isMounted) {
                    const bgResponse: Response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            query: GET_ALL_CATEGORY_PRODUCTS,
                            variables: { slugStr: categorySlug, first: 100, after: endCursor }
                        }),
                        signal: abortController.signal
                    });
                    const bgData: any = await bgResponse.json();

                    if (!isMounted) break;

                    const newProductsList = bgData.data?.products?.nodes || [];
                    allFetchedProducts = [...allFetchedProducts, ...newProductsList];

                    setAllProducts(allFetchedProducts); // Update state progressively
                    extractAndSetFilters(allFetchedProducts); // Update filters progressively as more items arrive

                    hasNextPage = bgData.data?.products?.pageInfo?.hasNextPage || false;
                    endCursor = bgData.data?.products?.pageInfo?.endCursor || null;

                    // Safeguard to prevent excessive fetching (e.g., max 1000 items)
                    if (allFetchedProducts.length >= 1000) break;
                }

                if (isMounted) setBgLoading(false);

            } catch (error: any) {
                if (error.name !== 'AbortError') {
                    console.error("Lỗi khi load linh kiện:", error);
                    setLoading(false);
                    setBgLoading(false);
                }
            }
        };

        loadProducts();

        return () => {
            isMounted = false;
            abortController.abort(); // Cancel ongoing background fetches if modal closes
        };
    }, [isOpen, categorySlug]);

    // Effect 2: Local Client-Side Filtering & Sorting (Instantaneous)
    useEffect(() => {
        let result = [...allProducts];

        // 0. Compatibility filter (auto-filter by platform/DDR)
        if (compatFilterActive && compatibilityFilter && compatibilityFilter.keywords.length > 0) {
            const keywords = compatibilityFilter.keywords.map(k => k.toLowerCase());
            result = result.filter(p => {
                const name = p.name.toLowerCase();
                return keywords.some(kw => name.includes(kw.toLowerCase()));
            });
        }

        // 1. Search filter
        if (debouncedSearch.trim() !== "") {
            const lowerSearch = debouncedSearch.toLowerCase();
            result = result.filter(p => p.name.toLowerCase().includes(lowerSearch));
        }

        // 2. Attributes filter (AND between taxonomies, OR within same taxonomy)
        const activeTaxonomies = Object.keys(selectedAttributes).filter(k => selectedAttributes[k].length > 0);
        if (activeTaxonomies.length > 0) {
            result = result.filter(product => {
                const productAttrs = product.attributes?.nodes || [];
                return activeTaxonomies.every(targetTaxSlug => {
                    const selectedTermSlugs = selectedAttributes[targetTaxSlug];
                    const productAttr = productAttrs.find((a: any) => {
                        const taxSlug = a.slug?.startsWith('pa_') ? a.slug : `pa_${a.slug}`;
                        return taxSlug === targetTaxSlug;
                    });

                    if (!productAttr) return false;
                    const productTermSlugs = (productAttr.terms?.nodes || []).map((t: any) => t.slug);
                    return selectedTermSlugs.some(slug => productTermSlugs.includes(slug));
                });
            });
        }

        // 3. Sorting
        result.sort((a, b) => {
            const priceA = parseFloat(a.price?.replace(/[^\d.-]/g, '') || a.regularPrice?.replace(/[^\d.-]/g, '') || "0");
            const priceB = parseFloat(b.price?.replace(/[^\d.-]/g, '') || b.regularPrice?.replace(/[^\d.-]/g, '') || "0");

            if (sortOrder === "PRICE_DESC") return priceB - priceA;
            if (sortOrder === "PRICE_ASC") return priceA - priceB;
            if (sortOrder === "TITLE_ASC") return a.name.localeCompare(b.name);
            return b.databaseId - a.databaseId; // roughly newest first fallback
        });

        setDisplayedProducts(result);
        setCurrentPage(1); // Reset page on filter changes
    }, [allProducts, debouncedSearch, sortOrder, selectedAttributes, compatFilterActive, compatibilityFilter]);

    if (!isOpen) return null;

    const totalPages = Math.ceil(displayedProducts.length / itemsPerPage);
    const paginatedProducts = displayedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getPageNumbers = () => {
        const pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (currentPage >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const cleanPrice = (priceStr: string) => {
        return priceStr?.replace(/&nbsp;/g, " ").trim() || "Liên hệ";
    };

    const toggleAttribute = (taxonomy: string, option: string) => {
        setSelectedAttributes(prev => {
            const current = prev[taxonomy] || [];
            if (current.includes(option)) {
                return { ...prev, [taxonomy]: current.filter(o => o !== option) };
            } else {
                return { ...prev, [taxonomy]: [...current, option] };
            }
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-sm p-2 md:p-4 animate-in fade-in duration-200">
            <div
                className="relative w-full max-w-[1400px] h-[95vh] md:h-[90vh] bg-[#0a0c14] border border-white/10 shadow-2xl flex flex-col overflow-hidden text-slate-300 md:rounded-2xl rounded-xl"
            >
                {/* Header */}
                <header className="flex items-center justify-between gap-3 md:gap-6 px-4 md:px-10 py-4 md:py-6 border-b border-white/10 relative z-10 bg-white/5 shrink-0">
                    <div className="flex items-center gap-3 md:gap-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30 shrink-0">
                                <Cpu className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                            </div>
                            <div className="hidden sm:block">
                                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white uppercase">{categoryName || "Linh kiện"}</h1>
                                <p className="text-[10px] md:text-xs text-blue-500 font-bold tracking-[0.2em] uppercase">Bộ lọc thông minh</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 max-w-xl relative group mx-2 md:mx-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Tìm linh kiện..."
                            value={searchTermInput}
                            onChange={(e) => setSearchTermInput(e.target.value)}
                            className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-white/5 border border-white/10 rounded-full focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all text-white placeholder:text-slate-500 outline-none text-sm"
                        />
                    </div>

                    <button onClick={onClose} className="w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-full hover:bg-white/10 text-slate-400 transition-colors border border-white/5">
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </header>

                {/* Body: 2 Columns */}
                <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
                    {/* Sidebar Filters */}
                    <aside className="w-full md:w-72 shrink-0 border-r border-white/10 overflow-x-auto md:overflow-y-auto p-4 md:p-6 md:space-y-8 flex md:block gap-4 md:gap-0 bg-black/20" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                        {availableFilters.map(filter => (
                            <div key={filter.slug} className="space-y-2 md:space-y-4 shrink-0 min-w-[max-content] md:min-w-0 md:pb-0">
                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{filter.name}</h3>
                                <div className="flex flex-row md:flex-wrap gap-2">
                                    {filter.options.map((opt: any) => {
                                        const isSelected = selectedAttributes[filter.slug]?.includes(opt.slug);
                                        return (
                                            <button
                                                key={opt.slug}
                                                onClick={() => toggleAttribute(filter.slug, opt.slug)}
                                                className={`px-3 py-1.5 rounded text-[11px] font-bold transition-colors whitespace-nowrap ${isSelected ? 'bg-blue-500/20 border border-blue-500/40 text-blue-400' : 'bg-white/5 border border-white/5 text-slate-400 hover:bg-white/10'}`}
                                            >
                                                {opt.name}
                                            </button>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 flex flex-col bg-black/40 min-w-0">
                        {/* Sort Bar */}
                        <div className="px-4 md:px-8 py-3 md:py-4 flex items-center justify-between border-b border-t md:border-t-0 border-white/5 bg-white/5 shrink-0 overflow-x-auto no-scrollbar gap-4">
                            <div className="flex gap-4 md:gap-6 min-w-max">
                                {[
                                    { id: "DATE_DESC", label: "Mới nhất" },
                                    { id: "PRICE_DESC", label: "Giá cao" },
                                    { id: "PRICE_ASC", label: "Giá thấp" },
                                    { id: "TITLE_ASC", label: "A -> Z" }
                                ].map(sort => (
                                    <button
                                        key={sort.id}
                                        onClick={() => setSortOrder(sort.id)}
                                        className={`text-[10px] md:text-[11px] font-black tracking-widest uppercase transition-colors relative pb-1 whitespace-nowrap ${sortOrder === sort.id ? 'text-blue-500' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {sort.label}
                                        {sortOrder === sort.id && (
                                            <div className="absolute -bottom-[12px] md:-bottom-[17px] left-0 w-full h-[2px] bg-blue-500"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <div className="flex items-center gap-3">
                                {bgLoading && (
                                    <>
                                        <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] md:text-[11px] tracking-widest uppercase">
                                            <div className="w-3 h-3 md:w-3.5 md:h-3.5 border-[2px] border-blue-500/30 border-t-blue-500 rounded-full animate-spin drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>
                                            <span className="drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]">LOADING...</span>
                                        </div>
                                        <span className="text-white/20 font-bold shrink-0">|</span>
                                    </>
                                )}
                                <p className="text-[10px] md:text-[11px] font-bold text-slate-500 uppercase tracking-widest whitespace-nowrap shrink-0">{displayedProducts.length} Món</p>
                            </div>
                        </div>

                        {/* Compatibility Filter Banner */}
                        {compatibilityFilter && (
                            <div className={`px-4 md:px-8 py-2.5 border-b border-white/5 flex items-center justify-between gap-3 shrink-0 ${compatFilterActive ? 'bg-emerald-500/10' : 'bg-white/5'}`}>
                                <div className="flex items-center gap-2">
                                    <Sparkles className={`w-4 h-4 ${compatFilterActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                                    <span className={`text-[11px] font-bold uppercase tracking-wider ${compatFilterActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        {compatibilityFilter.label}
                                    </span>
                                </div>
                                <button
                                    onClick={() => setCompatFilterActive(!compatFilterActive)}
                                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors ${compatFilterActive
                                        ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-400'
                                        : 'bg-blue-500/20 border border-blue-500/30 text-blue-400 hover:bg-emerald-500/20 hover:border-emerald-500/30 hover:text-emerald-400'
                                        }`}
                                >
                                    <Filter className="w-3 h-3" />
                                    {compatFilterActive ? 'Tắt lọc' : 'Bật lọc'}
                                </button>
                            </div>
                        )}

                        {/* Selected Tags */}
                        {Object.values(selectedAttributes).some(arr => arr.length > 0) && (
                            <div className="px-4 md:px-8 py-3 border-b border-white/5 flex items-center gap-3 shrink-0 bg-black/20 overflow-x-auto no-scrollbar">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">Đang lọc:</span>
                                <div className="flex items-center gap-2">
                                    {availableFilters.map(filter => {
                                        const selectedInFilter = selectedAttributes[filter.slug] || [];
                                        return selectedInFilter.map(valSlug => {
                                            const optionName = filter.options.find((o: any) => o.slug === valSlug)?.name || valSlug;
                                            return (
                                                <div
                                                    key={`${filter.slug}-${valSlug}`}
                                                    className="flex items-center bg-blue-500/10 border border-blue-500/30 rounded pl-2.5 pr-1 py-1 text-[10px] font-bold text-blue-300 relative group shrink-0"
                                                >
                                                    <span className="mr-2 uppercase tracking-wide whitespace-nowrap">{optionName}</span>
                                                    <button
                                                        onClick={() => toggleAttribute(filter.slug, valSlug)}
                                                        className="bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-400 rounded-sm p-0.5 transition-colors"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            );
                                        });
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Product List */}
                        <div className="flex-1 overflow-y-auto p-4 md:p-6 grid grid-cols-1 xl:grid-cols-2 gap-3 md:gap-4 place-content-start relative" style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,255,255,0.1) transparent' }}>
                            {/* Loading Overlay */}
                            {loading && (
                                <div className="absolute inset-0 bg-black/30 backdrop-blur-sm z-10 flex items-center justify-center rounded-br-2xl">
                                    <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
                                </div>
                            )}

                            {paginatedProducts.length > 0 ? (
                                paginatedProducts.map(product => (
                                    <div key={product.id} className="bg-white/5 border border-white/5 hover:bg-white/10 group flex items-center p-3 md:p-4 rounded-xl relative overflow-hidden transition-colors duration-200 h-[110px] md:h-[130px]">
                                        <div className="w-20 h-20 md:w-24 md:h-24 shrink-0 bg-black/40 rounded-lg flex items-center justify-center mr-3 md:mr-5 border border-white/5 overflow-hidden p-2">
                                            {product.image?.sourceUrl ? (
                                                <Image src={product.image.sourceUrl} alt={product.name} width={80} height={80} className="object-contain max-h-full" />
                                            ) : (
                                                <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">No Img</span>
                                            )}
                                        </div>

                                        <div className="flex-1 flex flex-col h-full justify-center min-w-0 pr-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                <h3 className="text-xs md:text-sm font-black text-white leading-tight uppercase tracking-tight group-hover:text-blue-400 transition-colors line-clamp-2 pr-2">{product.name}</h3>
                                            </div>
                                            <div className="flex flex-row items-center justify-between mt-auto gap-2">
                                                <span className="text-xs md:text-sm font-black text-[#22d3ee] whitespace-nowrap">{cleanPrice(product.price || product.regularPrice)}</span>
                                                <button
                                                    onClick={() => { onSelect(product); onClose(); }}
                                                    className="h-8 px-3 rounded bg-blue-500/10 border border-blue-500/30 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors shrink-0"
                                                    title="Chọn linh kiện này"
                                                >
                                                    <span className="text-[10px] font-black uppercase mr-1 hidden sm:block">Thêm</span>
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !loading && (
                                    <div className="col-span-full text-center text-slate-500 py-16 flex flex-col items-center">
                                        <Search className="w-12 h-12 mb-4 text-slate-700" />
                                        <p className="text-sm font-bold uppercase tracking-widest">Không tìm thấy linh kiện nào.</p>
                                    </div>
                                )
                            )}
                        </div>

                        {/* Pagination Footer */}
                        {totalPages > 1 && (
                            <footer className="px-4 md:px-10 py-4 md:py-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between bg-white/5 gap-4 shrink-0">
                                <div className="flex items-center gap-2 md:gap-4 overflow-x-auto no-scrollbar w-full sm:w-auto">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-2 md:px-4 py-1.5 md:py-2 rounded bg-white/5 border border-white/10 text-[10px] md:text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" /> <span className="hidden md:inline">Trang trước</span>
                                    </button>

                                    <div className="flex gap-1 md:gap-2">
                                        {getPageNumbers().map((page, idx) => (
                                            page === '...' ? (
                                                <span key={`ellipsis-${idx}`} className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center text-slate-600 font-bold">...</span>
                                            ) : (
                                                <button
                                                    key={page}
                                                    onClick={() => setCurrentPage(page as number)}
                                                    className={`w-6 h-6 md:w-8 md:h-8 rounded font-black text-[10px] md:text-xs flex items-center justify-center transition-colors ${currentPage === page ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]' : 'bg-white/5 border border-white/5 text-slate-500 hover:border-white/20 hover:text-white'}`}
                                                >
                                                    {page}
                                                </button>
                                            )
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-2 md:px-4 py-1.5 md:py-2 rounded bg-white/5 border border-white/10 text-[10px] md:text-[11px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                                    >
                                        <span className="hidden md:inline">Trang sau</span> <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-black text-slate-500 uppercase shrink-0">
                                    Hiển thị:
                                    <select
                                        value={itemsPerPage}
                                        onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                                        className="bg-black/40 border-white/10 rounded text-[10px] md:text-[11px] py-1 pl-2 pr-6 md:pr-8 focus:ring-0 focus:border-blue-500/50 text-slate-300 outline-none"
                                    >
                                        <option value="12">12</option>
                                        <option value="24">24</option>
                                        <option value="48">48</option>
                                    </select>
                                </div>
                            </footer>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
