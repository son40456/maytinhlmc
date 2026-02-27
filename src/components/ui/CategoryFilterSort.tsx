"use client";

import React, { useState } from 'react';
import { X, ChevronDown, SlidersHorizontal, Trash2 } from 'lucide-react';
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

    const brandFilter = filters.find(f => f.slug === 'thuong-hieu');
    const dynamicPriceFilter = filters.find(f => f.slug.startsWith('khoang-gia-'));
    const otherFilters = filters.filter(f => f.slug !== 'thuong-hieu' && !f.slug.startsWith('khoang-gia-'));

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
        <div className={`space-y-4 ${isMobile ? '' : ''}`}>
            {/* Thương hiệu */}
            {brandFilter && (
                <div className={isMobile ? '' : 'flex flex-col md:flex-row md:items-center gap-3'}>
                    <span className="text-xs font-bold text-gray-900 min-w-[100px] block mb-2 md:mb-0">Thương hiệu:</span>
                    <div className={`flex gap-2 ${isMobile ? 'flex-wrap' : 'flex-wrap'}`}>
                        <button
                            onClick={() => onFilterChange(brandFilter.slug, 'all')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${!selectedAttributes[brandFilter.slug]?.length
                                ? 'bg-orange-600 text-white shadow-sm'
                                : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            Tất cả
                        </button>
                        {brandFilter.options.map((opt) => {
                            const isSelected = selectedAttributes[brandFilter.slug]?.includes(opt.slug);
                            const logo = opt.logo || BRAND_LOGOS[opt.slug.toLowerCase()];
                            return (
                                <button
                                    key={opt.slug}
                                    onClick={() => onFilterChange(brandFilter.slug, opt.slug)}
                                    className={`relative h-8 px-3 rounded-lg border-2 transition-all flex items-center justify-center bg-white ${isSelected ? 'border-orange-500' : 'border-gray-100 hover:border-orange-200'
                                        }`}
                                >
                                    {logo ? (
                                        <div className="relative w-14 h-5">
                                            <Image src={logo} alt={opt.name} fill className="object-contain" />
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold">{opt.name}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Khoảng giá */}
            {dynamicPriceFilter && (
                <div className={isMobile ? '' : 'flex flex-col md:flex-row md:items-center gap-3'}>
                    <span className="text-xs font-bold text-gray-900 min-w-[100px] block mb-2 md:mb-0">Khoảng giá:</span>
                    <div className="flex flex-wrap gap-1.5">
                        {dynamicPriceFilter.options.map((opt) => {
                            const isSelected = selectedAttributes[dynamicPriceFilter.slug]?.includes(opt.slug);
                            return (
                                <button
                                    key={opt.slug}
                                    onClick={() => onFilterChange(dynamicPriceFilter.slug, opt.slug)}
                                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all border ${isSelected
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
                <div className={isMobile ? 'space-y-3' : 'flex flex-wrap items-center gap-2 pt-3 border-t border-gray-50'}>
                    {isMobile ? (
                        // Mobile: each filter as collapsible section
                        otherFilters.map((filter) => {
                            const isOpen = openDropdown === filter.slug;
                            return (
                                <div key={filter.slug} className="border border-gray-100 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setOpenDropdown(isOpen ? null : filter.slug)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-bold ${selectedAttributes[filter.slug]?.length > 0 ? 'bg-orange-50 text-orange-700' : 'bg-gray-50 text-gray-700'}`}
                                    >
                                        <span>{filter.name}</span>
                                        <div className="flex items-center gap-2">
                                            {selectedAttributes[filter.slug]?.length > 0 && (
                                                <span className="bg-orange-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center">
                                                    {selectedAttributes[filter.slug].length}
                                                </span>
                                            )}
                                            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-2 py-2 space-y-0.5 bg-white max-h-48 overflow-y-auto">
                                            {filter.options.map((opt) => {
                                                const isSelected = selectedAttributes[filter.slug]?.includes(opt.slug);
                                                return (
                                                    <button
                                                        key={opt.slug}
                                                        onClick={() => onFilterChange(filter.slug, opt.slug)}
                                                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${isSelected ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
                                                    >
                                                        {opt.name}
                                                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        // Desktop: dropdown buttons
                        otherFilters.map((filter) => (
                            <div key={filter.slug} className="relative">
                                <button
                                    onClick={() => setOpenDropdown(openDropdown === filter.slug ? null : filter.slug)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${selectedAttributes[filter.slug]?.length > 0
                                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-400'
                                        }`}
                                >
                                    {filter.name}
                                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === filter.slug ? 'rotate-180' : ''}`} />
                                </button>

                                {openDropdown === filter.slug && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                                        <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 z-20 py-3 animate-in fade-in zoom-in duration-200">
                                            <div className="max-h-64 overflow-y-auto px-2 space-y-1">
                                                {filter.options.map((opt) => {
                                                    const isSelected = selectedAttributes[filter.slug]?.includes(opt.slug);
                                                    return (
                                                        <button
                                                            key={opt.slug}
                                                            onClick={() => onFilterChange(filter.slug, opt.slug)}
                                                            className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'}`}
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
                        ))
                    )}
                </div>
            )}

            {/* Sắp xếp */}
            <div className={isMobile ? '' : 'flex flex-col md:flex-row md:items-center gap-3 pt-3 border-t border-gray-50'}>
                <span className="text-xs font-bold text-gray-900 min-w-[100px] block mb-2 md:mb-0">Sắp xếp:</span>
                <div className="flex flex-wrap gap-1.5 flex-grow">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => { onSortChange(opt.value); if (isMobile) setMobileOpen(false); }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all border ${sortOrder === opt.value
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
        </div>
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
                    <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-hide mb-2" style={{ scrollbarWidth: 'none' }}>
                        {activeTags.map((tag) => (
                            <div
                                key={`${tag.type}-${tag.slug}-${tag.value}`}
                                className="flex items-center gap-1.5 px-2 py-1 rounded-md border border-pink-200 bg-pink-50 text-[10px] font-medium text-gray-800 whitespace-nowrap shrink-0"
                            >
                                {tag.label}
                                <button
                                    onClick={() => tag.type === 'attr' ? onFilterChange(tag.slug, tag.value) : onPriceChange(null, null)}
                                    className="p-0.5 rounded-full bg-red-500 text-white"
                                >
                                    <X size={8} />
                                </button>
                            </div>
                        ))}
                        <button
                            onClick={onClearAll}
                            className="text-[10px] font-bold text-red-500 whitespace-nowrap shrink-0 px-2"
                        >
                            Xóa tất cả
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
                                <FilterContent isMobile={true} />
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
            <div className="hidden lg:block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                <FilterContent />

                {/* Active tags */}
                {activeTags.length > 0 && (
                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50">
                        <span className="text-xs font-bold text-gray-900 min-w-[100px]">Đã chọn:</span>
                        <div className="flex flex-wrap gap-2 items-center">
                            {activeTags.map((tag) => (
                                <div
                                    key={`${tag.type}-${tag.slug}-${tag.value}`}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-pink-200 bg-pink-50 text-xs font-medium text-gray-800"
                                >
                                    {tag.label}
                                    <button
                                        onClick={() => tag.type === 'attr' ? onFilterChange(tag.slug, tag.value) : onPriceChange(null, null)}
                                        className="p-0.5 rounded-full bg-red-500 text-white hover:bg-red-600"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={onClearAll}
                                className="text-xs font-bold text-gray-400 hover:text-red-500 flex items-center gap-1 ml-2"
                            >
                                <Trash2 size={12} /> Xóa tất cả
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}
