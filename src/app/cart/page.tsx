"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { Button } from '@/components/ui/Button';
import { Trash2, ShoppingCart, ArrowRight, Minus, Plus, ShieldCheck, CreditCard, CheckCircle2, ChevronRight, PackageSearch } from 'lucide-react';

export default function CartPage() {
    const [mounted, setMounted] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState('');
    const [isApplying, setIsApplying] = useState(false);
    const [couponError, setCouponError] = useState('');
    
    const { items, removeItem, updateQuantity, getRawTotal, clearCart, coupon, applyCoupon, removeCoupon, getDiscountAmount } = useCartStore();

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="container mx-auto px-4 py-12 min-h-[50vh] flex items-center justify-center text-gray-400">Đang tải giỏ hàng...</div>;

    const rawTotal = getRawTotal();
    const discountAmount = getDiscountAmount();
    const finalTotal = Math.max(0, rawTotal - discountAmount);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
    };

    const handleApplyCoupon = async () => {
        if (!promoCodeInput.trim()) {
            setCouponError('Vui lòng nhập mã giảm giá');
            return;
        }

        setIsApplying(true);
        setCouponError('');

        try {
            const res = await fetch('/api/coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: promoCodeInput.trim() })
            });

            const data = await res.json();

            if (data.errors) {
                setCouponError(data.errors[0]?.message || 'Mã giảm giá không hợp lệ');
                return;
            }

            if (data.coupon) {
                applyCoupon(data.coupon);
                setPromoCodeInput(''); // Clear input after success
            }
        } catch (error) {
            setCouponError('Đã xảy ra lỗi, vui lòng thử lại');
        } finally {
            setIsApplying(false);
        }
    };

    return (
        <div>
            <main className="max-w-7xl mx-auto w-full px-3 sm:px-6 lg:px-8 py-4 lg:py-10 mb-[60px] lg:mb-0">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 mb-4 lg:mb-8 text-xs lg:text-sm text-gray-500 font-medium overflow-x-auto whitespace-nowrap no-scrollbar pb-1">
                    <Link href="/" className="hover:text-blue-600 transition-colors">Trang chủ</Link>
                    <ChevronRight className="w-4 h-4" />
                    <span className="text-gray-900">Giỏ hàng</span>
                </div>

                {items.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ShoppingCart className="w-12 h-12 text-blue-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng của bạn đang trống</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto leading-relaxed">Có vẻ như bạn chưa thêm sản phẩm nào vào giỏ hàng. Hãy khám phá hàng ngàn sản phẩm công nghệ tuyệt vời tại cửa hàng của chúng tôi!</p>
                        <Link href="/category/all">
                            <button className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-blue-500/30 hover:bg-blue-700 hover:shadow-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
                                Tiếp tục mua sắm
                            </button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Left Side: Product List */}
                        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
                            <div className="flex justify-between items-end mb-2">
                                <h1 className="text-2xl md:text-4xl font-black tracking-tight text-gray-900">
                                    Giỏ hàng <span className="text-blue-600 font-medium text-lg lg:text-xl ml-1 lg:ml-2 tracking-normal shrink-0">({items.length} sp)</span>
                                </h1>
                                <button
                                    onClick={clearCart}
                                    className="text-xs lg:text-sm text-red-500 font-bold hover:underline hover:text-red-700 transition-colors shrink-0 flex items-center gap-1 bg-red-50 px-2 py-1 lg:bg-transparent lg:px-0 lg:py-0 rounded-md"
                                >
                                    <Trash2 className="w-3.5 h-3.5 lg:w-4 lg:h-4" /> Xoá tất cả
                                </button>
                            </div>

                            <div className="space-y-3 lg:space-y-4">
                                {items.map((item) => (
                                    <div key={item.id} className="bg-white p-3 sm:p-6 rounded-xl lg:rounded-2xl border border-gray-100 flex flex-row gap-3 sm:gap-6 shadow-sm hover:shadow-md hover:border-blue-100 transition-all duration-300 group">
                                        {/* Product Image */}
                                        <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-50 rounded-lg lg:rounded-xl overflow-hidden flex-shrink-0 relative group-hover:shadow-inner transition-shadow border border-gray-100/50">
                                            {item.imageUrl ? (
                                                <Image src={item.imageUrl} alt={item.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="flex w-full h-full items-center justify-center text-gray-300 bg-gray-100/50">
                                                    <PackageSearch className="w-6 h-6 sm:w-8 sm:h-8" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Details */}
                                        <div className="flex-grow flex flex-col justify-between min-w-0">
                                            <div>
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 lg:gap-2 mb-1">
                                                    <Link href={`/product/${item.slug}`} className="text-[13px] sm:text-lg font-bold text-gray-900 hover:text-blue-600 line-clamp-2 leading-tight sm:leading-snug pr-2 sm:pr-4">
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-sm sm:text-xl font-black text-rose-600 shrink-0">{formatPrice(item.price)}</p>
                                                </div>
                                                {/* Placeholder for sub-details or SKU if needed in future */}
                                                <p className="text-gray-500 text-[11px] sm:text-sm flex items-center gap-1 sm:gap-1.5 mt-1 sm:mt-2">
                                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" /> Còn hàng
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between gap-3 sm:gap-6 mt-3 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-100/50 sm:border-gray-50 sm:sm:border-t-0">
                                                {/* Quantity Control */}
                                                <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50/50 shadow-sm h-8 sm:h-10">
                                                    <button
                                                        className="p-1 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-l-lg transition-colors group/btn disabled:opacity-50 h-full flex items-center"
                                                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                                                        disabled={item.quantity <= 1}
                                                    >
                                                        <Minus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <span className="w-8 sm:w-12 text-center text-xs sm:text-sm font-bold text-gray-900 bg-white border-x border-gray-200 flex items-center justify-center h-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">{item.quantity}</span>
                                                    <button
                                                        className="p-1 sm:p-2 text-gray-500 hover:text-blue-600 hover:bg-white rounded-r-lg transition-colors group/btn h-full flex items-center"
                                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    >
                                                        <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2 text-xs sm:text-sm shrink-0">
                                                    <button
                                                        onClick={() => removeItem(item.id)}
                                                        className="flex items-center gap-1 sm:gap-1.5 font-bold text-gray-400 hover:text-rose-500 hover:bg-rose-50 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg transition-all"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Xoá</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right Side: Order Summary Panel */}
                        <div className="space-y-4 lg:space-y-6">
                            <div className="bg-white/95 lg:bg-white/80 backdrop-blur-xl p-4 sm:p-8 rounded-xl lg:rounded-2xl border border-blue-50 shadow-xl shadow-blue-900/5 space-y-4 lg:space-y-6 sticky top-20 lg:top-28">
                                <h2 className="text-lg lg:text-xl font-black text-gray-900 border-b border-gray-100 pb-3 lg:pb-4 flex items-center gap-2">
                                    <ShoppingCart className="w-4 h-4 lg:w-5 lg:h-5 text-blue-600" /> Tóm tắt đơn hàng
                                </h2>

                                {/* Shipping Progress Placeholder (from Stitch design intent) */}
                                <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 hidden">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium text-gray-700">Tiến độ Free Ship</span>
                                        <span className="text-blue-600 font-bold">100%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 rounded-full" style={{ width: '100%' }}></div>
                                    </div>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mt-1">Đơn hàng của bạn được Freeship</p>
                                </div>

                                {/* Calculations */}
                                <div className="space-y-4 py-2 border-y border-gray-100">
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Tạm tính ({items.length} sản phẩm)</span>
                                        <span className="font-bold text-gray-900">{formatPrice(rawTotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Phí vận chuyển</span>
                                        <span className="font-bold text-emerald-600">Miễn phí</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 text-sm">
                                        <span>Thuế VAT</span>
                                        <span className="font-bold text-gray-900">Đã bao gồm</span>
                                    </div>
                                    
                                    {coupon && (
                                        <div className="flex justify-between text-green-600 text-sm">
                                            <span className="flex items-center gap-1">
                                                Mã giảm giá <strong>{coupon.code}</strong>
                                                <button onClick={removeCoupon} className="text-red-500 hover:text-red-700 ml-1 text-xs" title="Xóa mã giảm giá">[Xóa]</button>
                                            </span>
                                            <span className="font-bold">- {formatPrice(discountAmount)}</span>
                                        </div>
                                    )}

                                    <div className="pt-4 flex justify-between items-end">
                                        <span className="text-sm font-bold text-gray-900">Tổng cộng</span>
                                        <span className="text-2xl font-black text-rose-600 leading-none">{formatPrice(finalTotal)}</span>
                                    </div>
                                    <p className="text-right text-[11px] text-gray-400 italic mb-2">(Đã bao gồm VAT nếu có)</p>
                                </div>

                                {/* Promo Code */}
                                {!coupon && (
                                    <div className="space-y-2 lg:space-y-3 pt-2">
                                        <label className="text-[10px] lg:text-xs font-bold uppercase tracking-wider text-gray-500 block">Mã giảm giá</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={promoCodeInput}
                                                onChange={(e) => setPromoCodeInput(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCoupon()}
                                                className="flex-grow bg-gray-50 border border-gray-200 rounded-lg lg:rounded-xl px-3 lg:px-4 py-2 lg:py-2.5 text-xs lg:text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-gray-400"
                                                placeholder="Nhập mã KM"
                                            />
                                            <button 
                                                onClick={handleApplyCoupon}
                                                disabled={isApplying}
                                                className="bg-blue-50 text-blue-700 font-bold px-3 lg:px-5 rounded-lg lg:rounded-xl text-xs lg:text-sm hover:bg-blue-100 transition-colors border border-blue-100 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isApplying ? 'Đang áp dụng...' : 'Áp dụng'}
                                            </button>
                                        </div>
                                        {couponError && <p className="text-xs text-red-500 mt-1">{couponError}</p>}
                                    </div>
                                )}

                                {/* Checkout Button */}
                                <Link href="/checkout" className="block w-full pt-2 lg:pt-4">
                                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3 lg:py-4 rounded-xl shadow-[0_8px_30px_rgb(37,175,244,0.3)] hover:shadow-[0_8px_30px_rgb(37,175,244,0.5)] flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0 text-base lg:text-lg">
                                        Tiến hành đặt
                                        <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5 -mt-0.5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>

                                {/* Safe Checkout */}
                                <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-100">
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400" title="Thanh toán an toàn">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" /> Bảo mật
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400" title="Chấp nhận thẻ">
                                        <CreditCard className="w-4 h-4 text-blue-400" /> Thẻ tín dụng
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
