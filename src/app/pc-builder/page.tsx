"use client";

import { useState, useRef, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { usePcBuilderStore } from "@/store/usePcBuilderStore";
import { ProductSelectModal } from "@/components/pc-builder/ProductSelectModal";
import { PcBuilderExportTemplate } from "@/components/pc-builder/PcBuilderExportTemplate";
import { PcBuilderPrintTemplate } from "@/components/pc-builder/PcBuilderPrintTemplate";
import { useCartStore } from "@/store/useCartStore";
import { getAutoFilterForCategory } from "@/lib/pc-builder/compatibilityEngine";
import { FileSpreadsheet, DownloadCloud, Share2, Printer, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { toPng } from 'html-to-image';
import download from 'downloadjs';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { getPcBuilderConfig } from '@/app/actions/configActions';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { fetchProductsByIdsAction } from "@/app/actions/productActions";

function BuildPcPageInner() {
    const { components, totalPrice, removeProduct, clearAll, initComponents, compatibilityHints } = usePcBuilderStore();
    const addItem = useCartStore(state => state.addItem);

    const [modalOpen, setModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState<{ id: string; name: string; slug: string } | null>(null);
    const [companyInfo, setCompanyInfo] = useState<{ logo?: string, name?: string, contact?: string, contacts?: { icon: string, text: string }[], description?: string }>({});

    const [wantsAssembly, setWantsAssembly] = useState(true);
    const [wantsSoftware, setWantsSoftware] = useState(false);
    const router = useRouter();
    const searchParams = useSearchParams();

    const [configLoaded, setConfigLoaded] = useState(false);
    const [applyingTemplateName, setApplyingTemplateName] = useState<string | null>(null);

    const PREBUILT_TEMPLATES = [
        { name: "PC Văn Phòng", priceHint: "Cơ bản", icon: "💻", description: "Lướt web, Office mượt mà", onClick: () => { setApplyingTemplateName("PC Văn Phòng"); router.push('/pc-builder?mainboard=34558&cpu=31318&ram=34655&ssd=34524&psu=34387&case=34146'); } },
        { name: "PC Gaming", priceHint: "Quốc dân", icon: "🎮", description: "Chiến mượt LOL, FO4, CSGO", onClick: () => alert("Tính năng cấu hình sẵn đang được cập nhật.") },
        { name: "PC Đồ Họa", priceHint: "Render", icon: "🎨", description: "Photoshop, Premiere, 3D", onClick: () => alert("Tính năng cấu hình sẵn đang được cập nhật.") }
    ];

    const activeCategoryRef = useRef<{ id: string; name: string; slug: string } | null>(null);
    const summaryRef = useRef<HTMLDivElement>(null);
    const exportRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        getPcBuilderConfig().then((config: any) => {
            if (config) {
                if (Array.isArray(config)) {
                    initComponents(config);
                } else if (config.components) {
                    initComponents(config.components);
                    if (config.companyInfo) setCompanyInfo(config.companyInfo);
                }
            }
            setConfigLoaded(true);
        }).catch(() => setConfigLoaded(true));
    }, [initComponents]);

    useEffect(() => {
        if (!configLoaded) return;

        const knownKeys = ['mainboard', 'cpu', 'ram', 'vga', 'ssd', 'hdd', 'psu', 'case', 'cooler', 'monitor', 'keyboard_mouse', 'headphone'];
        const idsToFetch: { categoryId: string; dbId: number }[] = [];
        knownKeys.forEach(key => {
            const val = searchParams.get(key);
            if (val && !isNaN(parseInt(val))) {
                idsToFetch.push({ categoryId: key, dbId: parseInt(val) });
            }
        });

        if (idsToFetch.length > 0) {
            router.replace('/pc-builder', { scroll: false });
            const ids = idsToFetch.map(i => i.dbId).join(',');
            fetch(`/api/products-by-ids?ids=${ids}`)
                .then(r => r.json())
                .then(({ products }) => {
                    if (products && products.length > 0) {
                        const templateItems = idsToFetch.map(item => {
                            const product = products.find((p: any) => p.databaseId === item.dbId);
                            return { categoryId: item.categoryId, product };
                        }).filter((i): i is { categoryId: string; product: any } => !!i.product);
                        usePcBuilderStore.getState().applyTemplate(templateItems);
                    }
                })
                .catch(console.error)
                .finally(() => setApplyingTemplateName(null));
        } else {
            setApplyingTemplateName(null);
        }
    }, [searchParams, configLoaded, router]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const getSelectedComponentsList = () => {
        return components.filter(c => c.product).map(comp => {
            const p = comp.product;
            // Fallbacks for various ACF naming variations
            const rawWarranty: string =
                p?.thongtinsanpham?.chinhSachBaoHanh ||
                p?.thontinsanpham?.chinhSachBaoHanh ||
                p?.thongtinsanpham?.chinh_sach_bao_hanh ||
                p?.thontinsanpham?.chinh_sach_bao_hanh ||
                '';

            // Aggressive strip to get only duration (e.g. "Bảo hành chính hãng 36 tháng" -> "36 tháng")
            const warranty = rawWarranty
                .replace(/^[Bb]ảo\s*[Hh]ành.*?(?=\d)/u, '') // Strip "Bảo hành..." until the first digit
                .replace(/^[Bb]ảo\s*[Hh]ành\s*[:-]?\s*/u, '') // Fallback strip
                .trim() || 'Chưa có thông tin';

            return {
                category: comp.name,
                name: comp.product?.name || '',
                price: comp.product?.price || comp.product?.regularPrice || '0',
                id: comp.product?.sku || comp.product?.databaseId || '',
                warranty,
            };
        });
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
            // Assuming A1:B4 for logo, F1:H4 for company info
            worksheet.getRow(1).height = 40;
            if (companyInfo.name) {
                const titleCell = worksheet.getCell('D1');
                titleCell.value = companyInfo.name.toUpperCase();
                titleCell.font = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0E5296' }, underline: false, strike: false };
                titleCell.alignment = { vertical: 'middle', horizontal: 'right' };
            }

            if (companyInfo.contacts && companyInfo.contacts.length > 0) {
                const cCell = worksheet.getCell('D2');
                const contactText = companyInfo.contacts.slice(0, 3).map(c => `${c.icon} ${c.text}`).join('\n');
                cCell.value = contactText;
                cCell.font = { name: 'Arial', size: 10, bold: false, italic: false, underline: false, strike: false };
                cCell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
            } else if (companyInfo.contact) {
                const cCell = worksheet.getCell('D2');
                const desc = companyInfo.description ? `\n${companyInfo.description}` : '';
                cCell.value = `${companyInfo.contact}${desc}`;
                cCell.font = { name: 'Arial', size: 10, bold: false, italic: false, underline: false, strike: false };
                cCell.alignment = { vertical: 'middle', horizontal: 'right', wrapText: true };
            }

            // Đổi tên Bảng giá
            const tbTitleCell = worksheet.getCell('A5');
            tbTitleCell.value = 'BẢNG BÁO GIÁ THIẾT BỊ';
            tbTitleCell.font = { name: 'Arial', size: 16, bold: true, italic: false, strike: false, underline: false, color: { argb: 'FF000000' } };
            tbTitleCell.alignment = { vertical: 'middle', horizontal: 'center' };

            // Chèn Logo nếu là Base64
            if (companyInfo.logo && companyInfo.logo.startsWith('data:image')) {
                let logoWidth = 320;
                let logoHeight = 120;

                try {
                    const img = new window.Image();
                    img.src = companyInfo.logo;
                    await new Promise((resolve) => {
                        img.onload = resolve;
                        img.onerror = resolve;
                    });
                    if (img.width && img.height) {
                        logoHeight = 120;
                        logoWidth = img.width * (120 / img.height);
                    }
                } catch (e) { }

                const logoId = workbook.addImage({
                    base64: companyInfo.logo,
                    extension: companyInfo.logo.includes('png') ? 'png' : 'jpeg',
                });
                worksheet.addImage(logoId, {
                    tl: { col: 0.1, row: 0.1 },
                    ext: { width: logoWidth, height: logoHeight },
                    editAs: 'oneCell'
                } as any);
            } else if (companyInfo.name) {
                // Fallback thành tên viết tắt nếu không có logo
                worksheet.getCell('A2').value = companyInfo.name.substring(0, 3).toUpperCase();
            }

            // 3. Cập nhật ngày tháng (Dòng 8, Cột G/H)
            const now = new Date();
            const dateStr = `Đã tạo: ${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`;
            const dateCell = worksheet.getCell('G8');
            dateCell.value = dateStr;
            dateCell.font = { name: 'Arial', size: 10, bold: true, italic: true, strike: false, underline: false, color: { argb: 'FF000000' } };

            // Cập nhật lại Headers (Dòng 9) để xóa các format lỗi từ template
            const headerRow = worksheet.getRow(9);
            for (let c = 1; c <= 8; c++) {
                const hCell = headerRow.getCell(c);
                hCell.font = { name: 'Arial', size: 10, bold: true, italic: true, strike: false, underline: false, color: { argb: 'FFFFFFFF' } }; // Chữ trắng cho Header
            }

            // 4. Xoá TOÀN BỘ style cũ trong template (từ dòng 10 đến 50)
            for (let i = 10; i <= 50; i++) {
                const r = worksheet.getRow(i);
                r.height = 15; // reset row height
                for (let ci = 1; ci <= 8; ci++) {
                    const c = r.getCell(ci);
                    c.value = null;
                    c.border = {};
                    c.font = { name: 'Arial', size: 10, bold: false, italic: false, strike: false, underline: false };
                    c.alignment = { horizontal: 'center', vertical: 'middle' };
                    c.fill = { type: 'pattern', pattern: 'none' } as any;
                    c.numFmt = '';
                    c.style = {} as any; // full style wipe
                }
                r.commit();
            }

            // Unmerge all template merges from row 10 downwards to prevent overlapping bugs
            const templateMerges = (worksheet.model as any).merges || [];
            templateMerges.forEach((m: string) => {
                const match = m.match(/\d+/);
                if (match && parseInt(match[0]) >= 10) {
                    try { worksheet.unMergeCells(m); } catch (e) { }
                }
            });

            // 5. Điền dữ liệu linh kiện bắt đầu từ dòng 10
            let currentRow = 10;
            list.forEach((item, index) => {
                const row = worksheet.getRow(currentRow);
                row.getCell(1).value = index + 1; // STT (A)
                row.getCell(2).value = item.id;    // Mã SP (B)
                row.getCell(3).value = item.name;  // Tên SP (C)

                row.getCell(5).value = item.warranty; // Bảo hành (E) - từ ACF chinh_sach_bao_hanh
                row.getCell(6).value = 1;          // Số lượng (F)

                const cleanPrice = item.price.replace(/&nbsp;/g, ' ').replace(/[^\d]/g, '');
                const numPrice = parseInt(cleanPrice) || 0;

                row.getCell(7).value = numPrice; // Giá (G)
                row.getCell(8).value = numPrice; // Thành tiền (H)

                row.height = 25;
                // Định dạng lại giao diện cho dòng
                for (let c = 1; c <= 8; c++) {
                    const cell = row.getCell(c);
                    cell.font = { name: 'Arial', size: 10, bold: false, italic: false, strike: false, underline: false };
                    cell.border = {
                        top: { style: 'thin' }, left: { style: 'thin' },
                        bottom: { style: 'thin' }, right: { style: 'thin' }
                    };

                    let horzAlignment: 'left' | 'center' | 'right' = 'center';
                    if (c === 2 || c === 3 || c === 4) horzAlignment = 'left';
                    else if (c >= 7) horzAlignment = 'right';

                    cell.alignment = {
                        vertical: 'middle',
                        horizontal: horzAlignment,
                        wrapText: true
                    };
                }

                // Thực hiện merge cột D vào C sau khi đã định dạng xong từng cell
                try { worksheet.mergeCells(`C${currentRow}:D${currentRow}`); } catch (e) { }

                row.getCell(7).numFmt = '#,##0';
                row.getCell(8).numFmt = '#,##0';

                row.commit();
                // Re-apply alignment for ALL columns after commit to prevent template row-style from overriding cell styles
                for (let c = 1; c <= 8; c++) {
                    let horzAlignment: 'left' | 'center' | 'right' = 'center';
                    if (c === 2 || c === 3 || c === 4) horzAlignment = 'left';
                    else if (c >= 7) horzAlignment = 'right';
                    worksheet.getCell(currentRow, c).alignment = { vertical: 'middle', horizontal: horzAlignment, wrapText: true };
                }
                currentRow++;
            });

            // 6. Tổng chi phí (Dòng kế tiếp)
            const totalRow = worksheet.getRow(currentRow);
            try { worksheet.mergeCells(`F${currentRow}:G${currentRow}`); } catch (e) { }
            totalRow.getCell(6).value = "Tổng chi phí";
            totalRow.getCell(8).value = totalPrice;
            for (let c = 1; c <= 8; c++) {
                const cell = totalRow.getCell(c);
                cell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF000000' } };
                if (c >= 6) cell.border = {
                    top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' }
                };
            }
            totalRow.getCell(8).numFmt = '#,##0';
            totalRow.getCell(6).alignment = { horizontal: 'right' };
            totalRow.getCell(8).alignment = { horizontal: 'right' };
            totalRow.commit();

            // 7. Ghi chú chân trang - lấy từ Ghi chú trong Admin
            const noteRow = worksheet.getRow(currentRow + 1);
            const noteText = companyInfo.description || 'Quý khách lưu ý: Giá bán, khuyến mại của sản phẩm và tình trạng còn hàng có thể bị thay đổi bất cứ lúc nào mà không kịp báo trước.';
            noteRow.getCell(1).value = noteText;
            noteRow.getCell(1).font = { name: 'Arial', size: 10, italic: true, underline: false, strike: false };
            noteRow.getCell(1).alignment = { vertical: 'top', horizontal: 'left', wrapText: true };
            noteRow.height = Math.max(30, Math.ceil(noteText.length / 80) * 15); // auto height based on text length

            // Try to merge cells for the note, but catch if it overlaps existing merges in the template
            try {
                worksheet.mergeCells(`A${currentRow + 1}:H${currentRow + 1}`);
            } catch (e) { }

            noteRow.commit();

            // 8. Xuất file
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

        const queryParams = new URLSearchParams();
        components.filter(c => c.product).forEach(c => {
            queryParams.set(c.id, c.product.databaseId.toString());
        });
        const shareUrl = `${window.location.origin}${window.location.pathname}?${queryParams.toString()}`;

        const text = list.map(item => `${item.category}: ${item.name} - ${item.price.replace(/&nbsp;/g, ' ')}`).join('\n');
        const services = [wantsAssembly ? 'Lắp ráp PC & Đi dây giấu kín' : '', wantsSoftware ? 'Cài đặt Windows & Phần mềm cơ bản' : ''].filter(Boolean);
        const serviceText = services.length > 0 ? `\n\nDịch vụ:\n- ${services.join('\n- ')}` : '';
        const shareText = `Cấu hình PC của tôi:\n\n${text}${serviceText}\n\nTổng tiền: ${formatCurrency(totalPrice)}\n\nXem chi tiết tại: ${shareUrl}`;

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
        <>
            <div className="py-4 lg:py-12 print:hidden">
                <div className="container mx-auto px-3 sm:px-6 lg:px-8">
                    <div className="mb-4 md:mb-8">
                        <h1 className="text-xl lg:text-4xl font-black text-gray-900 mb-1 md:mb-2 tracking-tight">Xây dựng cấu hình PC</h1>
                        <p className="text-gray-500 text-sm">Chọn các linh kiện để tự build cho mình một bộ PC ưng ý nhất.</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8">
                        {/* Left Column: Component List */}
                        <div className="lg:col-span-8 space-y-3 md:space-y-4">
                            {/* Pre-built Templates */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 mb-2">
                                {PREBUILT_TEMPLATES.map((tpl, idx) => {
                                    const isLoading = applyingTemplateName === tpl.name;
                                    return (
                                        <button 
                                            key={idx} 
                                            onClick={tpl.onClick} 
                                            disabled={applyingTemplateName !== null}
                                            className={`relative bg-white border ${isLoading ? 'border-blue-500 shadow-md scale-[1.02]' : 'border-gray-100 hover:border-blue-300 hover:shadow-md'} transition-all duration-300 rounded-xl p-3 md:p-4 text-left overflow-hidden group disabled:opacity-80 disabled:cursor-not-allowed`}
                                        >
                                            {isLoading && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-[1px] z-10 animate-in fade-in duration-300">
                                                    <div className="flex flex-col items-center gap-1.5">
                                                        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                                        <span className="text-[10px] md:text-xs font-semibold text-blue-600 animate-pulse">Đang nạp...</span>
                                                    </div>
                                                </div>
                                            )}
                                            <div className={`transition-opacity duration-300 ${isLoading ? 'opacity-30' : 'opacity-100'}`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg md:text-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">{tpl.icon}</div>
                                                    <span className="bg-gray-100 text-gray-600 text-[10px] md:text-xs font-bold px-2 py-1 rounded-full">{tpl.priceHint}</span>
                                                </div>
                                                <h3 className="font-bold text-gray-900 text-xs md:text-sm mb-0.5 md:mb-1">{tpl.name}</h3>
                                                <p className="text-[10px] md:text-xs text-gray-500">{tpl.description}</p>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            <div className="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                {/* Header row */}
                                <div className="hidden md:grid grid-cols-12 gap-4 bg-gray-50 p-4 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                                    <div className="col-span-3">Linh kiện</div>
                                    <div className="col-span-6">Sản phẩm</div>
                                    <div className="col-span-3 text-right">Đơn giá</div>
                                </div>

                                {/* Components */}
                                <div className="divide-y divide-gray-100">
                                    {components.map((comp, index) => (
                                        <div 
                                            key={comp.id} 
                                            className="p-3 md:p-6 hover:bg-gray-50/50 transition-colors animate-in fade-in slide-in-from-bottom-4 duration-500"
                                            style={{ animationFillMode: 'both', animationDelay: `${index * 50}ms` }}
                                        >
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
                                                                    <div className="flex flex-col gap-0.5 mt-0.5 md:mt-1">
                                                                        <p className="text-[10px] md:text-xs text-gray-500">Mã: {comp.product.databaseId}</p>
                                                                        <p className="text-[10px] md:text-xs text-blue-600 font-medium">
                                                                            Bảo hành: {getSelectedComponentsList().find(item => item.id === (comp.product.sku || comp.product.databaseId))?.warranty || 'Đang tải...'}
                                                                        </p>
                                                                    </div>
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
                                    {/* Services */}
                                    <div className="space-y-3 mb-4 bg-gray-50 p-3 md:p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-sm font-bold text-gray-900">Dịch vụ & Tiện ích</h3>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center mt-0.5">
                                                <input type="checkbox" checked={wantsAssembly} onChange={(e) => setWantsAssembly(e.target.checked)} className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                                            </div>
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Yêu cầu LMC lắp ráp & Đi dây giấu kín</p>
                                                <p className="text-[10px] md:text-xs text-green-600 font-bold mt-0.5">Miễn phí</p>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <div className="relative flex items-center mt-0.5">
                                                <input type="checkbox" checked={wantsSoftware} onChange={(e) => setWantsSoftware(e.target.checked)} className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2" />
                                            </div>
                                            <div>
                                                <p className="text-xs md:text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">Cài đặt Windows & Phần mềm cơ bản</p>
                                                <p className="text-[10px] md:text-xs text-green-600 font-bold mt-0.5">Miễn phí</p>
                                            </div>
                                        </label>
                                    </div>

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

            <PcBuilderPrintTemplate components={components} totalPrice={totalPrice} companyInfo={companyInfo} />
        </>
    );
}

export default function BuildPcPage() {
    return (
        <Suspense fallback={null}>
            <BuildPcPageInner />
        </Suspense>
    );
}
