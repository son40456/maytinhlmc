"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const { items, removeItem, updateQuantity, getRawTotal } = useCartStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="container mx-auto px-4 py-12 min-h-[50vh]">Đang tải giỏ hàng...</div>;

    const total = getRawTotal();

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    return (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-[60vh]">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Giỏ hàng của bạn</h1>

            {items.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-gray-500 mb-6 text-lg">Giỏ hàng đang trống.</p>
                    <Link href="/category/all">
                        <Button size="lg">Tiếp tục mua sắm</Button>
                    </Link>
                </div>
            ) : (
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Cart Items List */}
                    <div className="w-full lg:w-2/3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 divide-y divide-gray-200">
                            {items.map((item) => (
                                <div key={item.id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                                    {/* Image */}
                                    <div className="relative w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.imageUrl ? (
                                            <Image src={item.imageUrl} alt={item.name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex w-full h-full items-center justify-center text-xs text-gray-400">No Img</div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col items-center justify-center sm:items-start text-center sm:text-left">
                                        <Link href={`/product/${item.slug}`} className="text-lg font-medium text-gray-900 hover:text-blue-600 line-clamp-2">
                                            {item.name}
                                        </Link>
                                        <p className="text-blue-600 font-semibold mt-1">{formatPrice(item.price)}</p>
                                    </div>

                                    {/* Quantity & Actions */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center border border-gray-300 rounded-md w-32 justify-between">
                                            <button
                                                className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                                onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                            >
                                                -
                                            </button>
                                            <span className="text-gray-900 font-medium">{item.quantity}</span>
                                            <button
                                                className="px-3 py-1 hover:bg-gray-100 text-gray-600"
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                            title="Xoá sản phẩm"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="w-full lg:w-1/3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
                            <h2 className="text-xl font-bold text-gray-900 mb-6">Tóm tắt đơn hàng</h2>

                            <div className="flex justify-between mb-4 text-gray-600">
                                <span>Tạm tính</span>
                                <span className="font-medium text-gray-900">{formatPrice(total)}</span>
                            </div>

                            <div className="flex justify-between mb-6 text-gray-600">
                                <span>Phí vận chuyển</span>
                                <span>Tính lúc thanh toán</span>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center mb-8">
                                <span className="text-lg font-bold text-gray-900">Tổng cộng</span>
                                <span className="text-2xl font-bold text-red-600">{formatPrice(total)}</span>
                            </div>

                            <Link href="/checkout" className="block w-full">
                                <Button size="lg" className="w-full text-base font-bold uppercase tracking-wider py-4 h-14 bg-green-600 hover:bg-green-700">
                                    Tiến hành thanh toán
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
