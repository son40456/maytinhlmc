"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Search, Loader2, X, ChevronDown } from "lucide-react";

interface Category {
    id: string;
    name: string;
    slug: string;
    count: number;
    parentName?: string | null;
}

interface CategorySearchInputProps {
    value: string;
    onChange: (slug: string, name: string) => void;
    placeholder?: string;
}

// Ref toàn cục để hiển thị badge "✅ Có banner" trong dropdown
let config_categoryBanners_ref: any = {};
export function setCategoryBannersRef(ref: any) {
    config_categoryBanners_ref = ref;
}

/**
 * Combobox tìm kiếm danh mục live — dropdown dùng position:fixed để không bị
 * overflow:hidden của card cha clip mất.
 */
export function CategorySearchInput({ value, onChange, placeholder }: CategorySearchInputProps) {
    const [query, setQuery] = useState("");
    const [displayName, setDisplayName] = useState<string>(
        value === "_default" ? "Banner Mặc Định" : value
    );
    const [results, setResults] = useState<Category[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Vị trí dropdown fixed
    const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

    const inputRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Cập nhật displayName khi value thay đổi từ ngoài
    useEffect(() => {
        if (value === "_default") setDisplayName("Banner Mặc Định");
    }, [value]);

    // Tính vị trí dropdown khi mở
    const updateDropdownPos = useCallback(() => {
        if (!inputRef.current) return;
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownStyle({
            position: "fixed",
            top: rect.bottom + 6,
            left: rect.left,
            width: rect.width,
            zIndex: 9999,
        });
    }, []);

    // Đóng khi click ngoài
    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (
                containerRef.current?.contains(e.target as Node) ||
                dropdownRef.current?.contains(e.target as Node)
            ) return;
            setOpen(false);
            setQuery("");
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    // Cập nhật vị trí khi scroll/resize
    useEffect(() => {
        if (!open) return;
        const handler = () => updateDropdownPos();
        window.addEventListener("scroll", handler, true);
        window.addEventListener("resize", handler);
        return () => {
            window.removeEventListener("scroll", handler, true);
            window.removeEventListener("resize", handler);
        };
    }, [open, updateDropdownPos]);

    const search = useCallback(async (q: string) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/categories?search=${encodeURIComponent(q)}&limit=15`);
            const data = await res.json();
            setResults(data.categories || []);
        } catch {
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const q = e.target.value;
        setQuery(q);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => search(q), 300);
    };

    const handleFocus = () => {
        updateDropdownPos();
        setOpen(true);
        if (results.length === 0) search(query);
    };

    const handleSelect = (cat: Category) => {
        const name = cat.parentName ? `${cat.parentName} › ${cat.name}` : cat.name;
        onChange(cat.slug, cat.name);
        setDisplayName(name);
        setQuery("");
        setOpen(false);
        setResults([]);
    };

    const handleSelectDefault = () => {
        onChange("_default", "Banner Mặc Định");
        setDisplayName("Banner Mặc Định");
        setQuery("");
        setOpen(false);
    };

    const isDefault = value === "_default";

    return (
        <>
            <div ref={containerRef} className="relative w-full max-w-sm">
                {/* Input */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={open ? query : ""}
                        onChange={handleInput}
                        onFocus={handleFocus}
                        placeholder={open ? "Gõ tên danh mục để tìm..." : displayName || placeholder || "Chọn danh mục..."}
                        className="w-full pl-9 pr-9 py-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-500 transition-colors cursor-pointer"
                    />
                    {open ? (
                        <button
                            type="button"
                            onMouseDown={e => { e.preventDefault(); setOpen(false); setQuery(""); }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    ) : (
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    )}
                </div>

                {/* Tag đang chọn */}
                {!open && value && (
                    <div className="mt-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full border ${
                            isDefault
                                ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                                : "bg-blue-50 text-blue-700 border-blue-200"
                        }`}>
                            {isDefault ? "⭐" : "📂"}
                            {displayName}
                        </span>
                    </div>
                )}
            </div>

            {/* Dropdown — fixed, nằm ngoài mọi overflow:hidden */}
            {open && (
                <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-72 overflow-y-auto"
                >
                    {/* Option mặc định — luôn đầu danh sách */}
                    <button
                        type="button"
                        onMouseDown={e => { e.preventDefault(); handleSelectDefault(); }}
                        className={`w-full flex items-start gap-2.5 px-4 py-2.5 text-sm text-left border-b border-slate-100 transition-colors ${
                            isDefault ? "bg-yellow-50" : "hover:bg-yellow-50"
                        }`}
                    >
                        <span className="text-base mt-0.5 leading-none flex-shrink-0">⭐</span>
                        <div>
                            <div className={`font-semibold ${isDefault ? "text-yellow-700" : "text-slate-700"}`}>
                                Banner Mặc Định
                            </div>
                            <div className="text-xs text-slate-400">
                                Áp dụng chung cho tất cả danh mục chưa có banner riêng
                            </div>
                        </div>
                    </button>

                    {/* Kết quả search */}
                    {loading ? (
                        <div className="flex items-center justify-center gap-2 py-5 text-slate-400 text-sm">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Đang tìm kiếm...
                        </div>
                    ) : results.length === 0 && query ? (
                        <div className="py-5 text-center text-sm text-slate-400">
                            Không tìm thấy &quot;{query}&quot;
                        </div>
                    ) : results.length === 0 ? (
                        <div className="py-5 text-center text-sm text-slate-400">
                            Gõ tên danh mục để tìm kiếm...
                        </div>
                    ) : (
                        results.map(cat => {
                            const hasBanner = (config_categoryBanners_ref?.[cat.slug]?.banners?.length ?? 0) > 0;
                            const isSelected = value === cat.slug;
                            return (
                                <button
                                    key={cat.slug}
                                    type="button"
                                    onMouseDown={e => { e.preventDefault(); handleSelect(cat); }}
                                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors ${
                                        isSelected ? "bg-blue-50" : "hover:bg-slate-50"
                                    }`}
                                >
                                    <div className="min-w-0">
                                        <div className={`font-medium truncate ${isSelected ? "text-blue-700" : "text-slate-800"}`}>
                                            {cat.name}
                                        </div>
                                        {cat.parentName && (
                                            <div className="text-[11px] text-slate-400 truncate">
                                                {cat.parentName} › {cat.name}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                                        {hasBanner && (
                                            <span className="text-[10px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
                                                ✅ Có banner
                                            </span>
                                        )}
                                        <span className="text-xs text-slate-400 tabular-nums">
                                            {cat.count ?? 0} SP
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            )}
        </>
    );
}
