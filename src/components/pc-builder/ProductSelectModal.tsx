"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, X, Plus } from "lucide-react";

// Local query to support search and custom filtering
const GET_MODAL_PRODUCTS = `
  query GetModalProducts(
    $slugStr: String!,
    $first: Int = 50,
    $search: String,
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }],
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    categoryProducts: products(
      first: $first,
      where: { 
        categoryIn: [$slugStr], 
        search: $search,
        minPrice: $minPrice, 
        maxPrice: $maxPrice, 
        orderby: $orderBy,
        taxonomyFilter: { filters: $taxFilters }
      }
    ) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          image { sourceUrl }
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          image { sourceUrl }
        }
      }
    }
    filterDiscovery: products(first: 50, where: { categoryIn: [$slugStr] }) {
      nodes {
        ... on SimpleProduct {
          attributes {
            nodes { 
              name label 
              ... on GlobalProductAttribute { 
                slug 
                terms { nodes { name slug } }
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
                terms { nodes { name slug } }
              }
            }
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
    onSelect: (product: any) => void;
}

export function ProductSelectModal({ isOpen, onClose, categoryId, categoryName, categorySlug, onSelect }: ProductSelectModalProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Filters & Search State
    const [searchTermInput, setSearchTermInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [sortOrder, setSortOrder] = useState("DATE_DESC");
    const [selectedAttributes, setSelectedAttributes] = useState<{ [key: string]: string[] }>({});
    const [availableFilters, setAvailableFilters] = useState<any[]>([]);

    // Reset state when category changes
    useEffect(() => {
        setSearchTermInput("");
        setDebouncedSearch("");
        setSortOrder("DATE_DESC");
        setSelectedAttributes({});
        setAvailableFilters([]);
    }, [categorySlug]);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchTermInput), 500);
        return () => clearTimeout(timer);
    }, [searchTermInput]);

    useEffect(() => {
        if (!isOpen) return;

        const fetchProducts = async () => {
            setLoading(true);

            let orderBy = [{ field: "DATE", order: "DESC" }];
            if (sortOrder === "PRICE_DESC") orderBy = [{ field: "PRICE", order: "DESC" }];
            if (sortOrder === "PRICE_ASC") orderBy = [{ field: "PRICE", order: "ASC" }];
            if (sortOrder === "TITLE_ASC") orderBy = [{ field: "TITLE", order: "ASC" }];

            let taxFilters: any[] = [];
            Object.keys(selectedAttributes).forEach(taxonomyRaw => {
                const terms = selectedAttributes[taxonomyRaw];
                if (terms.length > 0) {
                    // Chuyển đổi slug thành định dạng Enum ví dụ: pa_thuong-hieu -> PA_THUONG_HIEU
                    const cleanKey = taxonomyRaw.startsWith('pa_') ? taxonomyRaw.slice(3) : taxonomyRaw;
                    const taxonomyEnum = `PA_${cleanKey.toUpperCase().replace(/-/g, '_')}`;

                    taxFilters.push({
                        taxonomy: taxonomyEnum,
                        terms: terms,
                        operator: "IN"
                    });
                }
            });

            try {
                const res = await fetch('https://maytinhlmc.vn/graphql', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        query: GET_MODAL_PRODUCTS,
                        variables: {
                            slugStr: categorySlug,
                            first: 50,
                            search: debouncedSearch.trim() !== "" ? debouncedSearch : undefined,
                            orderBy,
                            taxFilters: taxFilters.length > 0 ? taxFilters : undefined
                        }
                    })
                });
                const json = await res.json();

                if (json.data?.categoryProducts?.nodes) {
                    setProducts(json.data.categoryProducts.nodes);
                } else {
                    setProducts([]);
                }

                if (json.data?.filterDiscovery?.nodes) {
                    const attributeMap = new Map();
                    json.data.filterDiscovery.nodes.forEach((product: any) => {
                        const attrs = product.attributes?.nodes || [];
                        attrs.forEach((attr: any) => {
                            if (!attr.slug) return;
                            const taxSlug = attr.slug.startsWith('pa_') ? attr.slug : `pa_${attr.slug}`;
                            if (!attributeMap.has(taxSlug)) {
                                attributeMap.set(taxSlug, {
                                    name: attr.label || attr.name,
                                    slug: taxSlug,
                                    options: new Map() // Use Map to store slug -> name
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

                    // Chỉ setAvailableFilters nếu chúng ta chưa có bộ lọc nào cho danh mục này
                    setAvailableFilters(prev => prev.length === 0 ? parsedFilters : prev);
                }

            } catch (error) {
                console.error("Lỗi khi load linh kiện:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [isOpen, categorySlug, debouncedSearch, sortOrder, selectedAttributes]);

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-[95vw] max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden rounded-md animate-in zoom-in-95 duration-200">

                {/* Header (Blue Bar) */}
                <div className="bg-[#0B519C] text-white flex items-center px-4 py-3 shrink-0">
                    <div className="w-1/4 min-w-[200px] font-bold text-lg">
                        Tìm linh kiện
                    </div>
                    <div className="flex-1 flex justify-center px-4">
                        <div className="relative w-full max-w-2xl text-gray-900">
                            <input
                                type="text"
                                placeholder="Nhập để tìm kiếm sản phẩm"
                                value={searchTermInput}
                                onChange={(e) => setSearchTermInput(e.target.value)}
                                className="w-full pl-4 pr-10 py-2 rounded-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        </div>
                    </div>
                    <div className="w-1/4 flex justify-end">
                        <button onClick={onClose} className="p-1 hover:bg-white/20 rounded transition-colors">
                            <X className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Body: 2 Columns */}
                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar Filters */}
                    <div className="w-64 shrink-0 overflow-y-auto border-r border-gray-200 p-4 space-y-6 bg-white custom-scrollbar">

                        {/* Dynamic Attributes */}
                        {availableFilters.map(filter => (
                            <div key={filter.slug}>
                                <h3 className="font-bold text-gray-800 mb-3 text-sm">{filter.name}</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {filter.options.map((opt: { slug: string, name: string }) => {
                                        const isSelected = selectedAttributes[filter.slug]?.includes(opt.slug);
                                        return (
                                            <button
                                                key={opt.slug}
                                                onClick={() => toggleAttribute(filter.slug, opt.slug)}
                                                className={`py-1.5 px-2 text-xs text-center rounded-sm transition-colors border ${isSelected
                                                    ? 'bg-blue-50 border-blue-500 text-blue-700 font-bold'
                                                    : 'bg-[#F3F4F6] border-transparent text-gray-700 hover:bg-gray-200'
                                                    }`}
                                            >
                                                {opt.name}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col bg-white min-w-0">

                        {/* Sort Bar */}
                        <div className="flex items-center gap-2 p-3 border-b border-gray-200 shrink-0">
                            {[
                                { id: "DATE_DESC", label: "Mới nhất" },
                                { id: "PRICE_DESC", label: "Giá cao nhất" },
                                { id: "PRICE_ASC", label: "Giá thấp nhất" },
                                { id: "TITLE_ASC", label: "Từ A -> Z" }
                            ].map(sort => (
                                <button
                                    key={sort.id}
                                    onClick={() => setSortOrder(sort.id)}
                                    className={`px-3 py-1.5 text-xs rounded-sm transition-colors border ${sortOrder === sort.id
                                        ? 'bg-[#3b82f6] text-white border-transparent'
                                        : 'bg-[#F3F4F6] text-gray-700 border-transparent hover:bg-gray-200'
                                        }`}
                                >
                                    {sort.label}
                                </button>
                            ))}
                        </div>

                        {/* Selected Tags */}
                        {Object.values(selectedAttributes).some(arr => arr.length > 0) && (
                            <div className="p-3 border-b border-gray-100 flex items-center gap-3 shrink-0 bg-gray-50/30 overflow-x-auto no-scrollbar">
                                <span className="text-sm font-bold text-gray-700 whitespace-nowrap">Chọn theo tiêu chí:</span>
                                <div className="flex items-center gap-2">
                                    {availableFilters.map(filter => {
                                        const selectedInFilter = selectedAttributes[filter.slug] || [];
                                        return selectedInFilter.map(valSlug => {
                                            const optionName = filter.options.find((o: any) => o.slug === valSlug)?.name || valSlug;
                                            return (
                                                <div
                                                    key={`${filter.slug}-${valSlug}`}
                                                    className="flex items-center bg-white border border-pink-400 rounded-md px-3 py-1.5 text-xs text-gray-800 relative group pr-8"
                                                >
                                                    <span className="font-medium">{optionName}</span>
                                                    <button
                                                        onClick={() => toggleAttribute(filter.slug, valSlug)}
                                                        className="absolute -right-2 -top-2 bg-[#f44336] text-white rounded-full p-0.5 hover:bg-red-700 transition-colors shadow-sm"
                                                    >
                                                        <X className="w-3 h-3 stroke-[3]" />
                                                    </button>
                                                </div>
                                            );
                                        });
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Product List */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar relative">
                            {loading && (
                                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center">
                                    <div className="w-8 h-8 border-4 border-[#0B519C] border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}

                            {products.length > 0 ? (
                                <div className="flex flex-col">
                                    {products.map((product, idx) => (
                                        <div key={product.id} className={`flex items-center gap-4 py-4 ${idx !== 0 ? 'border-t border-gray-100' : ''}`}>
                                            <div className="w-20 h-20 shrink-0 relative bg-white border border-gray-100 p-1 flex items-center justify-center">
                                                {product.image?.sourceUrl ? (
                                                    <Image
                                                        src={product.image.sourceUrl}
                                                        alt={product.name}
                                                        fill
                                                        className="object-contain"
                                                    />
                                                ) : (
                                                    <span className="text-xs text-gray-400">No Img</span>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0 pr-4">
                                                <h3 className="text-sm font-bold text-gray-900 mb-1 leading-snug hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm font-black text-red-600">
                                                    {cleanPrice(product.price || product.regularPrice)}
                                                </p>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    onSelect(product);
                                                    onClose();
                                                }}
                                                className="shrink-0 w-10 h-10 bg-[#0B519C] hover:bg-[#093e7a] text-white rounded flex items-center justify-center transition-colors shadow-sm cursor-pointer"
                                                title="Chọn linh kiện này"
                                            >
                                                <Plus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                !loading && (
                                    <div className="text-center text-gray-500 py-16">
                                        <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                        <p>Không tìm thấy linh kiện nào phù hợp với bộ lọc.</p>
                                    </div>
                                )
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
