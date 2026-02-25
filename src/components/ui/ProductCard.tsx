"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useRelatedProductsModalStore } from '@/store/useRelatedProductsModalStore';
import { fetchRelatedProducts } from '@/app/actions/productActions';
import { Loader2 } from 'lucide-react';

interface ProductCardProps {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
    sku?: string;
    regularPrice?: string;
    salePrice?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({ id, databaseId, name, price, imageUrl, slug, sku, regularPrice, salePrice }) => {
    const [isPending, startTransition] = React.useTransition();
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

        // Use transition to fetch related products without blocking
        startTransition(async () => {
            const related = await fetchRelatedProducts(slug);
            useRelatedProductsModalStore.getState().openModal(related);
        });
    };

    const numericRegular = regularPrice ? parseInt(regularPrice.replace(/\D/g, '')) : 0;
    const numericSale = salePrice ? parseInt(salePrice.replace(/\D/g, '')) : 0;
    const discountPercent = (numericRegular && numericSale && numericRegular > numericSale)
        ? Math.round(((numericRegular - numericSale) / numericRegular) * 100)
        : 0;

    return (
        <div className="group flex flex-col overflow-hidden rounded-xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-shadow duration-300 relative">
            {discountPercent > 0 && (
                <div className="absolute top-3 left-3 z-10 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                    GIẢM {discountPercent}%
                </div>
            )}
            <Link href={`/${slug}`} className="relative aspect-square w-full bg-white overflow-hidden p-2 md:p-3">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gray-50 text-gray-400 rounded-lg">
                        No Image
                    </div>
                )}
            </Link>
            <div className="flex flex-1 flex-col p-3">
                <Link href={`/${slug}`}>
                    {sku && <p className="text-[10px] font-medium text-gray-400 mb-1 tracking-wider">Mã: {sku}</p>}
                    <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 uppercase leading-snug">{name}</h3>
                </Link>
                <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <div className="flex flex-col">
                        <p className="text-lg font-black text-gray-900 leading-none">{price.replace(/&nbsp;/g, ' ')}</p>
                        {discountPercent > 0 && regularPrice && (
                            <p className="text-xs text-gray-400 line-through mt-1">{regularPrice.replace(/&nbsp;/g, ' ')}</p>
                        )}
                    </div>
                    <button
                        onClick={handleAddToCart}
                        disabled={isPending}
                        className="w-10 h-10 rounded-xl bg-[#0f172a] text-white hover:bg-blue-600 focus:outline-none transition-colors flex items-center justify-center shrink-0 shadow-md shadow-slate-900/20 disabled:bg-slate-400 disabled:cursor-wait"
                        title="Thêm vào giỏ"
                    >
                        {isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
