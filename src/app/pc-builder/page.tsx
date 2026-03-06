"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { usePcBuilderStore } from "@/store/usePcBuilderStore";
import { ProductSelectModal } from "@/components/pc-builder/ProductSelectModal";
import { PcBuilderExportTemplate } from "@/components/pc-builder/PcBuilderExportTemplate";
import { useCartStore } from "@/store/useCartStore";
import { getAutoFilterForCategory } from "@/lib/pc-builder/compatibilityEngine";
import { FileSpreadsheet, DownloadCloud, Share2, Printer, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getPcBuilderConfig } from '@/app/actions/configActions';

export default function BuildPcPage() {
    const { components, totalPrice, removeProduct, clearAll, initComponents, compatibilityHints } = usePcBuilderStore();
    const addItem = useCartStore(state => state.addItem);

    const [modalOpen, setModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<{ id: string; name: string; slug: string } | null>(null);
    const [companyInfo, setCompanyInfo] = useState<{ logo?: string, name?: string, contact?: string, contacts?: { icon: string, text: string }[], description?: string }>({});

    const activeCategoryRef = useRef<{ id: string; name: string; slug: string } | null>(null);

    const summaryRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Fetch dynamic configuration from Redis/File
        getPcBuilderConfig().then((config: any) => {
            if (config) {
                if (Array.isArray(config)) {
                    initComponents(config);
                } else if (config.components) {
                    initComponents(config.components);
                    if (config.companyInfo) setCompanyInfo(config.companyInfo);
                }
            }
        });
    }, [initComponents]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getSelectedComponentsList = () => {
        return components.filter(c => c.product).map(comp => ({
            category: comp.name,
            name: comp.product?.name || '',
            price: comp.product?.price || comp.product?.regularPrice || '0',
            id: comp.product?.databaseId || '',
        }));
    };

    const handleExportExcel = async () => {
        const list = getSelectedComponentsList();
        if (list.length === 0) {
            alert('Chưa có linh kiện nào để xuất!');
            return;
        }

        try {
            // 1. Tải file mẫu
            const response = await fetch('/templates/buildpc.xlsx');
            const arrayBuffer = await response.arrayBuffer();

            // 2. Load workbook
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.load(arrayBuffer);
            const worksheet = workbook.getWorksheet(1);
            if (!worksheet) return;

            // Optional: Inject Company Info into Excel template
            // Assuming A1/B1/A2 areas are safe for header info based on typical templates
            if (companyInfo.name) worksheet.getCell('B2').value = companyInfo.name;
            if (companyInfo.contacts && companyInfo.contacts.length > 0) {
                worksheet.getCell('B3').value = companyInfo.contacts.map(c => `${c.icon} ${c.text}`).join(' | ');
            } else if (companyInfo.contact) {
                worksheet.getCell('B3').value = companyInfo.contact;
            }

            // 3. Cập nhật ngày tháng (Dòng 8, Cột G)
            const now = new Date();
            const dateStr = `Đã tạo: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            worksheet.getCell('G8').value = dateStr;

            // 4. Điền dữ liệu linh kiện bắt đầu từ dòng 10
            let currentRow = 10;
            list.forEach((item, index) => {
                const row = worksheet.getRow(currentRow);
                row.getCell(2).value = index + 1; // STT
                row.getCell(3).value = item.id;    // Mã SP
                row.getCell(4).value = item.name;  // Tên SP (Cột D)
                row.getCell(6).value = "";         // Bảo hành (Để trống nếu chưa có data)
                row.getCell(7).value = 1;          // Số lượng

                // Clean price string for Excel (bỏ đ, VNĐ, dấu chấm phân cách nếu cần, hoặc để nguyên string)
                const cleanPrice = item.price.replace(/&nbsp;/g, ' ').replace(/[^\d]/g, '');
                row.getCell(8).value = parseInt(cleanPrice) || 0;
                row.getCell(9).value = parseInt(cleanPrice) || 0;

                // Apply style nếu cần (optional, template thường có sẵn)
                row.commit();
                currentRow++;
            });

            // 5. Tổng chi phí
            const totalRow = worksheet.getRow(currentRow);
            totalRow.getCell(7).value = "Tổng chi phí";
            totalRow.getCell(9).value = totalPrice;
            totalRow.commit();

            // 6. Xuất file
            const buffer = await workbook.xlsx.writeBuffer();
            saveAs(new Blob([buffer]), `cau_hinh_pc_lmc_${Date.now()}.xlsx`);

        } catch (error) {
            console.error('Lỗi khi xuất Excel:', error);
            alert('Có lỗi xảy ra khi tạo file Excel. Vui lòng thử lại.');
        }
    };

    const handleDownloadImage = async () => {
        if (!exportRef.current) return;
        try {
            const dataUrl = await toPng(exportRef.current, { backgroundColor: '#ffffff', pixelRatio: 2 });
            download(dataUrl, 'cau_hinh_pc_lmc.png');
        } catch (error) {
            console.error('Lỗi khi tải ảnh:', error);
            alert('Có lỗi xảy ra khi tải ảnh cấu hình.');
        }
    };

    const handleShare = async () => {
        const list = getSelectedComponentsList();
        if (list.length === 0) {
            alert('Chưa có linh kiện nào để chia sẻ!');
            return;
        }

        const text = list.map(item => `${item.category}: ${item.name} - ${item.price.replace(/&nbsp;/g, ' ')}`).join('\n');
        const shareText = `Cấu hình PC của tôi:\n\n${text}\n\nTổng tiền: ${formatCurrency(totalPrice)}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Cấu hình PC LMC',
                    text: shareText,
                });
            } catch (err) {
                console.error('Lỗi khi chia sẻ:', err);
            }
        } else {
            navigator.clipboard.writeText(shareText);
            alert('Đã copy cấu hình vào clipboard!');
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handleSelectClick = (categoryId: string, name: string, slug: string) => {
        setActiveCategory({ id: categoryId, name, slug });
        setModalOpen(true);
    };

    const handleAddAllToCart = () => {
        let addedCount = 0;
        Object.values(components).forEach(comp => {
            if (comp.product) {
                const numericPrice = parseInt((comp.product.price || comp.product.regularPrice || '').replace(/&nbsp;/g, "").replace(/\D/g, '')) || 0;
                addItem({
                    id: comp.product.id,
                    databaseId: comp.product.databaseId,
                    productId: comp.product.databaseId.toString(),
                    name: comp.product.name,
                    price: numericPrice,
                    quantity: 1,
                    imageUrl: comp.product.image?.sourceUrl || '',
                    slug: comp.product.slug
                });
                addedCount++;
            }
        });

        if (addedCount > 0) {
            alert(`Đã thêm ${addedCount} linh kiện vào giỏ hàng!`);
        } else {
            alert("Vui lòng chọn ít nhất 1 linh kiện.");
        }
    };

    // Component layout
    return (
        <div className="py-4 lg:py-12">
            <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                <div className="mb-4 md:mb-8">
                    <h1 className="text-xl lg:text-4xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight">Xây dựng cấu hình PC</h1>
                    <p className="text-gray-500 text-sm">Chọn các linh kiện để tự build cho mình một bộ PC ưng ý nhất.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                    {/* Left Column: Component List */}
                    <div className="lg:col-span-8 space-y-3 md:space-y-4">
                        <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            {/* Header row */}
                            <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                <div className="col-span-3">Linh kiện</div>
                                <div className="col-span-6">Sản phẩm</div>
                                <div className="col-span-3 text-right">Đơn giá</div>
                            </div>

                            {/* Components */}
                            <div className="divide-y divide-gray-100">
                                {components.map((comp) => (
                                    <div key={comp.id} className="p-3 md:p-6 hover:bg-gray-50/50 transition-colors">
                                        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center">
                                            {/* Category Name */}
                                            <div className="md:col-span-3">
                                                <h3 className="font-bold text-gray-900 text-xs md:text-sm">{comp.name}</h3>
                                            </div>

                                            {/* Product Details or Select Button */}
                                            <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                                                {comp.product ? (
                                                    <>
                                                        <div className="md:col-span-8 flex items-center gap-3">
                                                            <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg md:rounded-xl bg-white border border-gray-100 p-1 flex-shrink-0 relative">
                                                                <Image
                                                                    src={comp.product.image?.sourceUrl || '/placeholder.png'}
                                                                    alt={comp.product.name}
                                                                    fill
                                                                    className="object-contain"
                                                                />
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-gray-900 line-clamp-2 leading-snug">{comp.product.name}</p>
                                                                <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">Mã: {comp.product.databaseId}</p>
                                                            </div>
                                                        </div>
                                                        <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-3 md:gap-6">
                                                            <span className="text-red-600 font-bold whitespace-nowrap text-sm">
                                                                {(comp.product.price || comp.product.regularPrice || '').replace(/&nbsp;/g, " ")}
                                                            </span>
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => handleSelectClick(comp.id, comp.name, comp.slug)}
                                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Đổi linh kiện"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                                                </button>
                                                                <button
                                                                    onClick={() => removeProduct(comp.id)}
                                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                                    title="Xóa linh kiện"
                                                                >
                                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <div className="col-span-12">
                                                        <button
                                                            onClick={() => handleSelectClick(comp.id, comp.name, comp.slug)}
                                                            className="w-full flex items-center justify-center gap-2 py-3 md:py-4 border-2 border-dashed border-blue-200 rounded-lg md:rounded-xl text-blue-600 hover:bg-blue-50 hover:border-blue-400 transition-all font-bold text-sm"
                                                        >
                                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                            Chọn linh kiện
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        {/* Compatibility Hint */}
                                        {compatibilityHints.filter(h => h.targetCategory === comp.id).map((hint, hIdx) => (
                                            <div key={hIdx} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium mt-1 ${hint.type === 'warning' ? 'bg-red-50 text-red-600 border border-red-200' :
                                                hint.type === 'info' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                                                    'bg-green-50 text-green-600 border border-green-200'
                                                }`}>
                                                {hint.type === 'warning' && <AlertTriangle className="w-3.5 h-3.5 shrink-0" />}
                                                {hint.type === 'info' && <Lightbulb className="w-3.5 h-3.5 shrink-0" />}
                                                {hint.type === 'success' && <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />}
                                                <span>{hint.message}</span>
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
                            <button
                                onClick={handleExportExcel}
                                className="flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-3 md:px-4 bg-[#0B519C] hover:bg-[#093e7a] text-white rounded-lg font-bold text-[11px] md:text-sm transition-colors shadow-sm"
                            >
                                <FileSpreadsheet className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                <span className="hidden md:inline">Xuất</span> Excel
                            </button>
                            <button
                                onClick={handleDownloadImage}
                                className="flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-3 md:px-4 bg-[#0B519C] hover:bg-[#093e7a] text-white rounded-lg font-bold text-[11px] md:text-sm transition-colors shadow-sm"
                            >
                                <DownloadCloud className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Tải ảnh
                            </button>
                            <button
                                onClick={handleShare}
                                className="flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-3 md:px-4 bg-[#0B519C] hover:bg-[#093e7a] text-white rounded-lg font-bold text-[11px] md:text-sm transition-colors shadow-sm"
                            >
                                <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                Chia sẻ
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center justify-center gap-1.5 md:gap-2 py-2.5 md:py-3 px-3 md:px-4 bg-[#0B519C] hover:bg-[#093e7a] text-white rounded-lg font-bold text-[11px] md:text-sm transition-colors shadow-sm"
                            >
                                <Printer className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                In
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Sticky Summary */}
                    <div className="lg:col-span-4" ref={summaryRef}>
                        <div className="sticky top-20 lg:top-24 bg-white rounded-2xl md:rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 p-4 md:p-8 space-y-4 md:space-y-6">
                            <div>
                                <h2 className="text-base md:text-xl font-black text-gray-900 mb-1 md:mb-2">Thông tin cấu hình</h2>
                                <p className="text-xs md:text-sm text-gray-500">Tóm tắt các linh kiện bạn đã chọn</p>
                            </div>

                            <div className="space-y-3 md:space-y-4 pt-3 md:pt-4 border-t border-gray-100">
                                {components.filter(c => c.product).length === 0 ? (
                                    <p className="text-sm text-gray-400 italic">Chưa có linh kiện nào được chọn.</p>
                                ) : (
                                    <div className="space-y-3">
                                        {components.filter(c => c.product).map(comp => (
                                            <div key={comp.id} className="flex justify-between items-start text-xs md:text-sm">
                                                <span className="text-gray-500 w-2/3 truncate pr-3 md:pr-4">{comp.product?.name}</span>
                                                <span className="text-gray-900 font-bold whitespace-nowrap">
                                                    {(comp.product?.price || comp.product?.regularPrice || '').replace(/&nbsp;/g, " ")}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 md:pt-6 border-t border-gray-100 space-y-3 md:space-y-4">
                                <div className="flex justify-between items-end">
                                    <span className="text-sm md:text-base text-gray-500 font-bold">Tổng tiền:</span>
                                    <span className="text-xl md:text-3xl font-black text-red-600 tracking-tight">
                                        {formatCurrency(totalPrice)}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 md:gap-3 pt-3 md:pt-4">
                                    <button
                                        onClick={clearAll}
                                        className="py-2.5 md:py-3 px-3 md:px-4 rounded-xl border border-gray-200 text-gray-700 font-bold hover:bg-gray-50 hover:text-red-600 transition-colors text-xs md:text-sm"
                                    >
                                        Làm mới
                                    </button>
                                    <button
                                        onClick={handleAddAllToCart}
                                        className="py-2.5 md:py-3 px-3 md:px-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors text-xs md:text-sm shadow-lg shadow-blue-600/30"
                                    >
                                        Thêm vào giỏ
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {activeCategory && (
                <ProductSelectModal
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                    categoryId={activeCategory.id}
                    categoryName={activeCategory.name}
                    categorySlug={activeCategory.slug}
                    compatibilityFilter={getAutoFilterForCategory(activeCategory.id, components)}
                    onSelect={(product) => {
                        usePcBuilderStore.getState().selectProduct(activeCategory.id, product);
                    }}
                />
            )}
            {/* Export Layout */}
            <PcBuilderExportTemplate ref={exportRef} components={components} totalPrice={totalPrice} companyInfo={companyInfo} />
        </div>
    );
}
