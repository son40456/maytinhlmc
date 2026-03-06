"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Save, Plus, Trash2, MoveUp, MoveDown, ChevronDown, ChevronRight,
    GripVertical, X, Loader2, Menu, ExternalLink, LayoutGrid, List
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MenuItem {
    id: string;
    label: string;
    path: string;
}

interface MenuTopItem {
    id: string;
    label: string;
    path: string;
    icon: string;
    cssClasses: string[];
    image: string;
    children: MenuItem[] | null;
    columns: MenuItem[][] | null;
}

// ── Icon picker options ────────────────────────────────────────────────────────
const ICON_OPTIONS = [
    "MonitorPlay", "Layout", "Cpu", "HardDrive", "Monitor",
    "Fan", "MousePointer2", "Headphones", "Package", "Tag",
    "Star", "Zap", "Globe", "Settings", "Box"
];

// ── Helper ─────────────────────────────────────────────────────────────────────
const uid = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── Sub-item row ───────────────────────────────────────────────────────────────
function SubItemRow({ item, onChange, onDelete }: {
    item: MenuItem;
    onChange: (f: keyof MenuItem, v: string) => void;
    onDelete: () => void;
}) {
    return (
        <div className="flex gap-2 items-center bg-white border border-slate-200 rounded-lg px-3 py-2 group/row hover:border-blue-200 transition-colors">
            <GripVertical className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <input
                value={item.label}
                onChange={e => onChange("label", e.target.value)}
                placeholder="Tên hiển thị"
                className="flex-1 text-sm outline-none bg-transparent font-medium text-slate-700 placeholder-slate-400"
            />
            <input
                value={item.path}
                onChange={e => onChange("path", e.target.value)}
                placeholder="/slug hoặc /slug?pa_...=value"
                className="flex-1 text-xs outline-none bg-transparent text-slate-500 font-mono placeholder-slate-300"
            />
            {item.path && (
                <a href={item.path} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                    <ExternalLink className="w-3.5 h-3.5" />
                </a>
            )}
            <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover/row:opacity-100">
                <X className="w-3.5 h-3.5" />
            </button>
        </div>
    );
}

// ── Column editor ──────────────────────────────────────────────────────────────
function ColumnEditor({ columns, onChange }: {
    columns: MenuItem[][];
    onChange: (cols: MenuItem[][]) => void;
}) {
    const addCol = () => onChange([...columns, []]);
    const removeCol = (ci: number) => onChange(columns.filter((_, i) => i !== ci));

    const addItem = (ci: number) => {
        const c = columns.map((col, i) => i === ci ? [...col, { id: uid(), label: "", path: "" }] : col);
        onChange(c);
    };

    const updateItem = (ci: number, ii: number, field: keyof MenuItem, val: string) => {
        const c = columns.map((col, i) => i === ci
            ? col.map((item, j) => j === ii ? { ...item, [field]: val } : item)
            : col
        );
        onChange(c);
    };

    const deleteItem = (ci: number, ii: number) => {
        const c = columns.map((col, i) => i === ci ? col.filter((_, j) => j !== ii) : col);
        onChange(c);
    };

    return (
        <div className="space-y-4">
            <div className="flex gap-3 overflow-x-auto pb-2">
                {columns.map((col, ci) => (
                    <div key={ci} className="min-w-[220px] flex-1 border border-slate-200 rounded-xl bg-slate-50 p-3">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cột {ci + 1}</span>
                            <button onClick={() => removeCol(ci)} className="text-slate-300 hover:text-red-500 transition-colors">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </div>
                        <div className="space-y-1.5">
                            {col.map((item, ii) => (
                                <SubItemRow
                                    key={item.id || ii}
                                    item={item}
                                    onChange={(f, v) => updateItem(ci, ii, f, v)}
                                    onDelete={() => deleteItem(ci, ii)}
                                />
                            ))}
                        </div>
                        <button
                            onClick={() => addItem(ci)}
                            className="mt-2 w-full text-xs text-blue-600 hover:text-blue-800 py-1.5 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 font-semibold"
                        >
                            <Plus className="w-3 h-3" /> Thêm link
                        </button>
                    </div>
                ))}
                <button
                    onClick={addCol}
                    className="min-w-[120px] border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex flex-col items-center justify-center gap-1 py-6 text-xs font-bold"
                >
                    <Plus className="w-4 h-4" /> Thêm cột
                </button>
            </div>
        </div>
    );
}

// ── Children (simple list) editor ──────────────────────────────────────────────
function ChildrenEditor({ children, onChange }: {
    children: MenuItem[];
    onChange: (items: MenuItem[]) => void;
}) {
    const add = () => onChange([...children, { id: uid(), label: "", path: "" }]);
    const update = (i: number, f: keyof MenuItem, v: string) => {
        onChange(children.map((item, idx) => idx === i ? { ...item, [f]: v } : item));
    };
    const remove = (i: number) => onChange(children.filter((_, idx) => idx !== i));

    return (
        <div className="space-y-1.5">
            {children.map((item, i) => (
                <SubItemRow key={item.id || i} item={item} onChange={(f, v) => update(i, f, v)} onDelete={() => remove(i)} />
            ))}
            <button onClick={add} className="w-full text-xs text-blue-600 py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 font-semibold">
                <Plus className="w-3 h-3" /> Thêm mục con
            </button>
        </div>
    );
}

// ── Top-level menu item card ───────────────────────────────────────────────────
function MenuItemCard({ item, index, total, onChange, onMove, onDelete }: {
    item: MenuTopItem;
    index: number;
    total: number;
    onChange: (updated: MenuTopItem) => void;
    onMove: (dir: "up" | "down") => void;
    onDelete: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const mode = item.columns ? "columns" : "children";

    const setMode = (m: "columns" | "children") => {
        onChange({
            ...item,
            columns: m === "columns" ? (item.columns ?? []) : null,
            children: m === "children" ? (item.children ?? []) : null,
        });
    };

    return (
        <div className={`bg-white border rounded-2xl shadow-sm transition-all ${expanded ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
            {/* Header row */}
            <div className="flex items-center gap-3 px-4 py-3">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Icon picker */}
                <select
                    value={item.icon}
                    onChange={e => onChange({ ...item, icon: e.target.value })}
                    className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-blue-400 font-mono shrink-0 w-32"
                >
                    {ICON_OPTIONS.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>

                {/* Label */}
                <input
                    value={item.label}
                    onChange={e => onChange({ ...item, label: e.target.value })}
                    placeholder="Tên mục"
                    className="flex-1 font-bold text-sm outline-none bg-transparent text-slate-900 placeholder-slate-400 min-w-0"
                />

                {/* Path */}
                <input
                    value={item.path}
                    onChange={e => onChange({ ...item, path: e.target.value })}
                    placeholder="/slug hoặc URL"
                    className="flex-1 text-xs outline-none bg-transparent font-mono text-slate-500 placeholder-slate-300 min-w-0"
                />

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                    <button onClick={() => onMove("up")} disabled={index === 0} className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 flex items-center justify-center transition-all">
                        <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onMove("down")} disabled={index === total - 1} className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 flex items-center justify-center transition-all">
                        <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete} className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setExpanded(e => !e)} className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all">
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Expanded content */}
            {expanded && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                    {/* Image URL */}
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Ảnh nền Mega Menu (URL)</label>
                        <input
                            value={item.image}
                            onChange={e => onChange({ ...item, image: e.target.value })}
                            placeholder="https://..."
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 font-mono text-slate-600 bg-slate-50"
                        />
                    </div>

                    {/* Mode toggle */}
                    <div className="flex gap-2 items-center">
                        <span className="text-xs font-semibold text-slate-500">Kiểu menu con:</span>
                        <button
                            onClick={() => setMode("children")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${mode === "children" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                        >
                            <List className="w-3 h-3" /> Danh sách đơn
                        </button>
                        <button
                            onClick={() => setMode("columns")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${mode === "columns" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}
                        >
                            <LayoutGrid className="w-3 h-3" /> Nhiều cột (Mega Menu)
                        </button>
                        <button
                            onClick={() => onChange({ ...item, children: null, columns: null })}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${!item.children && !item.columns ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}
                        >
                            Không có sub-menu
                        </button>
                    </div>

                    {/* Sub-items editor */}
                    {mode === "children" && item.children !== null && (
                        <ChildrenEditor
                            children={item.children}
                            onChange={c => onChange({ ...item, children: c })}
                        />
                    )}
                    {mode === "columns" && item.columns !== null && (
                        <ColumnEditor
                            columns={item.columns}
                            onChange={cols => onChange({ ...item, columns: cols })}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Admin Page ────────────────────────────────────────────────────────────
export default function MenuAdminPage() {
    const [items, setItems] = useState<MenuTopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        fetch("/api/admin/menu")
            .then(r => r.json())
            .then(data => { setItems(data); setLoading(false); })
            .catch(() => setLoading(false));
    }, []);

    const flash = (type: "success" | "error", msg: string) => {
        setStatus({ type, msg });
        setTimeout(() => setStatus(null), 3000);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/menu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(items),
            });
            if (res.ok) flash("success", "Đã lưu cấu hình Mega Menu thành công! ✅");
            else flash("error", "Lỗi khi lưu dữ liệu.");
        } catch {
            flash("error", "Có lỗi xảy ra khi lưu.");
        } finally {
            setSaving(false);
        }
    };

    const updateItem = useCallback((index: number, updated: MenuTopItem) => {
        setItems(prev => prev.map((it, i) => i === index ? updated : it));
    }, []);

    const moveItem = useCallback((index: number, dir: "up" | "down") => {
        setItems(prev => {
            const arr = [...prev];
            const target = dir === "up" ? index - 1 : index + 1;
            [arr[index], arr[target]] = [arr[target], arr[index]];
            return arr;
        });
    }, []);

    const deleteItem = useCallback((index: number) => {
        setItems(prev => prev.filter((_, i) => i !== index));
    }, []);

    const addItem = () => {
        setItems(prev => [...prev, {
            id: uid(),
            label: "Mục mới",
            path: "/",
            icon: "Package",
            cssClasses: [],
            image: "",
            children: [],
            columns: null,
        }]);
    };

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải cấu hình menu...
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Menu className="w-6 h-6 text-blue-600" />
                        Quản lý Mega Menu
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Thêm, sửa, xoá các mục menu và cấu hình icon, đường dẫn, sub-menu.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all min-w-[140px] justify-center"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
            </div>

            {status && (
                <div className={`mb-4 p-4 rounded-xl font-medium text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {status.msg}
                </div>
            )}

            {/* Instructions */}
            <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <strong>Hướng dẫn:</strong> Click vào nút ▶ ở cuối mỗi dòng để mở rộng và chỉnh sửa menu con. Sau khi chỉnh xong, nhấn <strong>Lưu Thay Đổi</strong> để áp dụng lên website.
            </div>

            {/* List */}
            <div className="space-y-3">
                {items.map((item, i) => (
                    <MenuItemCard
                        key={item.id}
                        item={item}
                        index={i}
                        total={items.length}
                        onChange={updated => updateItem(i, updated)}
                        onMove={dir => moveItem(i, dir)}
                        onDelete={() => deleteItem(i)}
                    />
                ))}
            </div>

            {/* Add new */}
            <button
                onClick={addItem}
                className="mt-6 w-full py-5 border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
                <Plus className="w-5 h-5" /> Thêm Mục Menu Mới
            </button>
        </div>
    );
}
