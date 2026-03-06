"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { fetchAdminCategories } from "@/app/actions/adminActions";
import {
    Save,
    Plus,
    LayoutList,
    MonitorDot,
    GripVertical,
    X,
    MoveUp,
    MoveDown,
    Trash2
} from "lucide-react";


interface ComponentCategory {
    id: string;
    name: string;
    slug: string;
}

interface Category {
    name: string;
    slug: string;
}

export default function AdminPcBuilder() {
    const [pcComponents, setPcComponents] = useState<ComponentCategory[]>([]);
    const [companyInfo, setCompanyInfo] = useState<{
        logo: string;
        name: string;
        contact: string;
        contacts: { icon: string; text: string }[];
        description: string;
    }>({
        logo: "",
        name: "",
        contact: "",
        contacts: [],
        description: ""
    });
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/pcbuilder").then((res) => res.json()),
            fetchAdminCategories()
        ])
            .then(([pcBuilderData, categoriesData]) => {
                // Use the new object structure { components, companyInfo }
                const comps = pcBuilderData?.components || [];
                const pcConfigArray = Array.isArray(comps) ? comps : Object.keys(comps).map(key => ({
                    ...comps[key],
                    id: key // ensure ID is the key
                }));
                setPcComponents(pcConfigArray);

                if (pcBuilderData?.companyInfo) {
                    setCompanyInfo({
                        logo: "", name: "", contact: "", contacts: [], description: "",
                        ...pcBuilderData.companyInfo
                    });
                }

                setCategories(categoriesData.map((c: any) => ({ name: c.name, slug: c.slug })));
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setError("Không thể tải cấu hình.");
                setLoading(false);
            });
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setError("");
        setSuccess("");
        try {
            // Save PC Builder as a full object
            const resPc = await fetch("/api/admin/pcbuilder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    components: pcComponents,
                    companyInfo: companyInfo
                })
            });

            if (resPc.ok) {
                setSuccess("Lưu cấu hình Danh mục Build PC thành công!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Có lỗi khi lưu cấu hình.");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    };


    // --- PC BUILDER LOGIC ---
    const addPcComponent = () => {
        setPcComponents([...pcComponents, {
            id: `comp-${Date.now()}`,
            name: "Linh kiện mới",
            slug: ""
        }]);
    };

    const removePcComponent = (index: number) => {
        const newComps = [...pcComponents];
        newComps.splice(index, 1);
        setPcComponents(newComps);
    };

    const movePcComponent = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === pcComponents.length - 1) return;

        const newComps = [...pcComponents];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newComps[index], newComps[targetIndex]] = [newComps[targetIndex], newComps[index]];
        setPcComponents(newComps);
    };

    const updatePcComponent = (index: number, field: keyof ComponentCategory, value: string) => {
        const newComps = [...pcComponents];
        newComps[index] = { ...newComps[index], [field]: value };
        setPcComponents(newComps);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Đang tải cấu hình hệ thống...</p>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu Hình Danh Mục PC Builder</h1>
                    <p className="text-sm text-slate-500 mt-1">Sắp xếp các dòng linh kiện hiển thị trên công cụ Build PC.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm flex items-center gap-2 rounded-xl transition-all">
                    <Save className="w-4 h-4" />
                    {saving ? "Đang xử lý..." : "Lưu Thay Đổi"}
                </Button>
            </div>

            {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg font-medium">{error}</div>}
            {success && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg font-medium">{success}</div>}

            {/* CONTENT: COMPANY INFO */}
            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300 mb-8">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Thông Tin Công Ty (Báo Giá)</h2>
                        <p className="text-sm text-slate-500">Các thông tin này sẽ được chèn vào góc đầu hoặc cuối của file ảnh / excel xuất ra cho khách hàng.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Tên Công Ty</label>
                            <input
                                type="text"
                                value={companyInfo.name}
                                onChange={(e) => setCompanyInfo({ ...companyInfo, name: e.target.value })}
                                placeholder="VD: LMC Computer"
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-800"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Logo (Đường dẫn ảnh/URL hoặc Upload)</label>
                            <div className="flex gap-2 items-center w-full">
                                <input
                                    type="text"
                                    value={companyInfo.logo}
                                    onChange={(e) => setCompanyInfo({ ...companyInfo, logo: e.target.value })}
                                    placeholder="https://... hoặc tải từ máy tính"
                                    className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-800"
                                />
                                <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors flex shrink-0 items-center justify-center">
                                    <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            if (file.size > 2 * 1024 * 1024) {
                                                alert("Logo không nên vượt quá 2MB. Vui lòng chọn ảnh nhỏ hơn.");
                                                return;
                                            }
                                            const reader = new FileReader();
                                            reader.onloadend = () => setCompanyInfo({ ...companyInfo, logo: reader.result as string });
                                            reader.readAsDataURL(file);
                                        }
                                    }} />
                                    Tải ảnh lên
                                </label>
                            </div>
                        </div>

                        <div className="space-y-3 md:col-span-2">
                            <div className="flex justify-between items-center mb-1">
                                <label className="text-sm font-semibold text-slate-700">Danh Sách Liên Hệ (Hiển thị nhiều dòng kèm Icon)</label>
                                <button
                                    onClick={() => setCompanyInfo({ ...companyInfo, contacts: [...companyInfo.contacts, { icon: "📞", text: "" }] })}
                                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                                >
                                    <Plus className="w-3.5 h-3.5" /> Thêm Liên Hệ
                                </button>
                            </div>

                            {companyInfo.contacts.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">Chưa có thông tin liên hệ. Hãy bấm Thêm Liên Hệ.</p>
                            ) : (
                                <div className="space-y-2">
                                    {companyInfo.contacts.map((c, i) => (
                                        <div key={i} className="flex gap-2 items-center group">
                                            <select
                                                value={c.icon}
                                                onChange={(e) => {
                                                    const newContacts = [...companyInfo.contacts];
                                                    newContacts[i].icon = e.target.value;
                                                    setCompanyInfo({ ...companyInfo, contacts: newContacts });
                                                }}
                                                className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-sm focus:border-blue-500 outline-none w-16 text-center appearance-none cursor-pointer hover:bg-slate-50 transition-colors"
                                            >
                                                <option value="🏢">🏢</option>
                                                <option value="📍">📍</option>
                                                <option value="📞">📞</option>
                                                <option value="✉️">✉️</option>
                                                <option value="🌐">🌐</option>
                                                <option value="💬">💬</option>
                                                <option value="📌">📌</option>
                                            </select>
                                            <input
                                                type="text"
                                                value={c.text}
                                                onChange={(e) => {
                                                    const newContacts = [...companyInfo.contacts];
                                                    newContacts[i].text = e.target.value;
                                                    setCompanyInfo({ ...companyInfo, contacts: newContacts });
                                                }}
                                                placeholder="Nội dung hiển thị..."
                                                className="flex-1 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-800"
                                            />
                                            <button
                                                onClick={() => {
                                                    const newContacts = [...companyInfo.contacts];
                                                    newContacts.splice(i, 1);
                                                    setCompanyInfo({ ...companyInfo, contacts: newContacts });
                                                }}
                                                className="p-2 text-red-500 opacity-50 hover:opacity-100 hover:bg-red-50 rounded-lg transition-all"
                                                title="Xóa dòng này"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-700">Địa Chỉ / Lời Cảm Ơn / Mô Tả Thêm</label>
                            <textarea
                                value={companyInfo.description}
                                onChange={(e) => setCompanyInfo({ ...companyInfo, description: e.target.value })}
                                placeholder="Nhập địa chỉ hoặc lời nhắn cuối báo giá..."
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-sm focus:bg-white focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-medium text-slate-800 resize-y"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT: PC BUILDER */}
            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <div className="mb-6">
                        <h2 className="text-xl font-bold text-slate-800 mb-2">Sắp xếp Danh mục Linh kiện PC</h2>
                        <p className="text-sm text-slate-500">Các danh mục ở đây sẽ hiển thị thứ tự trực tiếp trên trang Cấu hình PC bên phía người dùng.</p>
                    </div>

                    <div className="space-y-2">
                        {/* Headers */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-4 pb-3 border-b border-slate-100 text-xs font-bold text-slate-500 uppercase tracking-wider">
                            <div className="col-span-3">Mã ID HBL <span className="text-slate-400 font-normal lowercase">(duy nhất)</span></div>
                            <div className="col-span-4">Tên hiển thị</div>
                            <div className="col-span-3">Slug gốc <span className="text-slate-400 font-normal lowercase">(gọi API)</span></div>
                            <div className="col-span-2 text-right">Lệnh</div>
                        </div>

                        {/* List */}
                        {pcComponents.map((comp, index) => (
                            <div key={comp.id} className="grid grid-cols-1 mb-3 md:mb-0 md:grid-cols-12 gap-3 items-center bg-slate-50/50 hover:bg-slate-50 p-3 rounded-xl border border-slate-100 transition-colors group">
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        value={comp.id}
                                        onChange={(e) => updatePcComponent(index, 'id', e.target.value)}
                                        placeholder="cpu, mainboard..."
                                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all font-mono"
                                    />
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="text"
                                        value={comp.name}
                                        onChange={(e) => updatePcComponent(index, 'name', e.target.value)}
                                        placeholder="Tên linh kiện..."
                                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        list="category-slugs"
                                        value={comp.slug}
                                        onChange={(e) => updatePcComponent(index, 'slug', e.target.value)}
                                        placeholder="Nhập slug..."
                                        className="w-full bg-white border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>
                                <div className="col-span-2 flex justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => movePcComponent(index, 'up')} disabled={index === 0} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-30 transition-colors shadow-sm" title="Lên"><MoveUp className="w-4 h-4" /></button>
                                    <button onClick={() => movePcComponent(index, 'down')} disabled={index === pcComponents.length - 1} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-600 disabled:opacity-30 transition-colors shadow-sm" title="Xuống"><MoveDown className="w-4 h-4" /></button>
                                    <div className="w-px h-6 bg-slate-200 mx-0.5 my-auto"></div>
                                    <button onClick={() => removePcComponent(index)} className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors shadow-sm" title="Xoá"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button onClick={addPcComponent} className="mt-8 w-full py-4 border-2 border-dashed border-blue-200 bg-blue-50/50 rounded-xl text-blue-600 font-bold hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                        <Plus className="w-5 h-5" /> Thêm Danh mục Linh kiện Mới
                    </button>
                </div>
            </div>

            <datalist id="category-slugs">
                {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
            </datalist>
        </div>
    );
}
