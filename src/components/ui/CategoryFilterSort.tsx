"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Button } from './Button';
import { Input } from './Input';

export function CategoryFilterSort() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();

    const currentMinPrice = searchParams.get('minPrice') || '';
    const currentMaxPrice = searchParams.get('maxPrice') || '';
    const currentSort = searchParams.get('sort') || 'date-desc';

    const [minPrice, setMinPrice] = useState(currentMinPrice);
    const [maxPrice, setMaxPrice] = useState(currentMaxPrice);

    const applyFilters = () => {
        const params = new URLSearchParams(searchParams.toString());

        if (minPrice) params.set('minPrice', minPrice);
        else params.delete('minPrice');

        if (maxPrice) params.set('maxPrice', maxPrice);
        else params.delete('maxPrice');

        // Reset pagination
        params.delete('after');

        router.push(`${pathname}?${params.toString()}`);
    };

    const clearFilters = () => {
        setMinPrice('');
        setMaxPrice('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('minPrice');
        params.delete('maxPrice');
        params.delete('after');
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const sort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());

        if (sort !== 'date-desc') params.set('sort', sort);
        else params.delete('sort');

        // Reset pagination
        params.delete('after');

        router.push(`${pathname}?${params.toString()}`);
    };

    return (
        <div className="space-y-6">
            {/* Sorting */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Sắp xếp theo</h3>
                <select
                    className="w-full border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                    value={currentSort}
                    onChange={handleSortChange}
                >
                    <option value="date-desc">Mới nhất</option>
                    <option value="price-asc">Giá: Thấp đến cao</option>
                    <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
            </div>

            {/* Filtering */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Lọc theo giá</h3>

                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Input
                            type="number"
                            placeholder="Từ (đ)"
                            className="w-full text-sm"
                            value={minPrice}
                            onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                            type="number"
                            placeholder="Đến (đ)"
                            className="w-full text-sm"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button className="w-full" size="sm" onClick={applyFilters}>Áp dụng</Button>
                        <Button variant="outline" className="w-full" size="sm" onClick={clearFilters}>Xóa</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
