"use client";

import { useState, useEffect } from "react";
import { BannerConfig, BannerItem } from "@/app/actions/configActions";
import { Button } from "@/components/ui/Button";
import {
    Save, Plus, GripVertical, X, MoveUp, MoveDown,
    Trash2, Loader2, Image as ImageIcon, Upload
} from "lucide-react";

export default function AdminBannersPage() {
    const [config, setConfig] = useState<BannerConfig>({ mainBanners: [], smallBanners: [] });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingImage, setUploadingImage] = useState<string | null>(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        fetch("/api/admin/banners")
            .then(res => res.json())
            .then(data => {
                setConfig(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError("Không thể tải cấu hình Banner.");
                setLoading(false);
            });
    }, []);

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
        } catch (err) {
            setError("Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    };

    const handleImageUpload = async (type: 'main' | 'small', index: number, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadId = `${type}-${index}`;
        setUploadingImage(uploadId);
        setError("");
        
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();
            if (res.ok && data.url) {
                updateBanner(type, index, 'image', data.url);
                setSuccess('Tải ảnh thành công!');
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(data.error || 'Upload ảnh thất bại.');
            }
        } catch (err) {
            setError('Có lỗi xảy ra khi upload ảnh.');
        } finally {
            setUploadingImage(null);
        }
    };

    const addBanner = (type: 'main' | 'small') => {
        const newBanner: BannerItem = {
            id: `banner-${Date.now()}`,
            image: "",
            link: ""
        };
        if (type === 'main') {
            setConfig({ ...config, mainBanners: [...config.mainBanners, newBanner] });
        } else {
            setConfig({ ...config, smallBanners: [...config.smallBanners, newBanner] });
        }
    };

    const updateBanner = (type: 'main' | 'small', index: number, field: keyof BannerItem, value: string) => {
        const list = type === 'main' ? [...config.mainBanners] : [...config.smallBanners];
        list[index] = { ...list[index], [field]: value };
        
        if (type === 'main') {
            setConfig({ ...config, mainBanners: list });
        } else {
            setConfig({ ...config, smallBanners: list });
        }
    };

    const removeBanner = (type: 'main' | 'small', index: number) => {
        const list = type === 'main' ? [...config.mainBanners] : [...config.smallBanners];
        list.splice(index, 1);
        
        if (type === 'main') {
            setConfig({ ...config, mainBanners: list });
        } else {
            setConfig({ ...config, smallBanners: list });
        }
    };

    const moveBanner = (type: 'main' | 'small', index: number, direction: 'up' | 'down') => {
        const list = type === 'main' ? [...config.mainBanners] : [...config.smallBanners];
        
        if (direction === 'up' && index > 0) {
            [list[index - 1], list[index]] = [list[index], list[index - 1]];
        } else if (direction === 'down' && index < list.length - 1) {
            [list[index], list[index + 1]] = [list[index + 1], list[index]];
        }
        
        if (type === 'main') {
            setConfig({ ...config, mainBanners: list });
        } else {
            setConfig({ ...config, smallBanners: list });
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64 text-slate-500">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    const renderBannerList = (type: 'main' | 'small', title: string, subtitle: string) => {
        const banners = type === 'main' ? config.mainBanners : config.smallBanners;
        
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            {title}
                            {type === 'small' && (
                                <label className="inline-flex items-center cursor-pointer ml-4">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer"
                                        checked={config.showSmallBanners !== false}
                                        onChange={(e) => setConfig({ ...config, showSmallBanners: e.target.checked })}
                                    />
                                    <div className="relative w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                                    <span className="ms-2 text-xs font-medium text-slate-600">Hiển thị trên Web</span>
                                </label>
                            )}
                        </h2>
                        <p className="text-sm text-slate-500">{subtitle}</p>
                    </div>
                    <Button onClick={() => addBanner(type)} size="sm" className="bg-white text-blue-600 hover:bg-blue-50 border border-blue-200">
                        <Plus className="w-4 h-4 mr-2" />
                        Thêm Banner
                    </Button>
                </div>
                
                <div className="p-6 space-y-4">
                    {banners.length === 0 ? (
                        <div className="text-center py-8 text-slate-500 border-2 border-dashed border-slate-200 rounded-xl">
                            Chưa có banner nào. Bấm thêm để tạo mới.
                        </div>
                    ) : (
                        banners.map((banner, index) => {
                            const isUploading = uploadingImage === `${type}-${index}`;
                            return (
                                <div key={banner.id} className="group relative flex gap-4 bg-white border border-slate-200 p-4 rounded-xl hover:border-blue-300 hover:shadow-md transition-all">
                                    {/* Action buttons */}
                                    <div className="absolute right-4 top-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 backdrop-blur rounded-lg shadow-sm border border-slate-100 p-1">
                                        <button onClick={() => moveBanner(type, index, 'up')} disabled={index === 0} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30">
                                            <MoveUp className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => moveBanner(type, index, 'down')} disabled={index === banners.length - 1} className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded disabled:opacity-30">
                                            <MoveDown className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-4 bg-slate-200 mx-1"></div>
                                        <button onClick={() => removeBanner(type, index)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    {/* Image Preview & Upload */}
                                    <div className="w-40 h-24 bg-slate-100 rounded-lg border border-slate-200 flex-shrink-0 relative overflow-hidden flex flex-col items-center justify-center group/img">
                                        {banner.image ? (
                                            <>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={banner.image} alt="Banner" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                                                    <label className="cursor-pointer p-2 bg-white/20 hover:bg-white/40 backdrop-blur rounded-full text-white transition-colors">
                                                        <Upload className="w-5 h-5" />
                                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(type, index, e)} />
                                                    </label>
                                                </div>
                                            </>
                                        ) : (
                                            <label className="cursor-pointer flex flex-col items-center justify-center w-full h-full text-slate-400 hover:text-blue-500 hover:bg-blue-50/50 transition-colors">
                                                <ImageIcon className="w-6 h-6 mb-1" />
                                                <span className="text-xs font-medium">Tải ảnh lên</span>
                                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(type, index, e)} />
                                            </label>
                                        )}
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center">
                                                <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Fields */}
                                    <div className="flex-1 space-y-3 pt-1">
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">URL Hình Ảnh</label>
                                            <input 
                                                value={banner.image} 
                                                onChange={(e) => updateBanner(type, index, 'image', e.target.value)}
                                                placeholder="https://... (Hoặc click ô bên trái để tải ảnh lên)"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Link Chuyển Hướng (URL)</label>
                                            <input 
                                                value={banner.link} 
                                                onChange={(e) => updateBanner(type, index, 'link', e.target.value)}
                                                placeholder="VD: /category/man-hinh hoặc https://google.com"
                                                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-colors font-mono"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-800 tracking-tight">Quản Lý Banner</h1>
                    <p className="text-slate-500 mt-1 text-sm">Thiết lập Banner chính và 4 Banner nhỏ ở trang chủ</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 text-white min-w-[140px]">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                    </Button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl font-medium flex items-center">
                    <X className="w-5 h-5 mr-2 flex-shrink-0" />
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-xl font-medium flex items-center">
                    <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-2 flex-shrink-0">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                    </div>
                    {success}
                </div>
            )}

            {renderBannerList('main', 'Banner Chính (Slider)', 'Khuyên dùng ảnh tỷ lệ ngang (VD: 1920x500). Hiển thị full width trên Desktop.')}
            {renderBannerList('small', 'Banner Nhỏ (Grid 4 ô)', 'Hiển thị ngay dưới Banner chính. Khuyên dùng ảnh vuông hoặc tỷ lệ 4:3 (ẩn trên Mobile).')}
        </div>
    );
}
