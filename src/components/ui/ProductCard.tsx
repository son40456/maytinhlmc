"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';

interface ProductCardProps {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ id, databaseId, name, price, imageUrl, slug }) => {
    const addItem = useCartStore(state => state.addItem);

    const handleAddToCart = () => {
        // Parse simple price logic (strip spaces/VND symbol for a raw number if possible, or just default to 0 and handle real parsing later if complex)
        const numericPrice = parseInt(price.replace(/\D/g, '')) || 0;

        addItem({
            id: id,
            productId: databaseId.toString(),
            databaseId,
            name,
            price: numericPrice,
            quantity: 1,
            imageUrl,
            slug
        });
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    };

    return (
        <div className="group flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white hover:shadow-lg transition-shadow duration-200">
            <Link href={`/product/${slug}`} className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                        No Image
                    </div>
                )}
            </Link>
            <div className="flex flex-1 flex-col p-4">
                <Link href={`/product/${slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">{name}</h3>
                </Link>
                <p className="mt-2 text-lg font-semibold text-gray-900">{price}</p>
                <button
                    onClick={handleAddToCart}
                    className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    );
};
