"use client";

import React, { forwardRef } from 'react';
import { ComponentCategory } from '@/store/usePcBuilderStore';

interface PcBuilderPrintTemplateProps {
    components: ComponentCategory[];
    totalPrice: number;
    companyInfo?: {
        logo?: string;
        name?: string;
        contact?: string;
        contacts?: { icon: string; text: string }[];
        description?: string;
    };
}

export const PcBuilderPrintTemplate = forwardRef<HTMLDivElement, PcBuilderPrintTemplateProps>(
    ({ components, totalPrice, companyInfo }, ref) => {
        const formatCurrency = (amount: number) => {
            return new Intl.NumberFormat('vi-VN').format(amount);
        };

        const formatNumber = (amount: number) => {
            return new Intl.NumberFormat('vi-VN').format(amount);
        };

        const selectedComponents = components.filter(c => c.product);

        const now = new Date();
        const dateString = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

        return (
            <div ref={ref} className="bg-white text-black text-[13px] font-sans w-full max-w-[1000px] mx-auto hidden print:block" style={{ fontFamily: 'Arial, Helvetica, sans-serif' }}>
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        @page { size: A4 portrait; margin: 15mm; }
                        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                        .print-hide { display: none !important; }
                    }
                `}} />

                {/* Header: Logo and Company Info */}
                <div className="flex justify-between items-start mb-6 border-b-2 border-red-600 pb-4">
                    <div className="w-[30%]">
                        {companyInfo?.logo ? (
                            <img src={companyInfo.logo} alt="Logo" className="max-h-16 object-contain" />
                        ) : (
                            <div className="text-3xl font-black text-blue-800">
                                {companyInfo?.name?.substring(0, 3) || "LMC"}
                            </div>
                        )}
                    </div>
                    <div className="w-[70%] text-right text-[12px] space-y-1">
                        <div className="text-[16px] font-bold text-red-600 uppercase mb-2">
                            {companyInfo?.name || "CÔNG TY CỔ PHẦN THIẾT BỊ CÔNG NGHỆ LMC"}
                        </div>
                        {companyInfo?.description && (
                            <div><strong className="text-red-600">Trụ sở:</strong> {companyInfo.description}</div>
                        )}
                        <div className="flex justify-end gap-4">
                            {companyInfo?.contact && (
                                <div><strong className="text-red-600">Tel:</strong> {companyInfo.contact}</div>
                            )}
                            <div><strong className="text-red-600">Website:</strong> maytinhlmc.vn</div>
                        </div>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-6 mt-4">
                    <h1 className="text-2xl font-bold text-red-600 uppercase">BẢNG BÁO GIÁ VẬT TƯ, THIẾT BỊ</h1>
                </div>

                {/* Date and Currency */}
                <div className="flex justify-between text-[12px] font-bold mb-2">
                    <div>Ngày báo giá: {dateString}</div>
                    <div>Đơn vị tính: <span className="text-red-600">VNĐ</span></div>
                </div>

                {/* Table */}
                <table className="w-full border-collapse border border-gray-300 text-[12px] mb-4">
                    <thead>
                        <tr className="bg-[#cc0000] text-white">
                            <th className="border border-gray-300 p-2 text-center w-10">STT</th>
                            <th className="border border-gray-300 p-2 text-center w-24">Mã SP</th>
                            <th className="border border-gray-300 p-2 text-center w-24">Hình ảnh</th>
                            <th className="border border-gray-300 p-2 text-center">Tên sản phẩm</th>
                            <th className="border border-gray-300 p-2 text-center w-20">Bảo hành</th>
                            <th className="border border-gray-300 p-2 text-center w-16">Số lượng</th>
                            <th className="border border-gray-300 p-2 text-center w-32">Đơn giá</th>
                            <th className="border border-gray-300 p-2 text-center w-32">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {selectedComponents.map((comp, index) => {
                            const priceStr = (comp.product?.price || comp.product?.regularPrice || '0').replace(/&nbsp;/g, "").replace(/\D/g, '');
                            const numPrice = parseInt(priceStr) || 0;
                            const warranty = comp.product?.metaData?.find((m: any) => m.key === 'bao_hanh')?.value || '36 Tháng';

                            return (
                                <tr key={comp.id} className="border-b border-gray-300">
                                    <td className="border border-gray-300 p-2 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 p-2 text-center">{comp.product?.sku || comp.product?.databaseId}</td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        {comp.product?.image?.sourceUrl ? (
                                            <img src={comp.product.image.sourceUrl} alt="Product" className="w-16 h-16 object-contain mx-auto" />
                                        ) : null}
                                    </td>
                                    <td className="border border-gray-300 p-2">
                                        <strong>{comp.name} {comp.product?.name?.replace(comp.name, '').trim() || comp.product?.name}</strong>
                                    </td>
                                    <td className="border border-gray-300 p-2 text-center">{warranty}</td>
                                    <td className="border border-gray-300 p-2 text-center">1</td>
                                    <td className="border border-gray-300 p-2 text-right">{formatNumber(numPrice)}</td>
                                    <td className="border border-gray-300 p-2 text-right font-bold">{formatNumber(numPrice)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Summary Table */}
                <div className="flex justify-end">
                    <table className="w-[300px] border-collapse border border-gray-300 text-[12px] font-bold">
                        <tbody>
                            <tr>
                                <td className="border border-gray-300 p-2">Phí vận chuyển</td>
                                <td className="border border-gray-300 p-2 text-right text-red-600">0 VNĐ</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2">Chi phí khác</td>
                                <td className="border border-gray-300 p-2 text-right text-red-600">0 VNĐ</td>
                            </tr>
                            <tr>
                                <td className="border border-gray-300 p-2 text-[14px]">Tổng tiền thanh toán</td>
                                <td className="border border-gray-300 p-2 text-right text-red-600 text-[14px]">{formatCurrency(totalPrice)} VNĐ</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 mb-10 text-[11px] italic text-red-600 border-b border-gray-300 pb-2">
                    <strong>Quý khách lưu ý:</strong> Bảng giá có giá trị tại thời điểm in, giá có thể thay đổi tùy theo chương trình khuyến mãi thực tế.
                </div>

                <div className="flex justify-between items-end text-[12px]">
                    <div>
                        <p>Để biết thêm chi tiết, vui lòng liên hệ</p>
                        <p>Hotline: {companyInfo?.contact || '1900 1903'} (8h00-21h30 hàng ngày)</p>
                    </div>
                    <div className="text-red-600 font-bold uppercase">
                        {companyInfo?.name?.split(' ')[0] || 'LMC'} CHÂN THÀNH CẢM ƠN QUÝ KHÁCH
                    </div>
                </div>
            </div>
        );
    }
);

PcBuilderPrintTemplate.displayName = 'PcBuilderPrintTemplate';
