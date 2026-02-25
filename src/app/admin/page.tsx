"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { fetchAdminCategories, fetchPopularBrandsByCategory } from "@/app/actions/adminActions";
import {
    Save,
    Plus,
    LayoutList,
    MonitorDot,
    GripVertical,
    X,
    MoveUp,
    MoveDown,
    Trash2,
    Sparkles,
    Loader2
} from "lucide-react";

interface SubFilter {
    name: string;
    slug: string;
}

interface SectionConfig {
    id: string;
    title: string;
    categorySlug: string;
    subFilters: SubFilter[];
}

interface ComponentCategory {
    id: string;
    name: string;
    slug: string;
}

interface Category {
    name: string;
    slug: string;
}

export default function AdminHomepage() {

    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [autoDetecting, setAutoDetecting] = useState<Record<number, boolean>>({});
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/homepage").then((res) => res.json()),
            fetchAdminCategories()
        ])
            .then(([homepageData, categoriesData]) => {
                setSections(homepageData);
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
            // Save Homepage
            const resHome = await fetch("/api/admin/homepage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sections)
            });

            if (resHome.ok) {
                setSuccess("Lưu cấu hình Trang chủ thành công!");
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError("Có lỗi khi lưu cấu hình Trang chủ.");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    };

    // --- HOMEPAGE LOGIC ---
    const addSection = () => {
        setSections([...sections, {
            id: `section-${Date.now()}`,
            title: "Tiêu đề mới",
            categorySlug: "",
            subFilters: []
        }]);
    };

    const removeSection = (index: number) => {
        const newSections = [...sections];
        newSections.splice(index, 1);
        setSections(newSections);
    };

    const moveSection = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === sections.length - 1) return;

        const newSections = [...sections];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
        setSections(newSections);
    };

    const updateSection = (index: number, field: keyof SectionConfig, value: any) => {
        const newSections = [...sections];
        newSections[index] = { ...newSections[index], [field]: value };
        setSections(newSections);
    };

    const addSubFilter = (sectionIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].subFilters.push({ name: "", slug: "" });
        setSections(newSections);
    };

    const updateSubFilter = (sectionIndex: number, filterIndex: number, field: keyof SubFilter, value: string) => {
        const newSections = [...sections];
        newSections[sectionIndex].subFilters[filterIndex] = {
            ...newSections[sectionIndex].subFilters[filterIndex],
            [field]: value
        };
        setSections(newSections);
    };

    const removeSubFilter = (sectionIndex: number, filterIndex: number) => {
        const newSections = [...sections];
        newSections[sectionIndex].subFilters.splice(filterIndex, 1);
        setSections(newSections);
    };

    const handleAutoDetectFilters = async (sectionIndex: number) => {
        const section = sections[sectionIndex];
        if (!section.categorySlug) {
            setError(`Vui lòng chọn hoặc nhập "Slug Root Menu" cho khối #${sectionIndex + 1} trước khi nhận diện tự động.`);
            return;
        }

        setAutoDetecting(prev => ({ ...prev, [sectionIndex]: true }));
        setError("");

        try {
            const detectedBrands = await fetchPopularBrandsByCategory(section.categorySlug);

            if (detectedBrands && detectedBrands.length > 0) {
                const newSections = [...sections];
                // Thay thế bộ lọc hiện tại bằng dữ liệu mới hoặc nối thêm tùy ý. Ở đây mình thay thế để làm mới hoàn toàn.
                newSections[sectionIndex].subFilters = detectedBrands.map(b => ({
                    name: b.name,
                    slug: b.slug
                }));
                setSections(newSections);
                setSuccess(`Đã tự động trích xuất ${detectedBrands.length} thương hiệu phổ biến nhất cho khối #${sectionIndex + 1}.`);
                setTimeout(() => setSuccess(""), 3000);
            } else {
                setError(`Không tìm thấy thương hiệu/lọc phụ nào phù hợp cho slug "${section.categorySlug}".`);
            }
        } catch (err) {
            setError(`Có lỗi xảy ra khi tự động quét danh mục ${section.categorySlug}.`);
        } finally {
            setAutoDetecting(prev => ({ ...prev, [sectionIndex]: false }));
        }
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
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu Hình Trang Chủ</h1>
                    <p className="text-sm text-slate-500 mt-1">Sắp xếp các khối Sản phẩm hiển thị ngoài Homepage.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm flex items-center gap-2 rounded-xl transition-all">
                    <Save className="w-4 h-4" />
                    {saving ? "Đang xử lý..." : "Lưu Thay Đổi"}
                </Button>
            </div>

            {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg font-medium">{error}</div>}
            {success && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg font-medium">{success}</div>}

            {/* TAB CONTENT: HOMEPAGE */}
            <div className="space-y-6 animate-in slide-in-from-bottom-2 fade-in duration-300">
                {sections.map((section, index) => (
                    <div key={section.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 group hover:border-blue-200 transition-colors">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm border border-blue-100 shadow-sm cursor-grab">
                                    <GripVertical className="w-4 h-4 opacity-50 absolute" />
                                    <span className="relative z-10 bg-blue-50/80 px-1">{index + 1}</span>
                                </div>
                                Khối Sản Phẩm Homepage
                            </h2>
                            <div className="flex gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-30 transition-all bg-white" title="Di chuyển lên"><MoveUp className="w-4 h-4" /></button>
                                <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-2 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-blue-600 disabled:opacity-30 transition-all bg-white" title="Di chuyển xuống"><MoveDown className="w-4 h-4" /></button>
                                <div className="w-px h-8 bg-slate-200 mx-1"></div>
                                <button onClick={() => removeSection(index)} className="p-2 bg-red-50/50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 hover:text-red-700 transition-all" title="Xoá khối này"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề góc trái (VD: PC - CHƠI GAME)</label>
                                <input
                                    type="text"
                                    value={section.title}
                                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Slug Root Menu (chọn hoặc nhập)</label>
                                <input
                                    type="text"
                                    list="category-slugs"
                                    value={section.categorySlug}
                                    onChange={(e) => updateSection(index, 'categorySlug', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-all"
                                />
                            </div>
                        </div>

                        <div className="border-t border-slate-100 pt-5 mt-5 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl">
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800">Cấu hình Lọc phụ (Tab ngang bên phải)</label>
                                    <p className="text-xs text-slate-500 mt-0.5">Để trống nếu không muốn hiển thị tabs chuyển đổi.</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAutoDetectFilters(index)}
                                        disabled={autoDetecting[index]}
                                        className="flex items-center gap-1.5 text-xs text-purple-700 font-bold hover:bg-purple-100 px-3 py-1.5 bg-purple-50 rounded-lg transition-colors border border-purple-200/50 shadow-sm disabled:opacity-50 disabled:cursor-wait"
                                        title="AI sẽ tự động quét data hiện tại của danh mục để lấy ra 5 thương hiệu bán chạy nhất"
                                    >
                                        {autoDetecting[index] ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Tự động nhận diện
                                    </button>
                                    <button onClick={() => addSubFilter(index)} className="flex items-center gap-1.5 text-xs text-blue-700 font-bold hover:bg-blue-100 px-3 py-1.5 bg-blue-50 rounded-lg transition-colors border border-blue-200/50 shadow-sm">
                                        <Plus className="w-3.5 h-3.5" /> Thêm Tab Lọc
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {section.subFilters.map((sub, sIdx) => (
                                    <div key={sIdx} className="flex gap-3 items-center bg-white p-2.5 border border-slate-200 rounded-xl shadow-sm hover:border-blue-200 transition-colors">
                                        <input
                                            type="text"
                                            placeholder="Tên nút (VD: PC LMC)"
                                            value={sub.name}
                                            onChange={(e) => updateSubFilter(index, sIdx, 'name', e.target.value)}
                                            className="flex-1 border border-transparent hover:border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 font-medium bg-slate-50 focus:bg-white transition-all focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <input
                                            type="text"
                                            list="category-slugs"
                                            placeholder="Nối slug đuôi (VD: pc-lmc)"
                                            value={sub.slug}
                                            onChange={(e) => updateSubFilter(index, sIdx, 'slug', e.target.value)}
                                            className="flex-1 border border-transparent hover:border-slate-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 bg-slate-50 focus:bg-white transition-all focus:ring-2 focus:ring-blue-500/20"
                                        />
                                        <button onClick={() => removeSubFilter(index, sIdx)} className="text-red-400 hover:text-red-700 p-2 bg-slate-50 hover:bg-red-50 rounded-lg transition-all" title="Xoá Tab Lọc Này"><X className="w-4 h-4" /></button>
                                    </div>
                                ))}
                                {section.subFilters.length === 0 && <p className="text-xs text-slate-400 italic pb-2 text-center border-2 border-dashed border-slate-200 rounded-xl py-4 bg-white/50">Chưa có sub-filter nào. Hệ thống sẽ bỏ qua phần Header phụ.</p>}
                            </div>
                        </div>
                    </div>
                ))}

                <button onClick={addSection} className="mt-8 w-full py-6 border-2 border-dashed border-slate-300 bg-slate-50/50 rounded-2xl text-slate-500 font-bold text-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50/50 transition-all flex items-center justify-center gap-3">
                    <Plus className="w-6 h-6" /> Thêm Khối Sản Phẩm Mới
                </button>
            </div>
            <datalist id="category-slugs">
                {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
            </datalist>
        </div>
    );
}
