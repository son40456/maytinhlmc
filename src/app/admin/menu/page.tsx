"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Save, Plus, Trash2, MoveUp, MoveDown, ChevronDown, ChevronRight,
    GripVertical, X, Loader2, Menu, ExternalLink, LayoutGrid, List,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────────
interface MenuItem { id: string; label: string; path: string; }
interface MenuColumn { heading: string; items: MenuItem[]; }
interface MenuTopItem {
    id: string; label: string; path: string; icon: string;
    cssClasses: string[]; image: string;
    children: MenuItem[] | null;
    columns: MenuColumn[] | null;
}

const uid = () => `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ── Migrate old format (MenuItem[][]) → new ({heading, items}[]) ──────────────
function migrateColumns(raw: any): MenuColumn[] | null {
    if (!raw) return null;
    if (!Array.isArray(raw)) return null;
    if (raw.length === 0) return [];
    const first = raw[0];
    // New format: first element has .heading or .items
    if (first && (typeof first.heading !== 'undefined' || typeof first.items !== 'undefined')) {
        return raw.map((c: any) => ({
            heading: c.heading ?? '',
            items: Array.isArray(c.items) ? c.items : [],
        }));
    }
    // Old format: first element is a MenuItem (has .label, .path)
    if (first && typeof first.label === 'string') {
        // old flat children format – wrap into single column
        return [{ heading: '', items: raw }];
    }
    // Old format: array of arrays
    return raw.map((col: any[]) => ({
        heading: '',
        items: Array.isArray(col) ? col : [],
    }));
}

function migrateItem(raw: any): MenuTopItem {
    return {
        ...raw,
        icon: raw.icon || 'Package',
        children: Array.isArray(raw.children) ? raw.children : null,
        columns: migrateColumns(raw.columns),
    };
}

// ── Sub-item row ───────────────────────────────────────────────────────────────
function SubItemRow({ item, onChange, onDelete }: {
    item: MenuItem; onChange: (f: keyof MenuItem, v: string) => void; onDelete: () => void;
}) {
    return (
        <div className="flex gap-2 items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 group/row hover:border-blue-200 transition-colors">
            <GripVertical className="w-3 h-3 text-slate-300 shrink-0" />
            <input value={item.label} onChange={e => onChange("label", e.target.value)}
                placeholder="Tên hiển thị"
                className="flex-1 text-sm outline-none bg-transparent font-medium text-slate-700 placeholder-slate-400 min-w-0" />
            <input value={item.path} onChange={e => onChange("path", e.target.value)}
                placeholder="/slug hoặc /slug?pa_...=value"
                className="flex-1 text-xs outline-none bg-transparent text-slate-500 font-mono placeholder-slate-300 min-w-0" />
            {item.path && (
                <a href={item.path} target="_blank" rel="noreferrer" className="text-slate-300 hover:text-blue-500 transition-colors shrink-0">
                    <ExternalLink className="w-3 h-3" />
                </a>
            )}
            <button onClick={onDelete} className="text-slate-200 hover:text-red-500 transition-colors shrink-0 opacity-0 group-hover/row:opacity-100">
                <X className="w-3 h-3" />
            </button>
        </div>
    );
}

// ── Column editor (with heading) ───────────────────────────────────────────────
function ColumnEditor({ columns, onChange }: { columns: MenuColumn[]; onChange: (c: MenuColumn[]) => void; }) {
    const addCol = () => onChange([...columns, { heading: "", items: [] }]);
    const removeCol = (ci: number) => onChange(columns.filter((_, i) => i !== ci));
    const updateHeading = (ci: number, val: string) =>
        onChange(columns.map((c, i) => i === ci ? { ...c, heading: val } : c));
    const addItem = (ci: number) =>
        onChange(columns.map((c, i) => i === ci ? { ...c, items: [...(c.items || []), { id: uid(), label: "", path: "" }] } : c));
    const updateItem = (ci: number, ii: number, f: keyof MenuItem, v: string) =>
        onChange(columns.map((c, i) => i === ci ? { ...c, items: (c.items || []).map((it, j) => j === ii ? { ...it, [f]: v } : it) } : c));
    const deleteItem = (ci: number, ii: number) =>
        onChange(columns.map((c, i) => i === ci ? { ...c, items: (c.items || []).filter((_, j) => j !== ii) } : c));

    return (
        <div className="flex gap-3 overflow-x-auto pb-2">
            {columns.map((col, ci) => (
                <div key={ci} className="min-w-[220px] w-52 flex-shrink-0 border border-slate-200 rounded-xl bg-slate-50 p-3">
                    <div className="flex gap-2 items-center mb-2">
                        <input value={col.heading || ''} onChange={e => updateHeading(ci, e.target.value)}
                            placeholder="Tiêu đề cột (VD: THƯƠNG HIỆU)"
                            className="flex-1 text-xs font-bold uppercase tracking-wide outline-none bg-white border border-orange-200 rounded px-2 py-1 focus:border-orange-400 text-orange-700 placeholder-slate-400 min-w-0" />
                        <button onClick={() => removeCol(ci)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {(col.items || []).map((item, ii) => (
                            <SubItemRow key={item.id || ii} item={item}
                                onChange={(f, v) => updateItem(ci, ii, f, v)}
                                onDelete={() => deleteItem(ci, ii)} />
                        ))}
                    </div>
                    <button onClick={() => addItem(ci)}
                        className="mt-1.5 w-full text-xs text-blue-600 hover:text-blue-800 py-1.5 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 font-semibold">
                        <Plus className="w-3 h-3" /> Thêm link
                    </button>
                </div>
            ))}
            <button onClick={addCol}
                className="min-w-[100px] border-2 border-dashed border-slate-300 rounded-xl text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors flex flex-col items-center justify-center gap-1 py-4 text-xs font-bold shrink-0">
                <Plus className="w-4 h-4" /> Thêm cột
            </button>
        </div>
    );
}

// ── Children editor ────────────────────────────────────────────────────────────
function ChildrenEditor({ children, onChange }: { children: MenuItem[]; onChange: (i: MenuItem[]) => void; }) {
    const add = () => onChange([...children, { id: uid(), label: "", path: "" }]);
    const update = (i: number, f: keyof MenuItem, v: string) =>
        onChange(children.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
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

// ── Icon Input (custom text/emoji or preset) ───────────────────────────────────
const ICON_PRESETS = [
    { key: "MonitorPlay", emoji: "🖥️" },
    { key: "Cpu", emoji: "💻" },
    { key: "HardDrive", emoji: "💾" },
    { key: "Monitor", emoji: "🖥" },
    { key: "Fan", emoji: "🌀" },
    { key: "MousePointer2", emoji: "🖱️" },
    { key: "Headphones", emoji: "🎧" },
    { key: "Layout", emoji: "⬛" },
    { key: "Package", emoji: "📦" },
];

function IconInput({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
    const [showPicker, setShowPicker] = useState(false);
    const COMMON_EMOJIS = ["🖥️", "💻", "💾", "🖥", "🌀", "🖱️", "🎧", "📦", "⚡", "🔧", "🔌", "📺", "🎮", "🔴", "⚙️", "🖨️", "📡", "🧠", "💿", "🔋"];
    return (
        <div className="relative shrink-0">
            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50 focus-within:border-blue-400 overflow-hidden">
                <input
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    placeholder="Icon / Emoji"
                    className="w-28 text-sm outline-none bg-transparent px-2.5 py-1.5 font-medium text-slate-700 placeholder-slate-400"
                />
                <button type="button" onClick={() => setShowPicker(o => !o)}
                    className="px-2 py-1.5 text-slate-400 hover:text-blue-500 border-l border-slate-200 bg-white transition-colors text-xs font-bold">
                    {showPicker ? '▲' : '▼'}
                </button>
            </div>
            {showPicker && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-3 w-[280px]">
                    <p className="text-xs text-slate-400 mb-2 font-medium">Chọn nhanh hoặc gõ emoji/text bất kỳ vào ô trên</p>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                        {COMMON_EMOJIS.map(em => (
                            <button key={em} type="button"
                                onClick={() => { onChange(em); setShowPicker(false); }}
                                className={`w-9 h-9 flex items-center justify-center text-xl rounded-lg border transition-all ${value === em ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-blue-300 hover:bg-slate-50"}`}>
                                {em}
                            </button>
                        ))}
                    </div>
                    <p className="text-xs text-slate-400 font-medium mb-1">Icon tên (để dùng với icon Lucide):</p>
                    <div className="flex flex-wrap gap-1.5">
                        {ICON_PRESETS.map(({ key, emoji }) => (
                            <button key={key} type="button"
                                onClick={() => { onChange(key); setShowPicker(false); }}
                                className={`flex items-center gap-1 px-2 py-1 text-xs rounded-lg border font-mono transition-all ${value === key ? "border-blue-400 bg-blue-50 text-blue-600" : "border-slate-200 hover:border-slate-300 text-slate-600"}`}>
                                {emoji} {key}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Top-level menu item card ───────────────────────────────────────────────────
function MenuItemCard({ item, index, total, onChange, onMove, onDelete }: {
    item: MenuTopItem; index: number; total: number;
    onChange: (u: MenuTopItem) => void; onMove: (d: "up" | "down") => void; onDelete: () => void;
}) {
    const [expanded, setExpanded] = useState(false);
    const mode = item.columns ? "columns" : (item.children !== null ? "children" : "none");

    const setMode = (m: "columns" | "children" | "none") => onChange({
        ...item,
        columns: m === "columns" ? (item.columns ?? []) : null,
        children: m === "children" ? (item.children ?? []) : null,
    });

    return (
        <div className={`bg-white border rounded-2xl shadow-sm transition-all ${expanded ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
            <div className="flex items-center gap-2.5 px-4 py-3 flex-wrap sm:flex-nowrap">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Icon input – custom text or emoji */}
                <IconInput value={item.icon} onChange={v => onChange({ ...item, icon: v })} />

                {/* Label */}
                <input value={item.label} onChange={e => onChange({ ...item, label: e.target.value })}
                    placeholder="Tên mục"
                    className="w-28 font-bold text-sm outline-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-900 placeholder-slate-400 focus:border-blue-400 shrink-0" />

                {/* Path */}
                <input value={item.path} onChange={e => onChange({ ...item, path: e.target.value })}
                    placeholder="/slug hoặc URL đầy đủ"
                    className="flex-1 text-xs outline-none bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-slate-500 placeholder-slate-300 focus:border-blue-400 min-w-0" />

                {/* Actions */}
                <div className="flex gap-1 shrink-0">
                    <button onClick={() => onMove("up")} disabled={index === 0}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 flex items-center justify-center transition-all">
                        <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onMove("down")} disabled={index === total - 1}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 flex items-center justify-center transition-all">
                        <MoveDown className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete}
                        className="w-7 h-7 rounded-lg border border-red-100 bg-red-50 text-red-400 hover:text-red-600 hover:bg-red-100 flex items-center justify-center transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setExpanded(e => !e)}
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-slate-50 text-slate-500 hover:bg-slate-100 flex items-center justify-center transition-all">
                        {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {expanded && (
                <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
                    <div>
                        <label className="text-xs font-semibold text-slate-500 mb-1 block">Ảnh nền Mega Menu (URL)</label>
                        <input value={item.image} onChange={e => onChange({ ...item, image: e.target.value })}
                            placeholder="https://..."
                            className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-blue-400 font-mono text-slate-600 bg-slate-50" />
                    </div>

                    <div className="flex gap-2 items-center flex-wrap">
                        <span className="text-xs font-semibold text-slate-500">Kiểu menu con:</span>
                        <button onClick={() => setMode("children")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${mode === "children" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                            <List className="w-3 h-3" /> Danh sách đơn
                        </button>
                        <button onClick={() => setMode("columns")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${mode === "columns" ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200 hover:border-blue-300"}`}>
                            <LayoutGrid className="w-3 h-3" /> Nhiều cột (Mega Menu)
                        </button>
                        <button onClick={() => setMode("none")}
                            className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${mode === "none" ? "bg-slate-800 text-white border-slate-800" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"}`}>
                            Không có sub-menu
                        </button>
                    </div>

                    {mode === "children" && item.children !== null && (
                        <ChildrenEditor children={item.children} onChange={c => onChange({ ...item, children: c })} />
                    )}
                    {mode === "columns" && item.columns !== null && (
                        <ColumnEditor columns={item.columns} onChange={cols => onChange({ ...item, columns: cols })} />
                    )}
                </div>
            )}
        </div>
    );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function MenuAdminPage() {
    const [items, setItems] = useState<MenuTopItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

    useEffect(() => {
        fetch("/api/admin/menu")
            .then(r => r.json())
            .then(data => {
                // Migrate old format to new on load
                setItems(Array.isArray(data) ? data.map(migrateItem) : []);
                setLoading(false);
            })
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
            if (res.ok) flash("success", "Lưu cấu hình Mega Menu thành công! ✅");
            else flash("error", "Lỗi khi lưu dữ liệu.");
        } catch { flash("error", "Có lỗi xảy ra khi lưu."); }
        finally { setSaving(false); }
    };

    const updateItem = useCallback((i: number, u: MenuTopItem) =>
        setItems(p => p.map((it, idx) => idx === i ? u : it)), []);
    const moveItem = useCallback((i: number, dir: "up" | "down") =>
        setItems(p => { const a = [...p]; const t = dir === "up" ? i - 1 : i + 1;[a[i], a[t]] = [a[t], a[i]]; return a; }), []);
    const deleteItem = useCallback((i: number) =>
        setItems(p => p.filter((_, idx) => idx !== i)), []);
    const addItem = () =>
        setItems(p => [...p, { id: uid(), label: "Mục mới", path: "/", icon: "📦", cssClasses: [], image: "", children: [], columns: null }]);

    if (loading) return (
        <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải cấu hình menu...
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <Menu className="w-6 h-6 text-blue-600" /> Quản lý Mega Menu
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">Thêm, sửa, xoá mục menu, icon, đường dẫn và sub-menu.</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all min-w-[140px] justify-center">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {saving ? "Đang lưu..." : "Lưu Thay Đổi"}
                </button>
            </div>

            {status && (
                <div className={`mb-4 p-4 rounded-xl font-medium text-sm ${status.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {status.msg}
                </div>
            )}

            <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
                <strong>Icon:</strong> Nhập emoji (VD: 🖥️, 💻) hoặc tên icon Lucide (VD: Monitor, Cpu). Bấm ▼ để chọn nhanh. <br />
                <strong>Tiêu đề cột</strong> màu cam sẽ hiển thị to trên Mega Menu. Click ▶ để chỉnh sửa sub-menu.
            </div>

            <div className="space-y-3">
                {items.map((item, i) => (
                    <MenuItemCard key={item.id} item={item} index={i} total={items.length}
                        onChange={u => updateItem(i, u)} onMove={d => moveItem(i, d)} onDelete={() => deleteItem(i)} />
                ))}
            </div>

            <button onClick={addItem}
                className="mt-6 w-full py-5 border-2 border-dashed border-slate-300 bg-slate-50 rounded-2xl text-slate-500 font-bold hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                <Plus className="w-5 h-5" /> Thêm Mục Menu Mới
            </button>
        </div>
    );
}
