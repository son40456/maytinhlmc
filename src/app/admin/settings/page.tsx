"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { getSiteSettings, saveSiteSettings, SiteSettings } from "@/app/actions/configActions";
import { Save, Upload, Loader2, Image as ImageIcon } from "lucide-react";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SiteSettings>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        getSiteSettings().then((data) => {
            setSettings(data);
            setLoading(false);
        });
    }, []);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'favicon') => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        setMessage(null);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData,
            });

            const data = await res.json();

            if (res.ok && data.url) {
                setSettings(prev => ({ ...prev, [field]: data.url }));
                setMessage({ type: 'success', text: 'Tải ảnh thành công!' });
            } else {
                setMessage({ type: 'error', text: data.error || 'Upload thất bại.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi tải ảnh.' });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage(null);

        try {
            const result = await saveSiteSettings(settings);
            if (result.success) {
                setMessage({ type: 'success', text: 'Lưu cấu hình thành công!' });
            } else {
                setMessage({ type: 'error', text: 'Lỗi khi lưu cấu hình.' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Lỗi khi lưu cấu hình.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="font-medium animate-pulse">Đang tải cấu hình...</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt Website</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý logo, favicon và thông tin trang web.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm flex items-center gap-2 rounded-xl transition-all">
                    <Save className="w-4 h-4" />
                    {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </Button>
            </div>

            {message && (
                <div className={`p-4 mb-4 rounded-lg font-medium ${message.type === 'success' ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                    {message.text}
                </div>
            )}

            {/* Logo Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" />
                    Logo Website
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Logo Header</label>
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={settings.logo || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, logo: e.target.value }))}
                                    placeholder="https://... hoặc /logo.png"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Tải Ảnh
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploading} />
                            </label>
                        </div>
                        {settings.logo && (
                            <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                                <img src={settings.logo} alt="Logo Preview" className="h-12 object-contain" />
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">Logo sẽ hiển thị ở Header và Footer của website.</p>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Favicon</label>
                        <div className="flex gap-3 items-start">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={settings.favicon || ''}
                                    onChange={(e) => setSettings(prev => ({ ...prev, favicon: e.target.value }))}
                                    placeholder="https://... hoặc /favicon.ico"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <label className={`cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium border border-slate-300 flex items-center gap-2 transition-colors ${uploading ? 'opacity-50 cursor-wait' : ''}`}>
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                                Tải Ảnh
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'favicon')} disabled={uploading} />
                            </label>
                        </div>
                        {settings.favicon && (
                            <div className="mt-3 p-4 bg-slate-50 rounded-lg border border-slate-200 inline-block">
                                <p className="text-xs text-slate-500 mb-2">Preview:</p>
                                <img src={settings.favicon} alt="Favicon Preview" className="w-8 h-8 object-contain" />
                            </div>
                        )}
                        <p className="text-xs text-slate-500 mt-2">Icon hiển thị trên tab trình duyệt (khuyến nghích: 32x32 hoặc 512x512px).</p>
                    </div>
                </div>
            </div>

            {/* Contact Info Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-bold text-slate-800 mb-4">Thông tin liên hệ</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Tên website</label>
                        <input
                            type="text"
                            value={settings.siteName || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                            placeholder="LMC - Máy Tính Latop"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email liên hệ</label>
                        <input
                            type="email"
                            value={settings.contactEmail || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, contactEmail: e.target.value }))}
                            placeholder="contact@lmc.vn"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                        <input
                            type="tel"
                            value={settings.contactPhone || ''}
                            onChange={(e) => setSettings(prev => ({ ...prev, contactPhone: e.target.value }))}
                            placeholder="1900 xxxx"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
