"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from './Button';
import { Input } from './Input';

interface FilterOption {
    name: string;
    slug: string;
    rawSlug: string;
    options: { name: string; slug: string }[];
}

export function CategoryFilterSort({ filters = [] }: { filters?: FilterOption[] }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentSort = searchParams.get('sort') || 'date-desc';

    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

    const updateParams = (newParams: Record<string, string | null>) => {
        const params = new URLSearchParams(searchParams.toString());
        Object.entries(newParams).forEach(([key, value]) => {
            if (value === null) params.delete(key);
            else params.set(key, value);
        });
        params.delete('after'); // Reset pagination
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        updateParams({ sort: value === 'date-desc' ? null : value });
    };

    const handleFilterChange = (slug: string, value: string) => {
        const current = searchParams.get(slug);
        updateParams({ [slug]: current === value ? null : value });
    };

    return (
        <div className="space-y-6">
            {/* Sorting */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Sắp xếp theo</h3>
                <select
                    className="w-full border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white cursor-pointer"
                    value={currentSort}
                    onChange={handleSortChange}
                >
                    <option value="date-desc">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
            </div>

            {/* Dynamic Filters */}
            {filters.map((filter) => (
                <div key={filter.slug} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                    <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Lọc theo {filter.name}</h3>
                    <div className="flex flex-wrap gap-2">
                        {filter.options.map((option) => {
                            const isActive = searchParams.get(filter.slug) === option.slug;
                            return (
                                <button
                                    key={option.slug}
                                    onClick={() => handleFilterChange(filter.slug, option.slug)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all border ${isActive
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                        : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'
                                        }`}
                                >
                                    {option.name}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}

            {/* Price Filtering */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 mb-3 uppercase tracking-wider">Khoảng giá (đ)</h3>
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Từ"
                            className="w-full text-xs"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="text-gray-400">-</span>
                        <Input
                            type="number"
                            placeholder="Đến"
                            className="w-full text-xs"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            className="w-full text-xs h-9 bg-blue-600 hover:bg-blue-700"
                            onClick={() => updateParams({ minPrice: minPrice || null, maxPrice: maxPrice || null })}
                        >
                            Áp dụng
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full text-xs h-9"
                            onClick={() => {
                                setMinPrice('');
                                setMaxPrice('');
                                updateParams({ minPrice: null, maxPrice: null });
                            }}
                        >
                            Xóa
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
