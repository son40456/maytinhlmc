"use client";

import React from 'react';
import Image from 'next/image';
import { X, CheckCircle, ArrowLeft, ShoppingCart, Sparkles, ChevronLeft, ChevronRight, ShoppingCart as CartPlus } from 'lucide-react';
import Link from 'next/link';

interface RelatedProduct {
    id: string;
    databaseId?: number;
    name: string;
    price: string | number;
    slug?: string;
    image: string;
}

interface RelatedProductsModalProps {
    isOpen: boolean;
    onClose: () => void;
    relatedProducts?: RelatedProduct[];
}

export function RelatedProductsModal({ isOpen, onClose, relatedProducts = [] }: RelatedProductsModalProps) {
    if (!isOpen) return null;

    // Temporary mock data if none provided
    const displayProducts = relatedProducts.length > 0 ? relatedProducts : [
        { id: '1', name: 'Sản phẩm gợi ý A', price: '150.000đ', image: '/images/placeholder.jpg' },
        { id: '2', name: 'Sản phẩm gợi ý B', price: '220.000đ', image: '/images/placeholder.jpg' },
        { id: '3', name: 'Sản phẩm gợi ý C', price: '310.000đ', image: '/images/placeholder.jpg' },
        { id: '4', name: 'Sản phẩm gợi ý D', price: '185.000đ', image: '/images/placeholder.jpg' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            {/* Modal Container */}
            <div className="relative w-full max-w-[800px] bg-white dark:bg-slate-900 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                {/* Header Illustration & Success Message */}
                <div className="relative flex flex-col items-center text-center pt-6 md:pt-10 pb-4 md:pb-6 px-4 md:px-8 bg-slate-50 dark:bg-slate-900">
                    <button
                        onClick={onClose}
                        className="absolute top-2 right-2 md:top-4 md:right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-2"
                    >
                        <X className="w-5 h-5 md:w-6 md:h-6" />
                    </button>

                    {/* Success Illustration */}
                    <div className="w-20 h-20 md:w-32 md:h-32 mb-4 md:mb-6 bg-green-500/10 rounded-full flex items-center justify-center relative">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full scale-110 blur-sm"></div>
                        <CheckCircle className="text-green-500 w-10 h-10 md:w-16 md:h-16 relative z-10" />

                        {/* Fun decorative dots */}
                        <div className="absolute -top-1 -right-1 md:-top-2 md:-right-2 w-3 h-3 md:w-4 md:h-4 bg-green-500 rounded-full"></div>
                        <div className="absolute top-1/2 -left-4 md:-left-6 w-2 h-2 md:w-3 md:h-3 bg-green-500/40 rounded-full"></div>
                        <div className="absolute -bottom-1 left-2 md:-bottom-2 md:left-4 w-3 h-3 md:w-5 md:h-5 bg-green-500/60 rounded-full"></div>
                    </div>

                    <h2 className="text-xl md:text-3xl font-bold tracking-tight mb-2 text-slate-900 dark:text-white">Tuyệt vời! Lựa chọn rất chuẩn!</h2>
                    <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                        Sản phẩm đã được thêm vào giỏ hàng thành công. Bạn muốn tiếp tục khám phá hay thanh toán ngay?
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mt-6 md:mt-8 w-full">
                        <button
                            onClick={onClose}
                            className="w-full sm:w-auto px-6 py-2.5 md:px-8 md:py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                        >
                            <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
                            Tiếp tục xem đồ
                        </button>
                        <Link
                            href="/cart"
                            className="w-full sm:w-auto px-6 py-2.5 md:px-8 md:py-3 bg-green-500 text-white font-bold rounded-full shadow-lg shadow-green-500/20 hover:bg-green-600 transition-all flex items-center justify-center gap-2 text-sm md:text-base"
                            onClick={onClose}
                        >
                            Vào giỏ hàng
                            <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
                        </Link>
                    </div>
                </div>

                {/* Cross-sell Section */}
                <div className="bg-white dark:bg-slate-800/50 p-4 md:p-8 border-t border-slate-100 dark:border-slate-800 max-h-[40vh] md:max-h-none overflow-y-auto">
                    <div className="flex items-center justify-between mb-4 md:mb-6">
                        <h3 className="text-base md:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                            Có thể bạn cũng thích
                        </h3>
                        <div className="hidden md:flex gap-2">
                            <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
                        {displayProducts.map((product) => {
                            // Ensure price is safely formatted
                            const safePrice = String(product.price).replace(/\D/g, '');
                            const displayPrice = safePrice ? new Intl.NumberFormat('vi-VN').format(Number(safePrice)) + 'đ' : 'Liên hệ';

                            return (
                                <Link href={product.slug ? `/${product.slug}` : '#'} key={product.id} className="group cursor-pointer block" onClick={onClose}>
                                    <div className="relative aspect-square rounded-xl bg-slate-100 dark:bg-slate-700 mb-3 overflow-hidden">
                                        {/* Using a regular div for background image or next/image if preferred */}
                                        {product.image ? (
                                            <div
                                                className="w-full h-full bg-center bg-cover transition-transform duration-500 group-hover:scale-110"
                                                style={{ backgroundImage: `url(${product.image})` }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="w-8 h-8 bg-white/90 dark:bg-slate-900/90 rounded-full flex items-center justify-center shadow-md text-green-500 hover:text-green-600 hover:scale-110 transition-all">
                                                <CartPlus className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 mb-1">{product.name}</p>
                                    <p className="text-green-600 font-bold text-sm">{displayPrice}</p>
                                </Link>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
