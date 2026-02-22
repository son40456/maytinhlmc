"use client";

import React, { useState } from 'react';
import { Button } from './Button';
import { useCartStore } from '@/store/useCartStore';

interface AddToCartButtonProps {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
    stockStatus: string;
    size?: 'sm' | 'md' | 'lg';
}

export const AddToCartButton: React.FC<AddToCartButtonProps> = ({
    id, databaseId, name, price, imageUrl, slug, stockStatus, size = 'lg'
}) => {
    const [quantity, setQuantity] = useState(1);
    const addItem = useCartStore((state) => state.addItem);

    const isOutOfStock = stockStatus === 'OUT_OF_STOCK';

    const handleAddToCart = () => {
        const numericPrice = parseInt(price.replace(/\D/g, '')) || 0;

        addItem({
            id: id,
            productId: databaseId.toString(),
            databaseId,
            name,
            price: numericPrice,
            quantity,
            imageUrl,
            slug
        });
        alert('Đã thêm sản phẩm vào giỏ hàng!');
    };

    if (isOutOfStock) {
        return (
            <Button size={size} disabled className={`w-full uppercase font-bold tracking-wide bg-gray-400 cursor-not-allowed ${size === 'lg' ? 'h-14 text-base' : 'h-10 text-xs'}`}>
                Hết hàng
            </Button>
        );
    }

    return (
        <div className={`flex flex-col ${size === 'sm' ? 'gap-0' : 'gap-4'}`}>
            {size !== 'sm' && (
                <div className="flex items-center gap-4">
                    <span className="font-medium text-gray-700">Số lượng:</span>
                    <div className="flex items-center border border-gray-300 rounded-md">
                        <button
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                            -
                        </button>
                        <span className="px-4 py-1 text-gray-900 font-medium">{quantity}</span>
                        <button
                            className="px-3 py-1 hover:bg-gray-100 text-gray-600 font-bold"
                            onClick={() => setQuantity(quantity + 1)}
                        >
                            +
                        </button>
                    </div>
                </div>
            )}
            <Button
                size={size}
                onClick={handleAddToCart}
                className={`w-full uppercase font-bold tracking-wide ${size === 'lg' ? 'h-14 text-base mt-2' : 'h-10 text-xs px-4'}`}
            >
                {size === 'sm' ? 'Mua ngay' : 'Thêm vào giỏ hàng'}
            </Button>
        </div>
    );
};
