"use client";

import { useState, useEffect, useCallback } from "react";
import {
    Save, Plus, Trash2, MoveUp, MoveDown, ChevronDown, ChevronRight,
    GripVertical, X, Loader2, Menu, ExternalLink, LayoutGrid, List,
    Monitor, Cpu, HardDrive, Fan, MousePointer2, Headphones, Package,
    MonitorPlay, Layout as LayoutIcon, Tag, Star, Zap, Globe, Settings, Box
} from "lucide-react";

// ── Icon map ───────────────────────────────────────────────────────────────────
const ICON_MAP: Record<string, React.ReactNode> = {
    "MonitorPlay": <MonitorPlay size={18} />,
    "Layout": <LayoutIcon size={18} />,
    "Cpu": <Cpu size={18} />,
    "HardDrive": <HardDrive size={18} />,
    "Monitor": <Monitor size={18} />,
    "Fan": <Fan size={18} />,
    "MousePointer2": <MousePointer2 size={18} />,
    "Headphones": <Headphones size={18} />,
    "Package": <Package size={18} />,
    "Tag": <Tag size={18} />,
    "Star": <Star size={18} />,
    "Zap": <Zap size={18} />,
    "Globe": <Globe size={18} />,
    "Settings": <Settings size={18} />,
    "Box": <Box size={18} />,
};

const ICON_KEYS = Object.keys(ICON_MAP);

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
    const updateHeading = (ci: number, val: string) => onChange(columns.map((c, i) => i === ci ? { ...c, heading: val } : c));

    const addItem = (ci: number) => onChange(columns.map((c, i) => i === ci ? { ...c, items: [...c.items, { id: uid(), label: "", path: "" }] } : c));
    const updateItem = (ci: number, ii: number, f: keyof MenuItem, v: string) => onChange(columns.map((c, i) => i === ci ? { ...c, items: c.items.map((it, j) => j === ii ? { ...it, [f]: v } : it) } : c));
    const deleteItem = (ci: number, ii: number) => onChange(columns.map((c, i) => i === ci ? { ...c, items: c.items.filter((_, j) => j !== ii) } : c));

    return (
        <div className="flex gap-3 overflow-x-auto pb-2">
            {columns.map((col, ci) => (
                <div key={ci} className="min-w-[220px] w-52 flex-shrink-0 border border-slate-200 rounded-xl bg-slate-50 p-3">
                    <div className="flex gap-2 items-center mb-2">
                        <input value={col.heading} onChange={e => updateHeading(ci, e.target.value)}
                            placeholder="Tiêu đề cột (VD: THƯƠNG HIỆU)"
                            className="flex-1 text-xs font-bold uppercase tracking-wide outline-none bg-white border border-orange-200 rounded px-2 py-1 focus:border-orange-400 text-orange-700 placeholder-slate-400 min-w-0" />
                        <button onClick={() => removeCol(ci)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div className="space-y-1">
                        {col.items.map((item, ii) => (
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
    const update = (i: number, f: keyof MenuItem, v: string) => onChange(children.map((it, idx) => idx === i ? { ...it, [f]: v } : it));
    const remove = (i: number) => onChange(children.filter((_, idx) => idx !== i));
    return (
        <div className="space-y-1.5">
            {children.map((item, i) => (<SubItemRow key={item.id || i} item={item} onChange={(f, v) => update(i, f, v)} onDelete={() => remove(i)} />))}
            <button onClick={add} className="w-full text-xs text-blue-600 py-2 border border-dashed border-blue-200 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-1 font-semibold">
                <Plus className="w-3 h-3" /> Thêm mục con
            </button>
        </div>
    );
}

// ── Icon Picker ────────────────────────────────────────────────────────────────
function IconPicker({ value, onChange }: { value: string; onChange: (v: string) => void; }) {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative shrink-0">
            <button type="button"
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 hover:border-blue-400 text-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-all min-w-[110px]">
                <span className="text-blue-600">{ICON_MAP[value] ?? <Package size={16} />}</span>
                <span className="truncate">{value || "Chọn Icon"}</span>
                <ChevronDown className="w-3 h-3 ml-auto opacity-50" />
            </button>
            {open && (
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-2 grid grid-cols-3 gap-1 w-[220px]">
                    {ICON_KEYS.map(key => (
                        <button key={key} type="button"
                            onClick={() => { onChange(key); setOpen(false); }}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg text-center transition-all text-xs font-medium ${value === key ? "bg-blue-600 text-white" : "hover:bg-slate-100 text-slate-600"}`}>
                            <span className={value === key ? "text-white" : "text-blue-600"}>{ICON_MAP[key]}</span>
                            <span className="truncate w-full">{key}</span>
                        </button>
                    ))}
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
        children: m === "children" ? (item.children ?? []) : (m === "none" ? null : item.children),
    });

    return (
        <div className={`bg-white border rounded-2xl shadow-sm transition-all ${expanded ? "border-blue-300 shadow-md" : "border-slate-200 hover:border-slate-300"}`}>
            <div className="flex items-center gap-2.5 px-4 py-3 flex-wrap sm:flex-nowrap">
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />

                {/* Icon picker */}
                <IconPicker value={item.icon} onChange={v => onChange({ ...item, icon: v })} />

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
                    <button onClick={() => onMove("up")} disabled={index === 0} title="Lên"
                        className="w-7 h-7 rounded-lg border border-slate-200 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-300 disabled:opacity-30 flex items-center justify-center transition-all">
                        <MoveUp className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => onMove("down")} disabled={index === total - 1} title="Xuống"
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
        fetch("/api/admin/menu").then(r => r.json()).then(data => { setItems(data); setLoading(false); }).catch(() => setLoading(false));
    }, []);

    const flash = (type: "success" | "error", msg: string) => { setStatus({ type, msg }); setTimeout(() => setStatus(null), 3000); };

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch("/api/admin/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(items) });
            if (res.ok) flash("success", "Lưu cấu hình Mega Menu thành công! ✅");
            else flash("error", "Lỗi khi lưu dữ liệu.");
        } catch { flash("error", "Có lỗi xảy ra khi lưu."); }
        finally { setSaving(false); }
    };

    const updateItem = useCallback((i: number, u: MenuTopItem) => setItems(p => p.map((it, idx) => idx === i ? u : it)), []);
    const moveItem = useCallback((i: number, dir: "up" | "down") => setItems(p => { const a = [...p]; const t = dir === "up" ? i - 1 : i + 1;[a[i], a[t]] = [a[t], a[i]]; return a; }), []);
    const deleteItem = useCallback((i: number) => setItems(p => p.filter((_, idx) => idx !== i)), []);

    const addItem = () => setItems(p => [...p, { id: uid(), label: "Mục mới", path: "/", icon: "Package", cssClasses: [], image: "", children: [], columns: null }]);

    if (loading) return (<div className="flex items-center justify-center py-20 text-slate-500"><Loader2 className="w-6 h-6 animate-spin mr-2" /> Đang tải cấu hình menu...</div>);

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
                <strong>Hướng dẫn:</strong> Click ▶ để mở rộng và chỉnh sửa menu con. Phần <strong className="text-orange-600">tiêu đề cột màu cam</strong> là heading hiển thị trên trang. Sau khi sửa xong nhấn <strong>Lưu Thay Đổi</strong>.
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
