"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { fetchAdminCategories } from "@/app/actions/adminActions";

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

interface Category {
    name: string;
    slug: string;
}

export default function AdminHomepage() {
    const [sections, setSections] = useState<SectionConfig[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
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
            const res = await fetch("/api/admin/homepage", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(sections)
            });
            if (res.ok) {
                setSuccess("Lưu cấu hình thành công!");
            } else {
                setError("Lưu cấu hình thất bại.");
            }
        } catch (err) {
            setError("Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    };

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

    if (loading) return <div>Đang tải...</div>;

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản lý Trang chủ</h1>
                    <p className="text-sm text-gray-500 mt-1">Sắp xếp Khối danh mục, sửa tên tiêu đề và thêm nút lọc phụ</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 text-white min-w-[120px]">
                    {saving ? "Đang lưu..." : "Lưu cấu hình"}
                </Button>
            </div>

            {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg font-medium">{error}</div>}
            {success && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg font-medium">{success}</div>}

            <div className="space-y-6">
                {sections.map((section, index) => (
                    <div key={section.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">{index + 1}</span>
                                Khối Sản Phẩm
                            </h2>
                            <div className="flex gap-2">
                                <button onClick={() => moveSection(index, 'up')} disabled={index === 0} className="p-1 px-3 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold">↑ Lên</button>
                                <button onClick={() => moveSection(index, 'down')} disabled={index === sections.length - 1} className="p-1 px-3 border border-gray-200 rounded text-gray-600 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold">↓ Xuống</button>
                                <button onClick={() => removeSection(index)} className="p-1 px-3 bg-red-50 text-red-600 rounded hover:bg-red-100 uppercase text-xs font-bold transition-all">Xoá</button>
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

                        <div className="border-t border-gray-100 pt-4 mt-4 bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-center mb-3">
                                <label className="block text-sm font-semibold text-gray-700">Sub-Filters (Các nút lọc góc phải header)</label>
                                <button onClick={() => addSubFilter(index)} className="text-xs text-blue-600 font-bold hover:underline px-2 py-1 bg-blue-50 rounded">
                                    + Thêm Lọc phụ
                                </button>
                            </div>

                            <div className="space-y-3">
                                {section.subFilters.map((sub, sIdx) => (
                                    <div key={sIdx} className="flex gap-2 items-center bg-white p-2 border border-gray-200 rounded">
                                        <input
                                            type="text"
                                            placeholder="Tên nút (VD: PC HACOM)"
                                            value={sub.name}
                                            onChange={(e) => updateSubFilter(index, sIdx, 'name', e.target.value)}
                                            className="flex-1 border border-transparent hover:border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 font-medium bg-gray-50 focus:bg-white transition-all"
                                        />
                                        <input
                                            type="text"
                                            list="category-slugs"
                                            placeholder="Nối slug đuôi (VD: pc-hacom)"
                                            value={sub.slug}
                                            onChange={(e) => updateSubFilter(index, sIdx, 'slug', e.target.value)}
                                            className="flex-1 border border-transparent hover:border-gray-200 rounded px-2 py-1.5 text-sm outline-none focus:border-blue-500 bg-gray-50 focus:bg-white transition-all"
                                        />
                                        <button onClick={() => removeSubFilter(index, sIdx)} className="text-red-400 hover:text-red-600 font-bold px-3 py-1 bg-red-50 hover:bg-red-100 rounded transition-all">&times;</button>
                                    </div>
                                ))}
                                {section.subFilters.length === 0 && <p className="text-xs text-gray-500 italic pb-2">Chưa có sub-filter nào. Hệ thống sẽ bỏ qua phần Header phụ nếu trống.</p>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button onClick={addSection} className="mt-8 w-full py-4 border-2 border-dashed border-gray-300 bg-gray-50 rounded-xl text-gray-500 font-bold text-lg hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all shadow-sm block text-center">
                + Thêm Khối Sản Phẩm Mới
            </button>

            <datalist id="category-slugs">
                {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
            </datalist>
        </div>
    );
}
