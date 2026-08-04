"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { fetchAdminCategories } from "@/app/actions/adminActions";
import type { PcBuilderTab, PcTemplate } from "@/app/actions/configActions";
import {
    Save,
    Plus,
    X,
    MoveUp,
    MoveDown,
    Trash2,
    ChevronDown,
    ChevronUp,
    LayoutGrid,
    Layers,
    Settings2,
    ImageIcon,
    DollarSign,
    List,
    Cpu,
    Search,
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

const THEME_OPTIONS: { value: PcBuilderTab['theme']; label: string; previewClass: string }[] = [
    { value: 'blue', label: '🔵 Xanh Dương', previewClass: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-300' },
    { value: 'rose', label: '🔴 Đỏ Hồng', previewClass: 'bg-gradient-to-r from-rose-50 to-orange-50 border-rose-300' },
    { value: 'purple', label: '🟣 Tím', previewClass: 'bg-gradient-to-r from-purple-50 to-fuchsia-50 border-purple-300' },
    { value: 'amber', label: '🟡 Vàng', previewClass: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-300' },
    { value: 'green', label: '🟢 Xanh Lá', previewClass: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300' },
    { value: 'cyan', label: '🩵 Cyan', previewClass: 'bg-gradient-to-r from-cyan-50 to-teal-50 border-cyan-300' },
];

const BADGE_COLOR_OPTIONS: { value: PcTemplate['badgeColor']; label: string; cls: string }[] = [
    { value: 'yellow', label: '🟡 Vàng', cls: 'bg-yellow-400 text-yellow-900' },
    { value: 'blue', label: '🔵 Xanh', cls: 'bg-blue-600 text-white' },
    { value: 'green', label: '🟢 Xanh lá', cls: 'bg-green-500 text-white' },
    { value: 'red', label: '🔴 Đỏ', cls: 'bg-red-500 text-white' },
    { value: 'purple', label: '🟣 Tím', cls: 'bg-purple-600 text-white' },
];

// --- Product Search Modal ---
interface ProductSearchResult {
    databaseId: number;
    name: string;
    sku?: string;
    price?: string;
    regularPrice?: string;
    image?: { sourceUrl: string };
}

function ProductSearchModal({
    isOpen,
    onClose,
    onSelect,
    categoryKey,
    categoryName,
}: {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (product: ProductSearchResult, categoryKey: string) => void;
    categoryKey: string;
    categoryName: string;
}) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<ProductSearchResult[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!query.trim()) { setResults([]); return; }
        const timeout = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/admin/search-products?search=${encodeURIComponent(query)}&per_page=10`);
                const data = await res.json();
                setResults(data?.products || []);
            } catch { setResults([]); }
            finally { setLoading(false); }
        }, 400);
        return () => clearTimeout(timeout);
    }, [query]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-5 border-b border-slate-200">
                    <div>
                        <h3 className="font-bold text-slate-900">Tìm sản phẩm</h3>
                        <p className="text-xs text-slate-500 mt-0.5">Gán vào: <span className="font-semibold text-blue-600">{categoryName}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><X className="w-5 h-5" /></button>
                </div>
                <div className="p-4 border-b border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            autoFocus
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Nhập tên sản phẩm..."
                            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                        />
                    </div>
                </div>
                <div className="overflow-y-auto flex-1 p-2">
                    {loading && <p className="text-center text-sm text-slate-400 py-8">Đang tìm...</p>}
                    {!loading && results.length === 0 && query && <p className="text-center text-sm text-slate-400 py-8">Không tìm thấy sản phẩm nào.</p>}
                    {results.map(p => (
                        <button key={p.databaseId} onClick={() => { onSelect(p, categoryKey); onClose(); setQuery(''); setResults([]); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors text-left group">
                            {p.image?.sourceUrl && (
                                <img src={p.image.sourceUrl} alt={p.name} className="w-12 h-12 rounded-lg object-contain bg-slate-100 flex-shrink-0 border border-slate-200" />
                            )}
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-700">{p.name}</p>
                                <p className="text-xs text-slate-400 mt-0.5">ID: {p.databaseId} {p.sku ? `• SKU: ${p.sku}` : ''}</p>
                            </div>
                            <span className="text-xs font-bold text-red-600 whitespace-nowrap">{(p.price || p.regularPrice || '').replace(/&nbsp;/g, ' ')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

// --- Template Editor ---
function TemplateEditor({
    template,
    index,
    pcComponents,
    onUpdate,
    onRemove,
}: {
    template: PcTemplate;
    index: number;
    pcComponents: ComponentCategory[];
    onUpdate: (t: PcTemplate) => void;
    onRemove: () => void;
}) {
    const [expanded, setExpanded] = useState(index === 0);
    const [productSearchOpen, setProductSearchOpen] = useState(false);
    const [searchTargetKey, setSearchTargetKey] = useState('');
    const [searchTargetName, setSearchTargetName] = useState('');

    const update = (field: keyof PcTemplate, value: any) => onUpdate({ ...template, [field]: value });

    const openSearch = (categoryId: string, categoryName: string) => {
        setSearchTargetKey(categoryId);
        setSearchTargetName(categoryName);
        setProductSearchOpen(true);
    };

    const handleProductSelected = (product: ProductSearchResult, categoryKey: string) => {
        const newComponents = { ...template.components, [categoryKey]: product.databaseId };
        onUpdate({ ...template, components: newComponents });
    };

    const badgeColorCls = BADGE_COLOR_OPTIONS.find(b => b.value === template.badgeColor)?.cls || 'bg-yellow-400 text-yellow-900';

    return (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            <div
                className="flex items-center gap-3 p-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                {template.image && (
                    <img src={template.image} alt={template.name} className="w-10 h-10 rounded-lg object-contain bg-slate-100 border border-slate-200 flex-shrink-0" />
                )}
                {!template.image && <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0"><ImageIcon className="w-4 h-4 text-slate-400" /></div>}
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{template.name || 'Cấu hình chưa đặt tên'}</p>
                    <p className="text-xs text-slate-400">{Object.keys(template.components).length} linh kiện • {template.price || 'Chưa có giá'}</p>
                </div>
                {template.badge && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${badgeColorCls}`}>{template.badge}</span>
                )}
                <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0" title="Xoá template này">
                    <Trash2 className="w-4 h-4" />
                </button>
                {expanded ? <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />}
            </div>

            {expanded && (
                <div className="border-t border-slate-100 p-4 space-y-5">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tên cấu hình</label>
                            <input
                                type="text"
                                value={template.name}
                                onChange={e => update('name', e.target.value)}
                                placeholder="VD: LMC Gaming RTX 5070"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> URL Ảnh sản phẩm</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={template.image}
                                    onChange={e => update('image', e.target.value)}
                                    placeholder="https://... (URL ảnh đại diện)"
                                    className="flex-1 bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                                {template.image && <img src={template.image} alt="preview" className="w-10 h-10 rounded-lg object-contain bg-slate-100 border border-slate-200 flex-shrink-0" />}
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> Giá bán</label>
                            <input
                                type="text"
                                value={template.price}
                                onChange={e => update('price', e.target.value)}
                                placeholder="VD: 36.990.000đ"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Giá gốc (gạch ngang)</label>
                            <input
                                type="text"
                                value={template.originalPrice || ''}
                                onChange={e => update('originalPrice', e.target.value)}
                                placeholder="VD: 39.990.000đ (để trống nếu không có)"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Badge (nhãn nổi)</label>
                            <input
                                type="text"
                                value={template.badge || ''}
                                onChange={e => update('badge', e.target.value)}
                                placeholder="VD: BEST SELLER, NEW, TOP CHOICE"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Màu Badge</label>
                            <select
                                value={template.badgeColor || 'yellow'}
                                onChange={e => update('badgeColor', e.target.value as PcTemplate['badgeColor'])}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            >
                                {BADGE_COLOR_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Specs */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><List className="w-3.5 h-3.5" /> Thông số hiển thị (mỗi dòng 1 thông số)</label>
                        <textarea
                            value={template.specs.join('\n')}
                            onChange={e => update('specs', e.target.value.split('\n').filter(s => s.trim()))}
                            placeholder={"Intel Core Ultra 7\nRTX 5070 12GB\n32GB DDR5 6000\nSSD 1TB Gen4"}
                            rows={4}
                            className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 font-mono resize-y"
                        />
                    </div>

                    {/* Component mapping */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" /> Linh kiện (Database ID)</label>
                        <p className="text-xs text-slate-400">Nhập ID sản phẩm tương ứng cho từng loại linh kiện. Bấm 🔍 để tìm sản phẩm.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {pcComponents.map(comp => (
                                <div key={comp.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                                    <span className="text-xs font-mono text-slate-500 w-24 flex-shrink-0 truncate" title={comp.id}>{comp.name.split(' -')[0]}</span>
                                    <input
                                        type="number"
                                        value={template.components[comp.id] || ''}
                                        onChange={e => {
                                            const val = parseInt(e.target.value);
                                            const newComps = { ...template.components };
                                            if (isNaN(val) || e.target.value === '') {
                                                delete newComps[comp.id];
                                            } else {
                                                newComps[comp.id] = val;
                                            }
                                            update('components', newComps);
                                        }}
                                        placeholder="ID..."
                                        className="flex-1 bg-white border border-slate-200 px-2 py-1.5 rounded-md text-sm font-mono focus:border-blue-500 outline-none focus:ring-1 focus:ring-blue-500/20 min-w-0"
                                    />
                                    <button
                                        onClick={() => openSearch(comp.id, comp.name)}
                                        className="p-1.5 rounded-md hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition-colors flex-shrink-0"
                                        title={`Tìm ${comp.name}`}
                                    >
                                        <Search className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <ProductSearchModal
                isOpen={productSearchOpen}
                onClose={() => setProductSearchOpen(false)}
                onSelect={handleProductSelected}
                categoryKey={searchTargetKey}
                categoryName={searchTargetName}
            />
        </div>
    );
}

// --- Tab Editor ---
function TabEditor({
    tab,
    index,
    total,
    pcComponents,
    onUpdate,
    onRemove,
    onMove,
}: {
    tab: PcBuilderTab;
    index: number;
    total: number;
    pcComponents: ComponentCategory[];
    onUpdate: (t: PcBuilderTab) => void;
    onRemove: () => void;
    onMove: (dir: 'up' | 'down') => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const update = (field: keyof PcBuilderTab, value: any) => onUpdate({ ...tab, [field]: value });

    const addTemplate = () => {
        const newTemplate: PcTemplate = {
            id: `tpl-${Date.now()}`,
            name: '',
            image: '',
            badge: '',
            badgeColor: 'yellow',
            price: '',
            originalPrice: '',
            specs: [],
            components: {},
        };
        update('templates', [...tab.templates, newTemplate]);
    };

    const updateTemplate = (i: number, t: PcTemplate) => {
        const newTemplates = [...tab.templates];
        newTemplates[i] = t;
        update('templates', newTemplates);
    };

    const removeTemplate = (i: number) => {
        const newTemplates = tab.templates.filter((_, idx) => idx !== i);
        update('templates', newTemplates);
    };

    const themeInfo = THEME_OPTIONS.find(t => t.value === tab.theme) || THEME_OPTIONS[0];

    return (
        <div className={`border-2 rounded-2xl overflow-hidden transition-all ${expanded ? 'border-blue-300 shadow-md' : 'border-slate-200'}`}>
            {/* Tab Header */}
            <div className={`flex items-center gap-3 p-4 ${expanded ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'} transition-colors`}>
                <button onClick={() => setExpanded(!expanded)} className="flex-1 flex items-center gap-3 text-left">
                    <span className="text-2xl">{tab.icon || '📦'}</span>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900">{tab.name || 'Tab chưa đặt tên'}</p>
                            <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{tab.priceHint}</span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{tab.description} • {tab.templates.length} cấu hình</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${themeInfo.previewClass}`} />
                </button>
                <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => onMove('up')} disabled={index === 0} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors" title="Lên"><MoveUp className="w-3.5 h-3.5" /></button>
                    <button onClick={() => onMove('down')} disabled={index === total - 1} className="p-2 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors" title="Xuống"><MoveDown className="w-3.5 h-3.5" /></button>
                    <button onClick={onRemove} className="p-2 bg-red-50 text-red-500 border border-red-100 rounded-lg hover:bg-red-100 transition-colors" title="Xoá Tab"><Trash2 className="w-3.5 h-3.5" /></button>
                    {expanded ? <ChevronUp className="w-4 h-4 text-blue-500 ml-1" /> : <ChevronDown className="w-4 h-4 text-slate-400 ml-1" />}
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-200 p-5 space-y-6 bg-white">
                    {/* Tab basic info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Tên Tab</label>
                            <input
                                type="text"
                                value={tab.name}
                                onChange={e => update('name', e.target.value)}
                                placeholder="VD: PC Gaming"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm font-semibold focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Icon (Emoji)</label>
                            <input
                                type="text"
                                value={tab.icon}
                                onChange={e => update('icon', e.target.value)}
                                placeholder="🎮"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Nhãn giá (badge)</label>
                            <input
                                type="text"
                                value={tab.priceHint}
                                onChange={e => update('priceHint', e.target.value)}
                                placeholder="VD: Quốc dân, Cơ bản, Render..."
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Mô tả ngắn</label>
                            <input
                                type="text"
                                value={tab.description}
                                onChange={e => update('description', e.target.value)}
                                placeholder="VD: Chiến mượt LOL, FO4, CSGO"
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Màu chủ đề</label>
                            <select
                                value={tab.theme}
                                onChange={e => update('theme', e.target.value as PcBuilderTab['theme'])}
                                className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg text-sm focus:border-blue-500 outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                            >
                                {THEME_OPTIONS.map(o => (
                                    <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Templates */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <LayoutGrid className="w-4 h-4 text-blue-500" />
                                Cấu hình mẫu ({tab.templates.length})
                            </h4>
                            <button
                                onClick={addTemplate}
                                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                            >
                                <Plus className="w-3.5 h-3.5" /> Thêm cấu hình
                            </button>
                        </div>

                        {tab.templates.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center">
                                <LayoutGrid className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                <p className="text-sm text-slate-400">Chưa có cấu hình mẫu nào.</p>
                                <button onClick={addTemplate} className="mt-3 text-sm font-semibold text-blue-600 hover:underline">+ Thêm cấu hình đầu tiên</button>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {tab.templates.map((tpl, i) => (
                                    <TemplateEditor
                                        key={tpl.id}
                                        template={tpl}
                                        index={i}
                                        pcComponents={pcComponents}
                                        onUpdate={t => updateTemplate(i, t)}
                                        onRemove={() => removeTemplate(i)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}


// --- Main Admin Page ---
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
    const [tabs, setTabs] = useState<PcBuilderTab[]>([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [activeSection, setActiveSection] = useState<'components' | 'tabs' | 'company'>('tabs');

    useEffect(() => {
        Promise.all([
            fetch("/api/admin/pcbuilder").then((res) => res.json()),
            fetchAdminCategories()
        ])
            .then(([pcBuilderData, categoriesData]) => {
                const comps = pcBuilderData?.components || [];
                const pcConfigArray = Array.isArray(comps) ? comps : Object.keys(comps).map(key => ({
                    ...comps[key],
                    id: key
                }));
                setPcComponents(pcConfigArray);

                if (pcBuilderData?.companyInfo) {
                    setCompanyInfo({
                        logo: "", name: "", contact: "", contacts: [], description: "",
                        ...pcBuilderData.companyInfo
                    });
                }

                setTabs(pcBuilderData?.tabs || []);
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
            const resPc = await fetch("/api/admin/pcbuilder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    components: pcComponents,
                    companyInfo: companyInfo,
                    tabs: tabs,
                })
            });

            if (resPc.ok) {
                setSuccess("Lưu cấu hình thành công!");
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

    // --- TABS LOGIC ---
    const addTab = () => {
        const newTab: PcBuilderTab = {
            id: `tab-${Date.now()}`,
            name: '',
            icon: '💻',
            priceHint: '',
            description: '',
            theme: 'blue',
            templates: [],
        };
        setTabs([...tabs, newTab]);
    };

    const updateTab = (index: number, tab: PcBuilderTab) => {
        const newTabs = [...tabs];
        newTabs[index] = tab;
        setTabs(newTabs);
    };

    const removeTab = (index: number) => {
        setTabs(tabs.filter((_, i) => i !== index));
    };

    const moveTab = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === tabs.length - 1) return;
        const newTabs = [...tabs];
        const target = direction === 'up' ? index - 1 : index + 1;
        [newTabs[index], newTabs[target]] = [newTabs[target], newTabs[index]];
        setTabs(newTabs);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 text-slate-500 space-y-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="font-medium animate-pulse">Đang tải cấu hình hệ thống...</p>
        </div>
    );

    const sectionBtnCls = (s: typeof activeSection) =>
        `flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeSection === s ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'text-slate-600 hover:bg-slate-100'}`;

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cấu Hình PC Builder</h1>
                    <p className="text-sm text-slate-500 mt-1">Quản lý tabs cấu hình mẫu, danh mục linh kiện & thông tin công ty.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white min-w-[140px] shadow-sm flex items-center gap-2 rounded-xl transition-all">
                    <Save className="w-4 h-4" />
                    {saving ? "Đang xử lý..." : "Lưu Thay Đổi"}
                </Button>
            </div>

            {error && <div className="p-4 mb-4 text-red-700 bg-red-100 rounded-lg font-medium">{error}</div>}
            {success && <div className="p-4 mb-4 text-green-700 bg-green-100 rounded-lg font-medium">{success}</div>}

            {/* Section Navigation */}
            <div className="flex gap-2 mb-6 bg-slate-100 p-1.5 rounded-2xl">
                <button className={sectionBtnCls('tabs')} onClick={() => setActiveSection('tabs')}>
                    <LayoutGrid className="w-4 h-4" /> Tabs Cấu Hình Mẫu
                    {tabs.length > 0 && <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full">{tabs.length}</span>}
                </button>
                <button className={sectionBtnCls('components')} onClick={() => setActiveSection('components')}>
                    <Layers className="w-4 h-4" /> Danh Mục Linh Kiện
                </button>
                <button className={sectionBtnCls('company')} onClick={() => setActiveSection('company')}>
                    <Settings2 className="w-4 h-4" /> Thông Tin Công Ty
                </button>
            </div>

            {/* SECTION: TABS */}
            {activeSection === 'tabs' && (
                <div className="space-y-4 animate-in slide-in-from-bottom-2 fade-in duration-300">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800 mb-1">Tabs Cấu Hình Mẫu</h2>
                                <p className="text-sm text-slate-500">Mỗi tab là một nhóm (Gaming, Văn Phòng, Đồ Họa...) chứa các cấu hình PC mẫu.</p>
                            </div>
                            <button
                                onClick={addTab}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm"
                            >
                                <Plus className="w-4 h-4" /> Thêm Tab
                            </button>
                        </div>

                        {tabs.length === 0 ? (
                            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                                <LayoutGrid className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                <p className="text-slate-500 font-medium">Chưa có tab nào.</p>
                                <p className="text-slate-400 text-sm mt-1">Bấm "Thêm Tab" để tạo nhóm cấu hình mẫu đầu tiên.</p>
                                <button onClick={addTab} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                                    + Thêm Tab đầu tiên
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {tabs.map((tab, i) => (
                                    <TabEditor
                                        key={tab.id}
                                        tab={tab}
                                        index={i}
                                        total={tabs.length}
                                        pcComponents={pcComponents}
                                        onUpdate={t => updateTab(i, t)}
                                        onRemove={() => removeTab(i)}
                                        onMove={dir => moveTab(i, dir)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* SECTION: PC COMPONENTS */}
            {activeSection === 'components' && (
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
            )}

            {/* SECTION: COMPANY INFO */}
            {activeSection === 'company' && (
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
            )}

            <datalist id="category-slugs">
                {categories.map(c => (
                    <option key={c.slug} value={c.slug}>{c.name}</option>
                ))}
            </datalist>
        </div>
    );
}
