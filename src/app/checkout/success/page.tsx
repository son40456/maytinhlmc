"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, Info, Package, ShoppingBag, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function SuccessContent() {
    const searchParams = useSearchParams();
    const orderKey = searchParams.get('orderKey') || 'LMC-' + Math.floor(Math.random() * 1000000);

    return (
        <div className="bg-gray-50/50 min-h-screen">
            <main className="max-w-4xl mx-auto px-4 py-12 md:py-20">
                {/* Success Card */}
                <div className="bg-white rounded-2xl shadow-xl shadow-emerald-900/5 border border-emerald-100 overflow-hidden">

                    {/* Hero Header */}
                    <div className="pt-12 pb-8 px-6 text-center border-b border-gray-100 bg-gradient-to-b from-emerald-50/50 to-white">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 mb-6 relative">
                            <div className="absolute inset-0 rounded-full bg-emerald-100 animate-ping opacity-50"></div>
                            <CheckCircle2 className="w-10 h-10 text-emerald-600" strokeWidth={2.5} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-3 tracking-tight">Đặt hàng thành công!</h2>
                        <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                            Cảm ơn bạn đã tin tưởng <span className="text-blue-600 font-bold">maytinhlmc.vn</span>. Đơn hàng <span className="font-mono font-bold text-gray-900 px-1.5 py-0.5 bg-gray-100 rounded">#{orderKey}</span> của bạn đang được xử lý.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
                        {/* Order Information */}
                        <div className="p-8">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                                <Info className="w-5 h-5 text-emerald-600" />
                                Thông tin đơn hàng
                            </h3>
                            <div className="space-y-5">
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Ngày đặt hàng</span>
                                    <span className="font-bold text-sm text-gray-900">{new Date().toLocaleDateString('vi-VN')}</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Phương thức thanh toán</span>
                                    <span className="font-bold text-sm text-gray-900 cursor-help" title="Thanh toán khi nhận hàng">COD</span>
                                </div>
                                <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">Dự kiến giao hàng</span>
                                    <span className="font-bold text-sm text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">2 - 3 ngày tới</span>
                                </div>
                            </div>
                        </div>

                        {/* Next Steps / Info */}
                        <div className="p-8 bg-gray-50/50">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900">
                                <Package className="w-5 h-5 text-blue-600" />
                                Theo dõi đơn hàng
                            </h3>
                            <div className="space-y-4">
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Chúng tôi đã gửi email xác nhận đặt hàng kèm theo chi tiết hóa đơn đến địa chỉ email bạn đã cung cấp.
                                </p>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Nhân viên CSKH sẽ sớm liên hệ với bạn qua số điện thoại để chốt lại thời gian giao hàng cụ thể.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="p-8 bg-white flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/category/all" className="w-full sm:w-auto">
                            <Button size="lg" className="w-full h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 px-8">
                                <ShoppingBag className="w-5 h-5" />
                                Tiếp tục mua sắm
                            </Button>
                        </Link>

                        {/* We don't have an order tracking page yet, linking home or placeholder */}
                        <Link href="/" className="w-full sm:w-auto">
                            <Button size="lg" variant="outline" className="w-full h-14 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors flex items-center justify-center gap-2 px-8">
                                <Eye className="w-5 h-5 text-gray-400" />
                                Về trang chủ
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Footer Help */}
                <div className="mt-12 text-center">
                    <p className="text-gray-500 text-sm flex items-center justify-center gap-1.5 flex-wrap">
                        Bạn cần hỗ trợ? Liên hệ hotline <span className="text-blue-600 font-bold whitespace-nowrap">0912.345.678</span> hoặc qua
                        <Link href="#" className="flex items-center gap-1 text-blue-600 font-medium hover:underline underline-offset-4 decoration-blue-600/30">
                            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md text-xs font-bold border border-blue-100">Zalo</span> hỗ trợ kỹ thuật
                        </Link>
                    </p>
                </div>
            </main>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-500">Đang tải...</div>}>
            <SuccessContent />
        </Suspense>
    );
}
