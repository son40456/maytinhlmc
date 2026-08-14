"use client";

import React, { useState, memo, useCallback, useEffect, useRef } from 'react';
import { X, ChevronDown, SlidersHorizontal, Trash2, Tag } from 'lucide-react';
import Image from 'next/image';

interface FilterOption {
    name: string;
    slug: string;
    rawSlug: string;
    options: { name: string; slug: string; logo?: string }[];
}

interface CategoryFilterSortProps {
    filters: FilterOption[];
    selectedAttributes: Record<string, string[]>;
    onFilterChange: (slug: string, value: string) => void;
    priceRange: { min: number | null; max: number | null };
    onPriceChange: (min: number | null, max: number | null) => void;
    sortOrder: string;
    onSortChange: (sort: string) => void;
    onClearAll: () => void;
}

const BRAND_LOGOS: Record<string, string> = {
    'asus': 'https://maytinhlmc.vn/wp-content/uploads/logo-asus-1.png',
    'msi': 'https://maytinhlmc.vn/wp-content/uploads/logo-msi.png',
    'gigabyte': 'https://maytinhlmc.vn/wp-content/uploads/logo-gigabyte.png',
    'colorful': 'https://maytinhlmc.vn/wp-content/uploads/logo-colorful.png',
    'asrock': 'https://maytinhlmc.vn/wp-content/uploads/logo-asrock.png',
    'intel': 'https://maytinhlmc.vn/wp-content/uploads/logo-intel-1.png',
    'amd': 'https://maytinhlmc.vn/wp-content/uploads/logo-amd-1.png',
    'corsair': 'https://maytinhlmc.vn/wp-content/uploads/logo-corsair.png',
    'kingston': 'https://maytinhlmc.vn/wp-content/uploads/logo-kingston.png',
    'samsung': 'https://maytinhlmc.vn/wp-content/uploads/logo-samsung.png',
};

const SORT_OPTIONS = [
    { label: "Mới nhất", value: "DATE_DESC", icon: "🕒" },
    { label: "Giá tăng dần", value: "PRICE_ASC", icon: "📈" },
    { label: "Giá giảm dần", value: "PRICE_DESC", icon: "📉" },
    { label: "Lượt xem", value: "TOTAL_SALES_DESC", icon: "👁️" },
    { label: "Đánh giá", value: "RATING_DESC", icon: "⭐" },
    { label: "Tên A->Z", value: "NAME_ASC", icon: "🔤" },
];

// ─────────────────────────────────────────────────────────────
// BrandButton: separate memoized component so that:
// 1. Clicking one brand does NOT restart animation of others
// 2. Deselect plays a smooth reverse animation before unmounting
// ─────────────────────────────────────────────────────────────
const TRACE_MS = 520;   // border draw duration (ms)
const EXIT_MS  = 520;   // border retract duration (ms)

type AnimPhase = 'hidden' | 'showing' | 'hiding';

const BrandButton = memo(function BrandButton({
    opt,
    brandSlug,
    isSelected,
    onFilterChange,
}: {
    opt: { name: string; slug: string; logo?: string };
    brandSlug: string;
    isSelected: boolean;
    onFilterChange: (slug: string, value: string) => void;
}) {
    const logo = opt.logo || BRAND_LOGOS[opt.slug.toLowerCase()];

    // animPhase drives which CSS animation class is applied
    const [animPhase, setAnimPhase] = useState<AnimPhase>(isSelected ? 'showing' : 'hidden');
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);

        if (isSelected) {
            // Mount overlay and play enter animation
            setAnimPhase('showing');
        } else {
            // Only play exit if we were showing something
            setAnimPhase(prev => {
                if (prev === 'hidden') return 'hidden'; // nothing to hide
                return 'hiding';
            });
            // Unmount overlay after exit animation fully completes
            // border (EXIT_MS) + checkmark fade (300ms) + buffer
            timerRef.current = setTimeout(() => setAnimPhase('hidden'), EXIT_MS + 350);
        }

        return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }, [isSelected]);

    const showOverlay = animPhase !== 'hidden';
    const isHiding    = animPhase === 'hiding';

    return (
        <button
            onClick={() => onFilterChange(brandSlug, opt.slug)}
            className={`relative h-10 px-3 rounded-lg border-2 transition-colors duration-200 flex items-center justify-center bg-white overflow-visible ${
                isSelected ? 'border-transparent' : 'border-gray-100 hover:border-orange-200'
            }`}
        >
            {logo ? (
                <div className="relative w-20 h-7">
                    <Image src={logo} alt={opt.name} fill className="object-contain" sizes="80px" unoptimized={true} />
                </div>
            ) : (
                <span className="text-xs font-bold">{opt.name}</span>
            )}

            {showOverlay && (
                <>
                    {/* SVG border: enter = trace CW from top-right, exit = retract */}
                    <svg
                        aria-hidden="true"
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            overflow: 'visible',
                            pointerEvents: 'none',
                        }}
                    >
                        <rect
                            x="1"
                            y="1"
                            width="99%"
                            height="38"
                            rx="8"
                            fill="none"
                            stroke="#f97316"
                            strokeWidth="2"
                            pathLength="100"
                            className={isHiding ? 'brand-border-trace-out' : 'brand-border-trace'}
                        />
                    </svg>

                    {/* Checkmark: pops in after border, shrinks out before border retracts */}
                    <span
                        aria-hidden="true"
                        className={isHiding ? 'brand-checkmark-pop-out' : 'brand-checkmark-pop'}
                        style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            backgroundColor: '#f97316',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(249,115,22,0.55)',
                            pointerEvents: 'none',
                            // enter: wait for border; exit: border first, then checkmark
                            animationDelay: isHiding ? `${EXIT_MS}ms` : `${TRACE_MS}ms`,
                            animationFillMode: 'both',
                        }}
                    >
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                            <polyline
                                points="1.5,6 4.5,9 10.5,3"
                                stroke="white"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            />
                        </svg>
                    </span>
                </>
            )}
        </button>
    );
});

export function CategoryFilterSort({
    filters = [],
    selectedAttributes,
    onFilterChange,
    priceRange,
    onPriceChange,
    sortOrder,
    onSortChange,
    onClearAll
}: CategoryFilterSortProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

    // Stable reference so React.memo on BrandButton works correctly
    const stableOnFilterChange = useCallback(onFilterChange, [onFilterChange]);

    const brandFilter = filters.find(f => f.slug === 'thuong-hieu');
    const dynamicPriceFilter = filters.find(f => f.slug.startsWith('khoang-gia-'));
    const otherFilters = filters.filter(f => f.slug !== 'thuong-hieu' && !f.slug.startsWith('khoang-gia-'));

    // Sort price range options by extracting the leading number from the slug.
    // slug formats: 'duoi-2-trieu' → 0, '2-trieu-4-trieu' → 2, 'tren-8-trieu' → 8.5 (always last)
    const sortedPriceOptions = dynamicPriceFilter
        ? [...dynamicPriceFilter.options].sort((a, b) => {
            const getMin = (slug: string): number => {
                if (slug.startsWith('duoi-') || slug.startsWith('under-')) return 0;
                if (slug.startsWith('tren-') || slug.startsWith('over-')) return Infinity;
                const match = slug.match(/^(\d+(?:[.,]\d+)?)/);
                return match ? parseFloat(match[1].replace(',', '.')) : 999;
            };
            return getMin(a.slug) - getMin(b.slug);
        })
        : [];

    // Count active filters
    const activeCount = Object.values(selectedAttributes).reduce((sum, arr) => sum + arr.length, 0)
        + (priceRange.min !== null || priceRange.max !== null ? 1 : 0);

    // Get active tags
    const activeTags: { type: string, slug: string, value: string, label: string }[] = [];
    Object.entries(selectedAttributes).forEach(([slug, values]) => {
        const filter = filters.find(f => f.slug === slug);
        values.forEach(val => {
            const option = filter?.options.find(o => o.slug === val);
            activeTags.push({ type: 'attr', slug, value: val, label: option?.name || val });
        });
    });

    if (priceRange?.min !== null || priceRange?.max !== null) {
        if (priceRange?.min !== undefined && priceRange?.max !== undefined) {
            activeTags.push({
                type: 'price', slug: 'price', value: 'price',
                label: `${priceRange.min?.toLocaleString() || 0} - ${priceRange.max?.toLocaleString() || '...'}`
            });
        }
    }

    // Filter content (shared between desktop and mobile drawer)
    const FilterContent = ({ isMobile = false }: { isMobile?: boolean }) => (
        <div className={`space-y-2 ${isMobile ? '' : ''}`}>
            {/* Thương hiệu */}
            {brandFilter && (
                <div className={isMobile ? '' : 'flex flex-col md:flex-row md:items-start gap-3'}>
                    <span className="text-[18px] font-semibold text-gray-900 w-[170px] shrink-0 whitespace-nowrap block mb-2 md:mb-0 md:pt-1">Thương hiệu:</span>
                    <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : 'flex-wrap'}`}>
                        <button
                            onClick={() => onFilterChange(brandFilter.slug, 'all')}
                            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${!selectedAttributes[brandFilter.slug]?.length
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Tất cả
                        </button>
                        {brandFilter.options.map((opt) => (
                            <BrandButton
                                key={opt.slug}
                                opt={opt}
                                brandSlug={brandFilter.slug}
                                isSelected={!!selectedAttributes[brandFilter.slug]?.includes(opt.slug)}
                                onFilterChange={stableOnFilterChange}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Khoảng giá */}
            {dynamicPriceFilter && (
                <div className={isMobile ? '' : 'flex flex-col md:flex-row md:items-start gap-3'}>
                    <span className="text-[18px] font-semibold text-gray-900 w-[170px] shrink-0 whitespace-nowrap block mb-2 md:mb-0 md:pt-1">Khoảng giá:</span>
                    <div className="flex flex-wrap gap-2">
                        {sortedPriceOptions.map((opt) => {
                            const isSelected = selectedAttributes[dynamicPriceFilter.slug]?.includes(opt.slug);
                            return (
                                <button
                                    key={opt.slug}
                                    onClick={() => onFilterChange(dynamicPriceFilter.slug, opt.slug)}
                                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all border ${isSelected
                                        ? 'bg-orange-600 border-orange-600 text-white shadow-sm'
                                        : 'bg-gray-50 border-gray-100 text-gray-600 hover:border-orange-300'
                                        }`}
                                >
                                    {opt.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Thuộc tính kỹ thuật */}
            {otherFilters.length > 0 && (
                <div className={isMobile ? 'space-y-3' : 'flex flex-col md:flex-row md:items-start gap-3 pt-3 border-t border-gray-50'}>
                    {isMobile ? (
                        <>
                            <h4 className="text-[15px] font-bold text-gray-900 mb-1">Chọn theo tiêu chí:</h4>
                            {otherFilters.map((filter) => {
                                const isExpanded = expandedSections.has(filter.slug);
                                const maxVisible = 6;
                                const visibleOptions = isExpanded ? filter.options : filter.options.slice(0, maxVisible);
                                const hasMore = filter.options.length > maxVisible;

                                return (
                                    <div key={filter.slug} className="pb-3 border-b border-gray-100 last:border-0">
                                        <h4 className="text-xs font-black text-gray-800 uppercase tracking-wider mb-2.5">{filter.name}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {visibleOptions.map((opt) => {
                                                const isSelected = selectedAttributes[filter.slug]?.includes(opt.slug);
                                                return (
                                                    <button
                                                        key={opt.slug}
                                                        onClick={() => onFilterChange(filter.slug, opt.slug)}
                                                        className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all border ${isSelected
                                                            ? 'bg-orange-600 border-orange-600 text-white'
                                                            : 'bg-white border-gray-200 text-gray-700 active:bg-gray-100'
                                                            }`}
                                                    >
                                                        {opt.name}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                        {hasMore && (
                                            <button
                                                onClick={() => {
                                                    const next = new Set(expandedSections);
                                                    if (isExpanded) next.delete(filter.slug);
                                                    else next.add(filter.slug);
                                                    setExpandedSections(next);
                                                }}
                                                className="mt-2 text-xs font-bold text-orange-500 flex items-center gap-1"
                                            >
                                                {isExpanded ? 'Thu gọn' : 'Xem thêm'}
                                                <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            <span className="text-[18px] font-semibold text-gray-900 w-[170px] shrink-0 whitespace-nowrap block mb-2 md:mb-0 md:pt-2">Chọn theo tiêu chí:</span>
                            <div className="flex flex-wrap items-center gap-2">
                                {otherFilters.map((filter) => (
                                    <div key={filter.slug} className="relative">
                                        <button
                                            onClick={() => setOpenDropdown(openDropdown === filter.slug ? null : filter.slug)}
                                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold uppercase tracking-wider transition-all ${selectedAttributes[filter.slug]?.length > 0
                                                ? 'border-orange-500 bg-orange-50 text-orange-700'
                                                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'
                                                }`}
                                        >
                                            {filter.name}
                                            <ChevronDown className={`w-4 h-4 transition-transform ${openDropdown === filter.slug ? 'rotate-180' : ''}`} />
                                        </button>

                                        {openDropdown === filter.slug && (
                                            <>
                                                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                                                <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-3 animate-in fade-in zoom-in duration-200">
                                                    <div className="max-h-72 overflow-y-auto px-2 space-y-1">
                                                        {filter.options.map((opt) => {
                                                            const isSelected = selectedAttributes[filter.slug]?.includes(opt.slug);
                                                            return (
                                                                <button
                                                                    key={opt.slug}
                                                                    onClick={() => onFilterChange(filter.slug, opt.slug)}
                                                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                                                                >
                                                                    {opt.name}
                                                                    {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )
            }


            {/* Sắp xếp */}
            <div className={isMobile ? '' : 'flex flex-col md:flex-row md:items-start gap-3 pt-3 border-t border-gray-50'}>
                <span className="text-[18px] font-semibold text-gray-900 w-[170px] shrink-0 whitespace-nowrap block mb-2 md:mb-0 md:pt-1">Sắp xếp:</span>
                <div className="flex flex-wrap gap-2 flex-grow">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onSortChange(opt.value); if (isMobile) setMobileOpen(false); }}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${sortOrder === opt.value
                                ? 'bg-orange-600 border-orange-600 text-white font-bold shadow-sm'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-orange-300'
                                }`}
                        >
                            <span className="text-xs">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
        </div >
    );

    return (
        <>
            {/* ===== MOBILE: Compact bar + Drawer ===== */}
            <div className="lg:hidden">
                {/* Compact Sort + Filter Bar */}
                <div className="flex items-center gap-2 mb-3">
                    {/* Sort quick select on mobile */}
                    <div className="flex-1 flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5" style={{ scrollbarWidth: 'none' }}>
                        {SORT_OPTIONS.slice(0, 4).map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => onSortChange(opt.value)}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border whitespace-nowrap shrink-0 ${sortOrder === opt.value
                                    ? 'bg-orange-600 border-orange-600 text-white font-bold'
                                    : 'bg-white border-gray-200 text-gray-600'
                                    }`}
                            >
                                <span className="text-xs">{opt.icon}</span>
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Filter Button */}
                    <button
                        onClick={() => setMobileOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-700 shrink-0 relative"
                    >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Lọc
                        {activeCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {activeCount}
                            </span>
                        )}
                    </button>
                </div>

                {/* Active tags on mobile */}
                {activeTags.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-2 items-center" style={{ scrollbarWidth: 'none' }}>
                        {activeTags.map((tag) => {
                            const isBrand = tag.slug === 'thuong-hieu';
                            return (
                                <div
                                    key={`${tag.type}-${tag.slug}-${tag.value}`}
                                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold whitespace-nowrap shrink-0 ${
                                        isBrand
                                            ? 'bg-red-50 border-red-200 text-red-600'
                                            : 'bg-blue-50 border-blue-200 text-blue-600'
                                    }`}
                                >
                                    {isBrand
                                        ? <Tag size={10} className="shrink-0" />
                                        : <SlidersHorizontal size={10} className="shrink-0" />
                                    }
                                    <span>{tag.label}</span>
                                    <button
                                        onClick={() => tag.type === 'attr' ? onFilterChange(tag.slug, tag.value) : onPriceChange(null, null)}
                                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                                            isBrand ? 'bg-red-400 hover:bg-red-500 text-white' : 'bg-blue-400 hover:bg-blue-500 text-white'
                                        }`}
                                    >
                                        <X size={8} />
                                    </button>
                                </div>
                            );
                        })}
                        <button
                            onClick={onClearAll}
                            className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1 whitespace-nowrap shrink-0 px-2 py-1 rounded-full border border-gray-200 hover:border-gray-300 transition-colors"
                        >
                            <X size={10} /> Xóa tất cả
                        </button>
                    </div>
                )}

                {/* Mobile Drawer Overlay */}
                {mobileOpen && (
                    <>
                        <div className="fixed inset-0 bg-black/40 z-50" onClick={() => setMobileOpen(false)} />
                        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl max-h-[85vh] flex flex-col animate-in slide-in-from-bottom duration-300">
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0">
                                <h3 className="text-base font-bold text-gray-900">Bộ lọc & Sắp xếp</h3>
                                <div className="flex items-center gap-3">
                                    {activeCount > 0 && (
                                        <button
                                            onClick={onClearAll}
                                            className="text-xs font-bold text-red-500 flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Xóa tất cả
                                        </button>
                                    )}
                                    <button
                                        onClick={() => setMobileOpen(false)}
                                        className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Drawer Body */}
                            <div className="overflow-y-auto flex-1 px-4 py-4">
                                {FilterContent({ isMobile: true })}
                            </div>

                            {/* Drawer Footer */}
                            <div className="px-4 py-3 border-t border-gray-100 shrink-0">
                                <button
                                    onClick={() => setMobileOpen(false)}
                                    className="w-full py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-lg"
                                >
                                    Xem kết quả
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* ===== DESKTOP: Full inline filter ===== */}
            <div className="hidden lg:block bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-gray-100 space-y-4">
                {FilterContent({})}

                {/* Active tags - desktop */}
                {activeTags.length > 0 && (
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                        <span className="text-xs font-bold text-gray-500 shrink-0 min-w-[60px]">Đã chọn:</span>
                        <div className="flex flex-wrap gap-2 items-center">
                            {activeTags.map((tag) => {
                                const isBrand = tag.slug === 'thuong-hieu';
                                return (
                                    <div
                                        key={`${tag.type}-${tag.slug}-${tag.value}`}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${
                                            isBrand
                                                ? 'bg-red-50 border-red-200 text-red-600'
                                                : 'bg-blue-50 border-blue-200 text-blue-600'
                                        }`}
                                    >
                                        {isBrand
                                            ? <Tag size={11} className="shrink-0" />
                                            : <SlidersHorizontal size={11} className="shrink-0" />
                                        }
                                        <span>{tag.label}</span>
                                        <button
                                            onClick={() => tag.type === 'attr' ? onFilterChange(tag.slug, tag.value) : onPriceChange(null, null)}
                                            className={`ml-0.5 w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                                                isBrand
                                                    ? 'bg-red-400 hover:bg-red-600 text-white'
                                                    : 'bg-blue-400 hover:bg-blue-600 text-white'
                                            }`}
                                        >
                                            <X size={9} />
                                        </button>
                                    </div>
                                );
                            })}
                            <button
                                onClick={onClearAll}
                                className="text-xs font-semibold text-gray-400 hover:text-gray-700 flex items-center gap-1 px-3 py-1.5 rounded-full border border-gray-200 hover:border-gray-300 transition-colors ml-1"
                            >
                                <X size={11} /> Xóa tất cả
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
