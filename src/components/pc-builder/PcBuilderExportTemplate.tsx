"use client";

import React, { forwardRef } from 'react';
import Image from 'next/image';
import { ComponentCategory } from '@/store/usePcBuilderStore';

interface PcBuilderExportTemplateProps {
    components: ComponentCategory[];
    totalPrice: number;
}

export const PcBuilderExportTemplate = forwardRef<HTMLDivElement, PcBuilderExportTemplateProps>(
    ({ components, totalPrice }, ref) => {
        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
        };

        const formatNumber = (amount: number) => {
            return new Intl.NumberFormat('vi-VN').format(amount);
        };

        const selectedComponents = components.filter(c => c.product);

        return (
            <div className="fixed" style={{ top: '-10000px', left: '-10000px', width: '900px', zIndex: -1000 }}>
                <div ref={ref} className="bg-[#f8f9fa] w-[900px] text-gray-900 font-sans mx-auto p-0">
                    {/* Header Section */}
                    <div className="flex flex-col items-center justify-center pt-10 pb-6 bg-[#f0f2f5]">
                        {/* Fake LMC Logo similar to original design */}
                        <div className="bg-[#1e5eb5] text-white flex items-center justify-center font-black text-5xl tracking-tighter px-6 py-2 pb-3 mb-6">
                            LMC
                        </div>
                        <h1 className="text-3xl font-black text-gray-800 uppercase tracking-widest">
                            Xây Dựng Cấu Hình
                        </h1>
                    </div>

                    {/* Component List */}
                    <div className="bg-white px-10 py-4">
                        <div className="divide-y divide-gray-100">
                            {selectedComponents.map((comp, idx) => {
                                const priceStr = (comp.product?.price || comp.product?.regularPrice || '0').replace(/&nbsp;/g, "").replace(/\D/g, '');
                                const numPrice = parseInt(priceStr) || 0;

                                return (
                                    <div key={comp.id} className="flex items-center gap-6 py-6 border-b border-gray-100 last:border-0">
                                        <div className="w-24 h-24 rounded-lg bg-white p-1 flex-shrink-0 relative border border-gray-100 flex items-center justify-center">
                                            {comp.product?.image?.sourceUrl ? (
                                                <img
                                                    src={comp.product.image.sourceUrl}
                                                    alt={comp.product.name}
                                                    className="object-contain w-full h-full"
                                                    crossOrigin="anonymous"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-50 flex items-center justify-center text-xs text-center text-gray-400">No Image</div>
                                            )}
                                        </div>
                                        <div className="flex-1 flex flex-col justify-center">
                                            <h3 className="text-[17px] font-bold text-gray-800 leading-tight mb-1">
                                                {comp.name} {comp.product?.name?.replace(comp.name, '').trim() || comp.product?.name}
                                            </h3>
                                            <p className="text-[14px] text-gray-600 font-medium">
                                                Mã sản phẩm: {comp.product?.sku || comp.product?.databaseId}
                                            </p>
                                            <p className="text-[14px] font-bold text-gray-800">
                                                {formatNumber(numPrice)} x 1
                                            </p>
                                        </div>
                                        <div className="flex-shrink-0 w-[180px] text-right">
                                            <span className="text-[20px] font-black text-[#e53935]">
                                                = {formatCurrency(numPrice)}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Total Section */}
                    <div className="bg-white px-10 py-6 border-t border-gray-200 text-center">
                        <h2 className="text-[22px] font-bold text-[#e53935]">
                            Thành tiền: {formatCurrency(totalPrice)}
                        </h2>
                    </div>

                    {/* Thank You Section */}
                    <div className="bg-white px-10 py-4 text-center">
                        <h2 className="text-[24px] font-black text-gray-800 uppercase tracking-widest mb-1">Chân thành cảm ơn</h2>
                        <p className="text-[15px] text-gray-600">Mọi chi tiết xin vui lòng liên hệ</p>
                    </div>

                    {/* Footer Address Info */}
                    <div className="bg-[#f8f9fa] border-t border-gray-200 mt-6 pt-8 pb-6 px-10 grid grid-cols-2 gap-8 text-[13px] text-gray-700 leading-relaxed">
                        {/* Trụ sở chính */}
                        <div className="border border-gray-200 bg-white p-5 rounded-md shadow-sm">
                            <h3 className="text-blue-600 font-bold mb-3 flex items-center gap-2 uppercase text-[14px]">
                                <span className="bg-blue-100 p-1.5 rounded-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg></span>
                                Trụ Sở Chính
                            </h3>
                            <div className="space-y-2">
                                <p className="flex items-start gap-2"><strong className="text-green-600">🏢</strong> <span className="font-bold">CÔNG TY CỔ PHẦN THIẾT BỊ CÔNG NGHỆ LMC</span></p>
                                <p className="flex items-start gap-2"><strong className="text-red-500">📍</strong> Số 472 Đại Lộ Lê Thanh Nghị, P. Lê Thanh Nghị, TP. Hải Dương</p>
                                <p className="flex items-start gap-2"><strong className="text-blue-500">✉️</strong> Email: maytinhlmc@gmail.com</p>
                                <p className="flex items-start gap-2"><strong className="text-green-500">📞</strong> Hotline: 0220.660.6666 | 0907.655.777</p>
                            </div>
                        </div>

                        {/* Chi nhánh liên kết */}
                        <div className="border border-gray-200 bg-white p-5 rounded-md shadow-sm">
                            <h3 className="text-blue-600 font-bold mb-3 flex items-center gap-2 uppercase text-[14px]">
                                <span className="bg-blue-100 p-1.5 rounded-sm"><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z" /></svg></span>
                                Chi Nhánh Liên Kết
                            </h3>
                            <div className="space-y-2">
                                <p className="flex items-start gap-2"><strong className="text-green-600">🏢</strong> <span className="font-bold">CÔNG TY CỔ PHẦN THIẾT BỊ MÁY TÍNH VDC</span></p>
                                <p className="flex items-start gap-2"><strong className="text-red-500">📍</strong> SN 333 đường Hùng Vương, Phường Vĩnh Yên, Tỉnh Phú Thọ</p>
                                <p className="flex items-start gap-2"><strong className="text-blue-500">✉️</strong> Email: maytinhvdc@gmail.com</p>
                                <p className="flex items-start gap-2"><strong className="text-green-500">📞</strong> SĐT: 0799.08.6666 - 0828.06.3333</p>
                            </div>
                        </div>
                    </div>

                    {/* iOS Note */}
                    <div className="bg-white py-4 text-center border-t border-gray-100">
                        <p className="text-[13px] text-[#e53935] font-medium">
                            Nếu bạn sử dụng trình duyệt Chrome trên hệ điều hành iOS, vui lòng bấm giữ vào hình, sau đó chọn &quot;Lưu ảnh&quot; vào máy
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);

PcBuilderExportTemplate.displayName = 'PcBuilderExportTemplate';
