"use client";

/**
 * ProductCardActions — Client Component
 *
 * H6 Fix: Tách phần interactive (Add to Cart, Compare button) thành Client Component riêng.
 * ProductCardServer render toàn bộ HTML trên server → LCP nhanh hơn.
 * Chỉ phần này mới cần JS hydration.
 */

import React from 'react';
import { useCartStore } from '@/store/useCartStore';
import { useRelatedProductsModalStore } from '@/store/useRelatedProductsModalStore';
import { useCompareStore } from '@/store/useCompareStore';
import { useToastStore } from '@/store/useToastStore';
import { fetchRelatedProducts } from '@/app/actions/productActions';
import { Loader2 } from 'lucide-react';

interface ProductCardActionsProps {
    id: string;
    databaseId: number;
    name: string;
    price: string;
    imageUrl: string;
    slug: string;
    sku?: string;
    category?: string;
}

export const ProductCardActions: React.FC<ProductCardActionsProps> = ({
    id, databaseId, name, price, imageUrl, slug, sku, category
}) => {
    const [isPending, startTransition] = React.useTransition();
    const addItem = useCartStore(state => state.addItem);
    const addCompare = useCompareStore(state => state.addItem);
    const removeCompare = useCompareStore(state => state.removeItem);
    const isInCompare = useCompareStore(state => state.hasItem(id));
    const addToast = useToastStore(state => state.addToast);
    const [compareAnim, setCompareAnim] = React.useState(false);

    const handleAddToCart = () => {
        const numericPrice = parseInt(price.replace(/\D/g, '')) || 0;
        addItem({ id, productId: databaseId.toString(), databaseId, name, price: numericPrice, quantity: 1, imageUrl, slug });
        startTransition(async () => {
            const related = await fetchRelatedProducts(slug);
            useRelatedProductsModalStore.getState().openModal(related);
        });
    };

    return (
        <div className="flex items-center justify-between mt-auto pt-2">
            {/* So sánh */}
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
                    <svg className="w-[16px] h-[16px] text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                ) : (
                    <svg className={`w-[16px] h-[16px] transition-transform ${compareAnim ? 'rotate-12' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                )}
                {isInCompare ? '✓ Đã chọn' : 'So sánh'}
            </button>

            {/* Add to cart */}
            <button
                onClick={handleAddToCart}
                disabled={isPending}
                className="group-hover:bg-blue-600 group-hover:text-white text-slate-500 dark:text-slate-400 w-8 h-8 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md transition-colors disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-wait"
                title="Thêm vào giỏ"
            >
                {isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                )}
            </button>
        </div>
    );
};
