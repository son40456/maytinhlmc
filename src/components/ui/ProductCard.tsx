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
        <div className="group flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
            <Link href={`/${slug}`} className="relative aspect-square w-full bg-white overflow-hidden p-4">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105 p-4"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400 rounded-lg">
                        No Image
                    </div>
                )}
            </Link>
            <div className="flex flex-1 flex-col p-4">
                <Link href={`/${slug}`}>
                    <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2">{name}</h3>
                </Link>
                <p className="mt-2 text-lg font-semibold text-red-600">{price.replace(/&nbsp;/g, ' ')}</p>
                <button
                    onClick={handleAddToCart}
                    className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    Thêm vào giỏ
                </button>
            </div>
        </div>
    );
};
