/**
 * ProductCardServer — Server Component
 *
 * H6 Fix: Render toàn bộ HTML sản phẩm trên server.
 * - Không import Zustand/hooks → không gây BAILOUT_TO_CLIENT_SIDE_RENDERING
 * - Google crawl được nội dung đầy đủ ngay lập tức → LCP nhanh hơn
 * - ProductCardActions là Client Component nhỏ được nhúng vào, chỉ hydrate phần interactive
 *
 * Dùng component này cho: Homepage sections, trang danh mục SSR-first content
 */

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ProductCardActions } from './ProductCardActions';

interface ProductCardServerProps {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
    sku?: string;
    regularPrice?: string;
    salePrice?: string;
    stockStatus?: string;
    category?: string;
    priority?: boolean;
}

export function ProductCardServer({
    id, databaseId, name, price, imageUrl, slug, sku,
    regularPrice, salePrice, stockStatus = 'IN_STOCK', category, priority = false
}: ProductCardServerProps) {
    const numericRegular = regularPrice ? parseInt(regularPrice.replace(/\D/g, '')) : 0;
    const numericSale = salePrice ? parseInt(salePrice.replace(/\D/g, '')) : 0;
    const discountPercent = (numericRegular && numericSale && numericRegular > numericSale)
        ? Math.round(((numericRegular - numericSale) / numericRegular) * 100)
        : 0;
    const cleanPrice = price.replace(/&nbsp;/g, ' ');

    return (
        <div className="product-card group bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col h-full relative overflow-hidden">
            {/* Image + Discount Badge — fully SSR, no JS needed */}
            <Link
                href={`/${slug}`}
                className="relative mb-4 block aspect-square w-full overflow-hidden after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:-translate-x-[150%] group-hover:after:translate-x-[150%] after:transition-transform after:duration-1000 after:ease-in-out after:z-20"
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, (max-width: 1280px) 25vw, 17vw"
                        priority={priority}
                        fetchPriority={priority ? "high" : "auto"}
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-400">
                        No Image
                    </div>
                )}

                {discountPercent > 0 && numericRegular > 0 && numericSale > 0 && (
                    <div className="absolute top-0 left-0 z-10 pointer-events-none flex">
                        <span className="bg-blue-600 text-white text-[9px] font-medium px-1.5 py-1 rounded-l-sm shadow-sm border-r border-blue-500 flex items-center">TIẾT KIỆM</span>
                        <span className="bg-blue-600 text-white text-[10px] font-medium px-1.5 py-1 rounded-r-sm shadow-sm flex items-center">
                            {new Intl.NumberFormat('vi-VN').format(numericRegular - numericSale)} ₫
                        </span>
                    </div>
                )}
            </Link>

            {/* Product Info — SSR */}
            <div className="px-3 pb-3 flex flex-col flex-1">
                <Link href={`/${slug}`} className="mb-2 block">
                    <div className="flex items-center justify-between mb-1 min-h-[15px]">
                        <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate pr-2">
                            {sku ? `Mã: ${sku}` : ''}
                        </div>
                        {/* Static star display — actual ratings loaded lazily */}
                        <div className="flex items-center gap-[1px] shrink-0">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <svg key={star} className="w-2.5 h-2.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                            ))}
                        </div>
                    </div>
                    <h3 className="text-sm font-semibold uppercase leading-snug line-clamp-2 min-h-[40px] text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                        {name}
                    </h3>
                </Link>

                <div className="mt-auto">
                    <div className="text-blue-600 font-extrabold text-xl mb-1">{cleanPrice}</div>
                    <div className="flex items-center gap-2 mb-2 min-h-[16px]">
                        {discountPercent > 0 && regularPrice ? (
                            <>
                                <span className="text-slate-400 line-through text-xs">{regularPrice.replace(/&nbsp;/g, ' ')}</span>
                                <span className="text-blue-600 text-xs font-bold">-{discountPercent}%</span>
                            </>
                        ) : null}
                    </div>

                    <div className={`flex items-center gap-1 text-[11px] mb-3 font-medium ${stockStatus === 'IN_STOCK' ? 'text-green-600' : 'text-red-500'}`}>
                        {stockStatus === 'IN_STOCK' ? (
                            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        ) : (
                            <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        )}
                        {stockStatus === 'IN_STOCK' ? 'Còn hàng' : 'Hết hàng'}
                    </div>

                    {/* Client Component chỉ cho phần interactive — nhỏ gọn, không gây bailout */}
                    <ProductCardActions
                        id={id}
                        databaseId={databaseId}
                        name={name}
                        price={cleanPrice}
                        imageUrl={imageUrl}
                        slug={slug}
                        sku={sku}
                        category={category}
                    />
                </div>
            </div>
        </div>
    );
}
