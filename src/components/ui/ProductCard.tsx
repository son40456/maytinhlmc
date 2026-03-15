"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/useCartStore';
import { useRelatedProductsModalStore } from '@/store/useRelatedProductsModalStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useToastStore } from '@/store/useToastStore';
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
    stockStatus?: string;
    category?: string;
    priority?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({ id, databaseId, name, price, imageUrl, slug, sku, regularPrice, salePrice, stockStatus = 'IN_STOCK', category, priority = false }) => {
    const [isPending, startTransition] = React.useTransition();
    const addItem = useCartStore(state => state.addItem);
    const addCompare = useCompareStore(state => state.addItem);
    const removeCompare = useCompareStore(state => state.removeItem);
    const isInCompare = useCompareStore(state => state.hasItem(id));
    const addToast = useToastStore(state => state.addToast);
    const [compareAnim, setCompareAnim] = React.useState(false);

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
        <div className="product-card group bg-white dark:bg-slate-800 rounded-xl p-4 shadow-sm hover:shadow-xl transition-all border border-slate-100 dark:border-slate-700 flex flex-col h-full relative">
            <Link href={`/${slug}`} className="relative mb-4 block aspect-square w-full">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={name}
                        fill
                        className="object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
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

            <Link href={`/${slug}`} className="mb-2 block">
                <div className="flex items-center justify-between mb-1 min-h-[15px]">
                    <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate pr-2">
                        {sku ? `Mã: ${sku}` : ''}
                    </div>
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
                <div className="text-blue-600 font-extrabold text-xl mb-1">{price.replace(/&nbsp;/g, ' ')}</div>
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
                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                    ) : (
                        <svg className="w-[14px] h-[14px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    {stockStatus === 'IN_STOCK' ? 'Còn hàng' : 'Hết hàng'}
                </div>

                <div className="flex items-center justify-between">
                    <button
                        onClick={() => {
                            setCompareAnim(true);
                            setTimeout(() => setCompareAnim(false), 400);

                            if (isInCompare) {
                                removeCompare(id);
                            } else {
                                const result = addCompare({ id, databaseId, name, price, imageUrl, slug, sku, category });
                                if (result === 'full') {
                                    addToast('Chỉ được chọn tối đa 4 sản phẩm để so sánh!', 'warning');
                                } else if (result === 'wrong_category') {
                                    addToast('Chỉ so sánh được các sản phẩm cùng danh mục!', 'warning');
                                }
                            }
                        }}
                        className={`flex items-center gap-1 text-[11px] transition-all duration-200 ${compareAnim ? 'scale-125' : 'scale-100'} ${isInCompare
                            ? 'text-blue-600 font-bold'
                            : 'text-slate-500 dark:text-slate-400 hover:text-blue-600'
                            }`}
                    >
                        {isInCompare ? (
                            <svg className="w-[16px] h-[16px] text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        ) : (
                            <svg className={`w-[16px] h-[16px] transition-transform ${compareAnim ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
                        )}
                        {isInCompare ? '✓ Đã chọn' : 'So sánh'}
                    </button>
                    <button
                        onClick={handleAddToCart}
                        disabled={isPending}
                        className="group-hover:bg-blue-600 group-hover:text-white text-slate-500 dark:text-slate-400 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-wait"
                        title="Thêm vào giỏ"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
