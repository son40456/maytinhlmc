"use client";

import React, { useState } from 'react';
import { X, ChevronDown, Filter, Trash2 } from 'lucide-react';
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

// Dùng danh sách map Logo từ WordPress backend do WPGraphQL Taxonomy Enum mặc định không hỗ trợ trường Image/Avatar
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
    priceRange, // Dùng tạm dự phòng nếu cần nhập tay
    onPriceChange,
    sortOrder,
    onSortChange,
    onClearAll
}: CategoryFilterSortProps) {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    const brandFilter = filters.find(f => f.slug === 'thuong-hieu');
    const dynamicPriceFilter = filters.find(f => f.slug.startsWith('khoang-gia-'));
    const otherFilters = filters.filter(f => f.slug !== 'thuong-hieu' && !f.slug.startsWith('khoang-gia-'));

    // Get active tags
    const activeTags: { type: string, slug: string, value: string, label: string }[] = [];
    Object.entries(selectedAttributes).forEach(([slug, values]) => {
        const filter = filters.find(f => f.slug === slug);
        values.forEach(val => {
            const option = filter?.options.find(o => o.slug === val);
            activeTags.push({
                type: 'attr',
                slug,
                value: val,
                label: option?.name || val
            });
        });
    });

    if (priceRange?.min !== null || priceRange?.max !== null) {
        if (priceRange?.min !== undefined && priceRange?.max !== undefined) {
            activeTags.push({
                type: 'price',
                slug: 'price',
                value: 'price',
                label: `${priceRange.min?.toLocaleString() || 0} - ${priceRange.max?.toLocaleString() || '...'}`
            });
        }
    }

    return (
        <div className="bg-white rounded-3xl p-6 lg:p-8 shadow-sm border border-gray-100 space-y-6">

            {/* 1. Thương hiệu */}
            {brandFilter && (
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="text-sm font-bold text-gray-900 min-w-[120px]">Chọn thương hiệu:</span>
                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={() => onFilterChange(brandFilter.slug, 'all')}
                            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${!selectedAttributes[brandFilter.slug]?.length
                                ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/30'
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
                                    className={`relative h-10 px-4 rounded-xl border-2 transition-all flex items-center justify-center bg-white ${isSelected ? 'border-orange-500 scale-105' : 'border-gray-100 hover:border-orange-200'
                                        }`}
                                >
                                    {logo ? (
                                        <div className="relative w-16 h-6">
                                            <Image src={logo} alt={opt.name} fill className="object-contain" />
                                        </div>
                                    ) : (
                                        <span className="text-xs font-bold">{opt.name}</span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* 2. Khoảng giá (Động theo thuộc tính chuyên mục) */}
            {dynamicPriceFilter && (
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <span className="text-sm font-bold text-gray-900 min-w-[120px]">Chọn khoảng giá:</span>
                    <div className="flex flex-wrap gap-2">
                        {dynamicPriceFilter.options.map((opt) => {
                            const isSelected = selectedAttributes[dynamicPriceFilter.slug]?.includes(opt.slug);
                            return (
                                <button
                                    key={opt.slug}
                                    onClick={() => onFilterChange(dynamicPriceFilter.slug, opt.slug)}
                                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${isSelected
                                        ? 'bg-orange-600 border-orange-600 text-white shadow-md'
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

            {/* 3. Tags đã chọn */}
            {activeTags.length > 0 && (
                <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-gray-50">
                    <span className="text-sm font-bold text-gray-900 min-w-[120px]">Chọn theo tiêu chí:</span>
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

            {/* 4. Thuộc tính kỹ thuật */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-50">
                {otherFilters.map((filter) => (
                    <div key={filter.slug} className="relative">
                        <button
                            onClick={() => setOpenDropdown(openDropdown === filter.slug ? null : filter.slug)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all ${selectedAttributes[filter.slug]?.length > 0
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
                                                    onClick={() => {
                                                        onFilterChange(filter.slug, opt.slug);
                                                        // setOpenDropdown(null); // Keep open for multi-select
                                                    }}
                                                    className={`w-full text-left px-4 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${isSelected ? 'bg-orange-50 text-orange-600 font-bold' : 'hover:bg-gray-50 text-gray-700'
                                                        }`}
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

            {/* 5. Sắp xếp */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 pt-4 border-t border-gray-50">
                <span className="text-sm font-bold text-gray-900 min-w-[120px]">Sắp xếp theo:</span>
                <div className="flex flex-wrap gap-2 flex-grow">
                    {SORT_OPTIONS.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => onSortChange(opt.value)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all border ${sortOrder === opt.value
                                ? 'bg-orange-600 border-orange-600 text-white font-bold shadow-md'
                                : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-white hover:border-orange-300'
                                }`}
                        >
                            <span className="text-sm">{opt.icon}</span>
                            {opt.label}
                        </button>
                    ))}
                </div>

                <button
                    onClick={onClearAll}
                    className="hidden lg:flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-full text-sm font-bold hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30"
                >
                    Xóa bộ lọc
                </button>
            </div>
        </div>
    );
}
