"use client";

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePcBuilderStore } from '@/store/usePcBuilderStore';
import { Settings } from 'lucide-react';

interface BuildPcButtonProps {
    product: {
        id: string;
        databaseId: number;
        name: string;
        price: string;
        imageUrl: string;
        slug: string;
        categorySlugs: string[];
    };
}

// Category slugs mapping to PcBuilder component IDs
const BUILDER_CATEGORIES: Record<string, string> = {
    'mainboard-bo-mach-chu': 'mainboard',
    'cpu-bo-vi-xu-ly': 'cpu',
    'ram-bo-nho-trong': 'ram',
    'vga-card-man-hinh': 'vga',
    'o-cung-ssd': 'ssd',
    'o-cung-hdd': 'hdd',
    'psu-nguon-may-tinh': 'psu',
    'case-vo-may-tinh': 'case',
    'fan-led-tan-nhiet-may-tinh': 'cooler',
    'man-hinh-may-tinh': 'monitor',
    'phim-chuot-ban-ghe-gear': 'keyboard_mouse',
    'loa-tai-nghe-mic-webcam': 'headphone',
};

export const BuildPcButton = ({ product }: BuildPcButtonProps) => {
    const router = useRouter();
    const selectProduct = usePcBuilderStore((state) => state.selectProduct);

    // Filter product categories to find matching builder category ID
    const matchingCategoryId = useMemo(() => {
        for (const slug of product.categorySlugs) {
            if (BUILDER_CATEGORIES[slug]) {
                return BUILDER_CATEGORIES[slug];
            }
        }
        return null; // Return null if this product shouldn't be in PC Builder
    }, [product.categorySlugs]);

    const handleBuildPc = () => {
        if (!matchingCategoryId) return;

        // Add to PC Builder state
        selectProduct(matchingCategoryId, {
            id: product.id,
            databaseId: product.databaseId,
            name: product.name,
            price: product.price,
            image: { sourceUrl: product.imageUrl },
            slug: product.slug,
        });

        // Navigate to PC Builder page
        router.push('/pc-builder');
    };

    if (!matchingCategoryId) {
        return null; // Don't render if product doesn't belong to any PC Builder category
    }

    return (
        <button
            onClick={handleBuildPc}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-purple-500/30 transition-all hover:scale-[1.02] active:scale-95 border border-purple-500/20"
        >
            <Settings size={20} className="animate-[spin_4s_linear_infinite]" />
            Xây dựng PC với sản phẩm này
        </button>
    );
};
