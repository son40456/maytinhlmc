"use client";

import { useState, useEffect } from "react";
import { BannerConfig, BannerItem, CategoryBannerSetting } from "@/app/actions/configActions";
import { CategorySearchInput, setCategoryBannersRef } from "@/components/admin/CategorySearchInput";
import { Button } from "@/components/ui/Button";
import {
    Save, Plus, MoveUp, MoveDown,
    Trash2, Loader2, Image as ImageIcon, Upload, X,
    Home, LayoutGrid, Eye, EyeOff
} from "lucide-react";

type AdminTab = "homepage" | "category";

export default function AdminBannersPage() {
    const [activeTab, setActiveTab] = useState<AdminTab>("homepage");
    const [config, setConfig] = useState<BannerConfig>({ mainBanners: [], smallBanners: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Category tab
    const [selectedCatSlug, setSelectedCatSlug] = useState<string>("_default");
    const [selectedCatName, setSelectedCatName] = useState<string>("Banner Mặc Định");

    useEffect(() => {
        fetch("/api/admin/banners")
            .then(res => res.json())
            .then(data => {
                setConfig({ ...data, categoryBanners: data.categoryBanners || {} });
                setLoading(false);
            })
            .catch(() => {
                setError("Không thể tải cấu hình Banner.");
                setLoading(false);
            });
    }, []);

    // Sync categoryBanners ref to CategorySearchInput for badge display
    useEffect(() => {
        setCategoryBannersRef(config.categoryBanners || {});
    }, [config.categoryBanners]);

    // ─── Save ─────────────────────────────────────────────────────────────────

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            const res = await fetch("/api/admin/banners", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(config)
            });
            if (res.ok) {
                setSuccess("Lưu cấu hình thành công!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Có lỗi khi lưu cấu hình Banner.");
            }
        } catch {
            setError("Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    };

    // ─── Upload ────────────────────────────────────────────────────────────────

    const handleImageUpload = async (uploadKey: string, onSuccess: (url: string) => void) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;
            setUploadingImage(uploadKey);
            setError("");
            try {
                const formData = new FormData();
                formData.append('file', file);
                const res = await fetch('/api/admin/upload', { method: 'POST', body: formData });
                const data = await res.json();
                if (res.ok && data.url) {
                    onSuccess(data.url);
                    setSuccess('Tải ảnh thành công!');
                    setTimeout(() => setSuccess(""), 3000);
                } else {
                    setError(data.error || 'Upload ảnh thất bại.');
                }
            } catch {
                setError('Có lỗi xảy ra khi upload ảnh.');
            } finally {
                setUploadingImage(null);
            }
        };
        input.click();
    };

    // ─── Homepage Banner CRUD ─────────────────────────────────────────────────

    const addBanner = (type: 'main' | 'small') => {
        const newBanner: BannerItem = { id: `banner-${Date.now()}`, image: "", link: "" };
        if (type === 'main') setConfig({ ...config, mainBanners: [...config.mainBanners, newBanner] });
        else setConfig({ ...config, smallBanners: [...config.smallBanners, newBanner] });
    };

    const updateBanner = (type: 'main' | 'small', index: number, field: keyof BannerItem, value: string) => {
        const list = type === 'main' ? [...config.mainBanners] : [...config.smallBanners];
        list[index] = { ...list[index], [field]: value };
        setConfig(type === 'main' ? { ...config, mainBanners: list } : { ...config, smallBanners: list });
    };

    const removeBanner = (type: 'main' | 'small', index: number) => {
        const list = type === 'main' ? [...config.mainBanners] : [...config.smallBanners];
        list.splice(index, 1);
        setConfig(type === 'main' ? { ...config, mainBanners: list } : { ...config, smallBanners: list });
    };

    const moveBanner = (type: 'main' | 'small', index: number, direction: 'up' | 'down') => {
        const list = type === 'main' ? [...config.mainBanners] : [...config.smallBanners];
        if (direction === 'up' && index > 0) [list[index - 1], list[index]] = [list[index], list[index - 1]];
        else if (direction === 'down' && index < list.length - 1) [list[index], list[index + 1]] = [list[index + 1], list[index]];
        setConfig(type === 'main' ? { ...config, mainBanners: list } : { ...config, smallBanners: list });
    };

    // ─── Category Banner CRUD ─────────────────────────────────────────────────

    const getCurrentCatSetting = (): CategoryBannerSetting =>
        (config.categoryBanners as any)?.[selectedCatSlug] || { enabled: true, banners: [] };

    const updateCatSetting = (updated: Partial<CategoryBannerSetting>) => {
        const current = getCurrentCatSetting();
        setConfig({
            ...config,
            categoryBanners: {
                ...config.categoryBanners,
                [selectedCatSlug]: { ...current, ...updated }
            }
        });
    };

    const addCatBanner = () => {
        const current = getCurrentCatSetting();
        updateCatSetting({ banners: [...current.banners, { id: `cat-${Date.now()}`, image: "", link: "" }] });
    };

    const updateCatBanner = (index: number, field: keyof BannerItem, value: string) => {
        const banners = [...getCurrentCatSetting().banners];
        banners[index] = { ...banners[index], [field]: value };
        updateCatSetting({ banners });
    };

    const removeCatBanner = (index: number) => {
        const banners = [...getCurrentCatSetting().banners];
        banners.splice(index, 1);
        updateCatSetting({ banners });
    };

    const moveCatBanner = (index: number, direction: 'up' | 'down') => {
        const banners = [...getCurrentCatSetting().banners];
        if (direction === 'up' && index > 0) [banners[index - 1], banners[index]] = [banners[index], banners[index - 1]];
        else if (direction === 'down' && index < banners.length - 1) [banners[index], banners[index + 1]] = [banners[index + 1], banners[index]];
        updateCatSetting({ banners });
    };

    // ─── Loading ───────────────────────────────────────────────────────────────

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    // ─── Shared BannerCard ─────────────────────────────────────────────────────

    const renderBannerCard = (
        banner: BannerItem,
        index: number,
        total: number,
        handlers: {
            onMoveUp: () => void;
            onMoveDown: () => void;
            onRemove: () => void;
            onImage: (url: string) => void;
            onLink: (url: string) => void;
        },
        uploadKey: string,
        orderLabel?: string,
    ) => {
        const isUploading = uploadingImage === uploadKey;
        return (
            <div key={uploadKey} className="group relative flex gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                {/* Order badge */}
                {orderLabel && (
                    <div className="absolute -top-2.5 left-4 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
                        {orderLabel}
                    </div>
                )}

                {/* Hover actions */}
                <div className="absolute right-3 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/95 backdrop-blur rounded-lg shadow-sm border border-slate-100 p-1">
                    <button onClick={handlers.onMoveUp} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30">
                        <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={handlers.onMoveDown} disabled={index === total - 1} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30">
                        <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <div className="w-px h-4 bg-slate-200 mx-0.5" />
                    <button onClick={handlers.onRemove} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Thumbnail upload */}
                <div className="w-44 h-[58px] bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 relative overflow-hidden flex flex-col items-center justify-center group/img">
                    {banner.image ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                <button onClick={() => handleImageUpload(uploadKey, handlers.onImage)} className="p-1.5 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white">
                                    <Upload className="w-4 h-4" />
                                </button>
                            </div>
                        </>
                    ) : (
                        <button onClick={() => handleImageUpload(uploadKey, handlers.onImage)} className="flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors">
                            <ImageIcon className="w-5 h-5 mb-1" />
                            <span className="text-[10px] font-medium">Tải ảnh lên</span>
                        </button>
                    )}
                    {isUploading && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                            <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Fields */}
                <div className="flex-1 space-y-2 min-w-0">
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">URL Hình Ảnh</label>
                        <input
                            value={banner.image}
                            onChange={e => handlers.onImage(e.target.value)}
                            placeholder="https://... hoặc click ô bên trái để upload"
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Link điều hướng</label>
                        <input
                            value={banner.link}
                            onChange={e => handlers.onLink(e.target.value)}
                            placeholder="/category/vga-card-man-hinh"
                            className="w-full px-3 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-mono"
                        />
                    </div>
                </div>
            </div>
        );
    };

    // ─── Homepage Banner list ──────────────────────────────────────────────────

    const renderHomepageBannerSection = (type: 'main' | 'small', title: string, subtitle: string) => {
        const banners = type === 'main' ? config.mainBanners : config.smallBanners;
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-base font-bold text-slate-800 flex items-center gap-3">
                            {title}
                            {type === 'small' && (
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" checked={config.showSmallBanners !== false}
                                        onChange={e => setConfig({ ...config, showSmallBanners: e.target.checked })} />
                                    <div className="relative w-9 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ms-2 text-xs font-medium text-slate-500">Hiển thị</span>
                                </label>
                            )}
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                    </div>
                    <Button onClick={() => addBanner(type)} size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 text-xs">
                        <Plus className="w-3.5 h-3.5 mr-1.5" />Thêm Banner
                    </Button>
                </div>
                <div className="p-5 space-y-3">
                    {banners.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm border-2 border-dashed border-slate-200 rounded-xl">Chưa có banner nào.</div>
                    ) : banners.map((banner, i) => renderBannerCard(banner, i, banners.length, {
                        onMoveUp: () => moveBanner(type, i, 'up'),
                        onMoveDown: () => moveBanner(type, i, 'down'),
                        onRemove: () => removeBanner(type, i),
                        onImage: url => updateBanner(type, i, 'image', url),
                        onLink: url => updateBanner(type, i, 'link', url),
                    }, `${type}-${i}`))}
                </div>
            </div>
        );
    };

    // ─── Category Banner section state ─────────────────────────────────────────

    const currentCatSetting = getCurrentCatSetting();

    // Preview: hiển thị dạng 2-up giống frontend (cặp ảnh đầu tiên)
    const previewBanners = currentCatSetting.banners.filter(b => b.image);

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản Lý Banner</h1>
                    <p className="text-slate-500 mt-0.5 text-sm">Banner trang chủ và banner đầu trang danh mục sản phẩm</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-white min-w-[140px]">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </Button>
            </div>

            {error && (
                <div className="mb-5 p-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
                    <X className="w-4 h-4 flex-shrink-0" />{error}
                </div>
            )}
            {success && (
                <div className="mb-5 p-3.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl text-sm font-medium flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {success}
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1.5 mb-6 bg-slate-100 p-1 rounded-xl w-fit">
                {([['homepage', Home, 'Banner Trang Chủ'], ['category', LayoutGrid, 'Banner Danh Mục']] as const).map(([tab, Icon, label]) => (
                    <button key={tab} onClick={() => setActiveTab(tab as AdminTab)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            {/* ── Tab: Trang Chủ ──────────────────────────────────────────────────── */}
            {activeTab === "homepage" && (
                <>
                    {renderHomepageBannerSection('main', 'Banner Chính (Slider)', 'Tỷ lệ ngang ~16:5 (1920×600). Hiển thị full width.')}
                    {renderHomepageBannerSection('small', 'Banner Nhỏ (Grid 4 ô)', 'Hiển thị dưới banner chính. Ẩn trên Mobile.')}
                </>
            )}

            {/* ── Tab: Banner Danh Mục ────────────────────────────────────────────── */}
            {activeTab === "category" && (
                <div className="space-y-5">
                    {/* Chọn danh mục — live search */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
                            <h2 className="text-base font-bold text-slate-800">Chọn Danh Mục</h2>
                            <p className="text-xs text-slate-400 mt-0.5">
                                Gõ tên danh mục để tìm kiếm. &quot;Banner Mặc Định&quot; áp dụng chung cho danh mục chưa có banner riêng.
                            </p>
                        </div>
                        <div className="p-5">
                            <CategorySearchInput
                                value={selectedCatSlug}
                                onChange={(slug, name) => {
                                    setSelectedCatSlug(slug);
                                    setSelectedCatName(name);
                                }}
                                placeholder="Tìm danh mục..."
                            />
                        </div>
                    </div>

                    {/* Cấu hình banner cho danh mục đang chọn */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center gap-4">
                            <div className="min-w-0">
                                <h2 className="text-base font-bold text-slate-800 truncate">
                                    {selectedCatSlug === "_default" ? "⭐ Banner Mặc Định" : `📂 ${selectedCatName || selectedCatSlug}`}
                                </h2>
                                <p className="text-xs text-slate-400 mt-0.5">
                                    Carousel hiển thị 2 ảnh/lần, tỷ lệ mỗi ảnh 790×260. Slide từng ảnh một, vòng lặp liên tục.
                                </p>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                                {/* Toggle bật/tắt */}
                                <label className="inline-flex items-center cursor-pointer gap-2">
                                    <input type="checkbox" className="sr-only peer" checked={currentCatSetting.enabled}
                                        onChange={e => updateCatSetting({ enabled: e.target.checked })} />
                                    <div className="relative w-10 h-5 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                                    <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                                        {currentCatSetting.enabled ? <Eye className="w-3.5 h-3.5 text-green-600" /> : <EyeOff className="w-3.5 h-3.5" />}
                                        {currentCatSetting.enabled ? "Bật" : "Tắt"}
                                    </span>
                                </label>
                                <Button onClick={addCatBanner} size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200 text-xs">
                                    <Plus className="w-3.5 h-3.5 mr-1.5" />Thêm Ảnh
                                </Button>
                            </div>
                        </div>

                        <div className="p-5 space-y-3">
                            {currentCatSetting.banners.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
                                    <LayoutGrid className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                                    <p className="text-sm font-medium">Chưa có ảnh banner nào.</p>
                                    <p className="text-xs mt-1 text-slate-400">Thêm ít nhất 2 ảnh để carousel hoạt động đúng.</p>
                                    <Button onClick={addCatBanner} size="sm" className="mt-3 bg-blue-600 text-white hover:bg-blue-700 text-xs">
                                        <Plus className="w-3.5 h-3.5 mr-1" /> Thêm Ảnh Đầu Tiên
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Hint số lượng */}
                                    <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-100 rounded-lg text-xs text-blue-700">
                                        <span className="font-semibold">Mẹo:</span>
                                        Có {currentCatSetting.banners.length} ảnh. Carousel hiển thị 2 ảnh/lần, slide từng ảnh. Thêm nhiều ảnh để carousel chạy tốt hơn.
                                    </div>

                                    {currentCatSetting.banners.map((banner, i) =>
                                        renderBannerCard(banner, i, currentCatSetting.banners.length, {
                                            onMoveUp: () => moveCatBanner(i, 'up'),
                                            onMoveDown: () => moveCatBanner(i, 'down'),
                                            onRemove: () => removeCatBanner(i),
                                            onImage: url => updateCatBanner(i, 'image', url),
                                            onLink: url => updateCatBanner(i, 'link', url),
                                        }, `cat-${selectedCatSlug}-${i}`, `#${i + 1}`)
                                    )}

                                    {/* Preview 2-up giống frontend */}
                                    {previewBanners.length >= 1 && (
                                        <div className="mt-4 pt-4 border-t border-slate-100">
                                            <p className="text-xs font-semibold text-slate-400 uppercase mb-2.5 flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" /> Xem trước (cặp đầu tiên)
                                            </p>
                                            <div className="grid grid-cols-2 gap-2 rounded-xl overflow-hidden">
                                                {[previewBanners[0], previewBanners[1] ?? null].map((b, idx) =>
                                                    b ? (
                                                        <div key={idx} className="relative rounded-xl overflow-hidden bg-slate-100 border border-slate-200" style={{ aspectRatio: '790/260' }}>
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img src={b.image} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                                                            <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                                Ảnh #{previewBanners.indexOf(b) + 1}
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div key={idx} className="rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400" style={{ aspectRatio: '790/260' }}>
                                                            Chưa có ảnh #{idx + 2}
                                                        </div>
                                                    )
                                                )}
                                            </div>
                                            {previewBanners.length > 2 && (
                                                <p className="text-xs text-slate-400 mt-1.5 text-center">
                                                    + {previewBanners.length - 2} ảnh nữa trong carousel
                                                </p>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Tổng hợp các danh mục đã cấu hình */}
                    {config.categoryBanners && Object.values(config.categoryBanners).some((s: any) => s?.banners?.length > 0) && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="px-6 py-3.5 border-b border-slate-200 bg-slate-50/50">
                                <h3 className="text-sm font-bold text-slate-600">Đã Cấu Hình Banner</h3>
                            </div>
                            <div className="p-4 flex flex-wrap gap-2">
                                {Object.entries(config.categoryBanners).map(([slug, setting]) => {
                                    if (!setting || setting.banners.length === 0) return null;
                                    const name = slug === "_default" ? "Mặc Định" : slug;
                                    return (
                                        <button key={slug} onClick={() => setSelectedCatSlug(slug)}
                                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedCatSlug === slug ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-400"} ${!setting.enabled ? "opacity-50" : ""}`}>
                                            {setting.enabled ? "✅" : "🔴"} {name} ({setting.banners.length})
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
