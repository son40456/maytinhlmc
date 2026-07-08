"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, User, Phone, Monitor, Cpu, HardDrive, Fan, Headphones, MousePointer2, Layout as CaseIcon, MonitorPlay, ChevronDown, ChevronRight, Loader2, X, Home, TrendingUp, Clock, ShieldCheck } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { searchProductsLive } from '@/app/actions/searchActions';
import { SearchOverlay } from '@/components/search/SearchOverlay';

import { STATIC_MENU_ITEMS, MenuItemType } from '@/constants/menuData';

const LayoutIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
);

const lucideIconMap: Record<string, React.ReactNode> = {
    'MonitorPlay': <MonitorPlay size={32} />,
    'Layout': <LayoutIcon size={32} />,
    'Cpu': <Cpu size={32} />,
    'HardDrive': <HardDrive size={32} />,
    'Monitor': <Monitor size={32} />,
    'Fan': <Fan size={32} />,
    'MousePointer2': <MousePointer2 size={32} />,
    'Headphones': <Headphones size={32} />,
};
const lucideIconMapSmall: Record<string, React.ReactNode> = {
    'MonitorPlay': <MonitorPlay size={18} />,
    'Layout': <LayoutIcon size={18} />,
    'Cpu': <Cpu size={18} />,
    'HardDrive': <HardDrive size={18} />,
    'Monitor': <Monitor size={18} />,
    'Fan': <Fan size={18} />,
    'MousePointer2': <MousePointer2 size={18} />,
    'Headphones': <Headphones size={18} />,
};

// Render icon from item.icon field (emoji, lucide name) or fall back to label lookup
const renderMenuIcon = (iconField: string | undefined, label: string, cssClasses: string[] = [], small = false) => {
    const map = small ? lucideIconMapSmall : lucideIconMap;
    // 1. Use icon field if present
    if (iconField) {
        if (map[iconField]) return map[iconField];
        // If it looks like an image URL, render an img tag
        if (iconField.startsWith('http') || iconField.startsWith('/')) {
            return (
                <img
                    src={iconField}
                    alt={label}
                    className="object-contain"
                    style={{
                        width: small ? '24px' : '34px',
                        height: small ? '24px' : '34px',
                        filter: 'brightness(0) invert(1)'
                    }}
                />
            );
        }
        // It's an emoji or custom string — render as text
        return <span style={{ fontSize: small ? '18px' : '32px', lineHeight: 1 }}>{iconField}</span>;
    }
    // 2. Fallback: label-based lookup (backward compat)
    const cleanLabel = label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase();
    return map[{
        'BỘ PC': 'MonitorPlay', 'MAINBOARD': 'Layout', 'CPU': 'Cpu',
        'RAM': 'HardDrive', 'VGA': 'Monitor', 'Ổ CỨNG HDD': 'HardDrive',
        'Ổ CỨNG SSD': 'HardDrive', 'PSU': 'Fan', 'CASE': 'Layout',
        'MÀN HÌNH': 'Monitor', 'TẢN NHIỆT': 'Fan', 'PHÍM CHUỘT': 'MousePointer2', 'TAI NGHE': 'Headphones',
    }[cleanLabel] ?? ''] ?? (small ? <Monitor size={18} /> : <Monitor size={32} />);
};

const getMenuIcon = (label: string, cssClasses: string[] = []) => renderMenuIcon(undefined, label, cssClasses, false);
const getMenuIconSmall = (label: string) => renderMenuIcon(undefined, label, [], true);

const POPULAR_SUGGESTIONS_DESKTOP = [
    'RTX 4090', 'CPU Intel i9', 'Laptop Gaming', 'RAM DDR5', 'Màn hình 4K',
];

const RECENT_KEY = 'lmc_recent_searches';
function getRecents() {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(RECENT_KEY) || '[]') as string[]; } catch { return []; }
}
function pushRecent(q: string) {
    if (!q.trim()) return;
    const list = getRecents().filter(r => r !== q);
    list.unshift(q);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 5)));
}

export const Header = ({ logoUrl }: { logoUrl?: string | null }) => {
    const [mounted, setMounted] = useState(false);
    const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
    // Desktop inline search state
    const [desktopQuery, setDesktopQuery] = useState('');
    const [desktopResults, setDesktopResults] = useState<any[]>([]);
    const [desktopSearching, setDesktopSearching] = useState(false);
    const [showDesktopDropdown, setShowDesktopDropdown] = useState(false);
    const [desktopRecents, setDesktopRecents] = useState<string[]>([]);
    const desktopSearchRef = useRef<HTMLDivElement>(null);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
    const [isMenuForceHidden, setIsMenuForceHidden] = useState(false);

    const itemCount = useCartStore((state) => state.getItemCount());
    const cartItems = useCartStore((state) => state.items);
    const cartTotal = useCartStore((state) => state.getRawTotal());
    const removeFromCart = useCartStore((state) => state.removeItem);
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const [menuTree, setMenuTree] = useState<MenuItemType[]>(STATIC_MENU_ITEMS);

    useEffect(() => {
        // Load menu dynamically from Admin config (falls back to static if API fails)
        fetch('/api/admin/menu')
            .then(r => r.ok ? r.json() : null)
            .then(data => { if (Array.isArray(data) && data.length > 0) setMenuTree(data); })
            .catch(() => { }); // Giữ nguyên STATIC_MENU_ITEMS nếu có lỗi
    }, []);

    useEffect(() => {
        setMounted(true);
        setDesktopRecents(getRecents());
    }, []);

    // Close mobile drawer on route change
    useEffect(() => {
        setMobileDrawerOpen(false);
    }, []);

    // Force hide menu temporarily when clicking a link inside it
    const handleMenuClick = useCallback(() => {
        setIsMenuForceHidden(true);
        setTimeout(() => setIsMenuForceHidden(false), 300); // Tăng lên 300ms để đảm bảo UI kịp transition
    }, []);

    // Prevent body scroll when drawer is open
    useEffect(() => {
        if (mobileDrawerOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [mobileDrawerOpen]);

    useEffect(() => {
        let lastScrollY = 0;
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            // Use hysteresis to prevent flickering when scrolling near the threshold
            if (currentScrollY > 120) {
                setScrolled(true);
            } else if (currentScrollY < 40) {
                setScrolled(false);
                setMenuOpen(false);
            }
            lastScrollY = currentScrollY;
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Desktop inline search: debounced search
    useEffect(() => {
        if (desktopQuery.trim().length < 2) {
            setDesktopResults([]);
            setDesktopSearching(false);
            return;
        }
        setDesktopSearching(true);
        const t = setTimeout(async () => {
            try {
                const hits = await searchProductsLive(desktopQuery, 6);
                setDesktopResults(hits as any[]);
            } catch { setDesktopResults([]); }
            finally { setDesktopSearching(false); }
        }, 200);
        return () => clearTimeout(t);
    }, [desktopQuery]);

    // Close desktop dropdown when clicking outside
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target as Node)) {
                setShowDesktopDropdown(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleDesktopSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!desktopQuery.trim()) return;
        pushRecent(desktopQuery.trim());
        setDesktopRecents(getRecents());
        setShowDesktopDropdown(false);
        router.push(`/search?q=${encodeURIComponent(desktopQuery.trim())}`);
    };

    const clearDesktopRecents = () => {
        localStorage.removeItem(RECENT_KEY);
        setDesktopRecents([]);
    };

    return (
        <>
            <SearchOverlay isOpen={searchOverlayOpen} onClose={() => setSearchOverlayOpen(false)} />
            <header className="sticky top-0 z-50 w-full shadow-md font-sans">
                {/* Tier 1: Blue Bar */}
                <div className="bg-[#0a3d7a] text-white h-14 lg:h-[100px]">
                    <div className="container mx-auto px-3 lg:px-4 flex items-center justify-between gap-2 lg:gap-6 h-full">
                        {/* Mobile: Hamburger */}
                        <button
                            className="lg:hidden p-1.5 text-white"
                            onClick={() => setMobileDrawerOpen(true)}
                        >
                            <Menu size={22} />
                        </button>

                        {/* Logo */}
                        <Link href="/" className="flex-shrink-0">
                            {logoUrl ? (
                                <Image
                                    src={logoUrl}
                                    alt="LMC"
                                    width={240}
                                    height={80}
                                    className="h-8 lg:h-[70px] w-auto object-contain"
                                    priority
                                />
                            ) : (
                                <span className="text-2xl lg:text-5xl font-black italic tracking-tighter drop-shadow-sm">LMC</span>
                            )}
                        </Link>

                        {/* Desktop: Danh mục Toggle (visible when scrolled) */}
                        <button
                            onClick={() => setMenuOpen(prev => !prev)}
                            className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 text-white hover:bg-white/15 flex-shrink-0 ${scrolled ? 'opacity-100 bg-white/10' : 'opacity-0 scale-90 pointer-events-none w-0 px-0 overflow-hidden'}`}
                            title={menuOpen ? 'Ẩn danh mục' : 'Hiện danh mục'}
                        >
                            <Menu size={20} className={`transition-transform duration-300 ${menuOpen ? 'rotate-90' : 'rotate-0'}`} />
                            <span className="text-sm font-bold">Danh mục</span>
                        </button>

                        {/* Desktop Search - Inline input with rich Stitch-style dropdown */}
                        <div ref={desktopSearchRef} className="hidden lg:flex flex-1 max-w-3xl px-8 relative">
                            <form onSubmit={handleDesktopSearch} className="w-full relative">
                                <input
                                    type="search"
                                    placeholder="Tìm sản phẩm, thương hiệu, danh mục..."
                                    value={desktopQuery}
                                    onChange={e => { setDesktopQuery(e.target.value); setShowDesktopDropdown(true); }}
                                    onFocus={() => setShowDesktopDropdown(true)}
                                    className="w-full h-12 pl-5 pr-14 rounded-full text-gray-800 bg-white/95 focus:bg-white focus:outline-none focus:ring-4 focus:ring-yellow-400/50 shadow-inner transition-all text-sm"
                                />
                                {desktopQuery && (
                                    <button type="button" onClick={() => setDesktopQuery('')} className="absolute right-11 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 p-1">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                                <button type="submit" className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-yellow-400 hover:text-blue-900 transition-colors shadow-sm">
                                    {desktopSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-5 w-5" />}
                                </button>

                                {/* Rich Dropdown */}
                                {showDesktopDropdown && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 overflow-hidden z-[60] text-gray-800">

                                        {/* IDLE STATE: no query */}
                                        {!desktopQuery.trim() && (
                                            <div className="grid grid-cols-2 divide-x divide-gray-100">
                                                {/* Gợi ý phổ biến */}
                                                <div className="px-5 py-4">
                                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Gợi ý phổ biến</p>
                                                    <div className="space-y-1">
                                                        {POPULAR_SUGGESTIONS_DESKTOP.map(s => (
                                                            <button key={s} type="button" onClick={() => { setDesktopQuery(s); setShowDesktopDropdown(true); }}
                                                                className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-left hover:bg-gray-50 group">
                                                                <TrendingUp className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                                                <span className="text-orange-500 hover:underline font-medium">{s}</span>
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                                {/* Tìm kiếm gần đây */}
                                                <div className="px-5 py-4">
                                                    <div className="flex items-center justify-between mb-3">
                                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tìm kiếm gần đây</p>
                                                        {desktopRecents.length > 0 && (
                                                            <button type="button" onClick={clearDesktopRecents} className="text-[10px] text-orange-500 font-semibold hover:underline">Xoá tất cả</button>
                                                        )}
                                                    </div>
                                                    {desktopRecents.length > 0 ? (
                                                        <div className="space-y-1">
                                                            {desktopRecents.map(r => (
                                                                <button key={r} type="button" onClick={() => { setDesktopQuery(r); setShowDesktopDropdown(true); }}
                                                                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-[13px] text-left hover:bg-gray-50">
                                                                    <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                                                    <span className="text-gray-600 hover:text-blue-600 flex-1">{r}</span>
                                                                    <X className="w-3 h-3 text-gray-200 hover:text-gray-500" onClick={e => { e.stopPropagation(); const u = desktopRecents.filter(x => x !== r); setDesktopRecents(u); localStorage.setItem(RECENT_KEY, JSON.stringify(u)); }} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <p className="text-[12px] text-gray-300">Chưa có lịch sử tìm kiếm</p>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* SEARCHING */}
                                        {desktopQuery.trim() && desktopSearching && (
                                            <div className="p-5 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
                                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> Đang tìm kiếm...
                                            </div>
                                        )}

                                        {/* RESULTS */}
                                        {desktopQuery.trim() && !desktopSearching && desktopResults.length > 0 && (
                                            <>
                                                <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kết quả nổi bật</span>
                                                    <span className="text-[10px] text-gray-400">Cung cấp bởi <span className="font-semibold text-orange-500">Meilisearch</span></span>
                                                </div>
                                                <div className="divide-y divide-gray-50">
                                                    {desktopResults.map((p: any) => (
                                                        <Link
                                                            key={p.id || p.slug}
                                                            href={`/product/${p.slug}`}
                                                            onClick={() => { pushRecent(desktopQuery); setDesktopRecents(getRecents()); setShowDesktopDropdown(false); }}
                                                            className="flex items-center gap-4 px-5 py-3 hover:bg-blue-50/60 transition-colors group"
                                                        >
                                                            <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0 relative">
                                                                {p.image?.sourceUrl
                                                                    ? <Image src={p.image.sourceUrl} alt={p.name} fill className="object-contain p-1" sizes="48px" />
                                                                    : <div className="w-full h-full flex items-center justify-center"><Search className="w-4 h-4 text-gray-300" /></div>
                                                                }
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-blue-700">{p.name}</p>
                                                                <p className="text-[11px] text-gray-400 mt-0.5">Xem chi tiết sản phẩm</p>
                                                            </div>
                                                            <div className="text-right flex-shrink-0">
                                                                <p className="text-[13px] font-bold text-gray-800">{p.price}</p>
                                                                <p className="text-[10px] font-semibold text-green-600 mt-0.5">Còn hàng</p>
                                                            </div>
                                                        </Link>
                                                    ))}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDesktopSearch({ preventDefault: () => {} } as any)}
                                                    className="w-full py-3 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                                                >
                                                    Xem tất cả kết quả cho &quot;{desktopQuery}&quot; <ChevronRight className="w-4 h-4" />
                                                </button>
                                            </>
                                        )}

                                        {/* NO RESULTS */}
                                        {desktopQuery.trim() && !desktopSearching && desktopResults.length === 0 && (
                                            <div className="p-6 text-center text-sm text-gray-400">
                                                Không tìm thấy kết quả cho <span className="font-semibold text-gray-600">&quot;{desktopQuery}&quot;</span>
                                            </div>
                                        )}

                                        {/* Footer keyboard hints */}
                                        <div className="flex items-center gap-4 px-5 py-2.5 border-t border-gray-100 bg-gray-50/80">
                                            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                                <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">↵</kbd> tìm kiếm
                                            </span>
                                            <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                                                <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">ESC</kbd> đóng
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </form>
                        </div>

                        {/* Mobile Search - triggers SearchOverlay */}
                        <div className="flex lg:hidden flex-1 px-2">
                            <button
                                type="button"
                                onClick={() => setSearchOverlayOpen(true)}
                                className="w-full h-9 pl-3 pr-3 rounded-full text-gray-400 bg-white/95 shadow-inner transition-all text-sm flex items-center gap-2"
                            >
                                <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                <span className="flex-1 text-left truncate">Tìm sản phẩm...</span>
                            </button>
                        </div>

                        {/* Mobile: Cart icon */}
                        <Link href="/cart" className="lg:hidden relative p-1.5 text-white">
                            <ShoppingCart className="h-5 w-5" />
                            {mounted && itemCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-blue-900 text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center ring-1 ring-[#004b91]">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {/* Desktop: Right Actions */}
                        <div className="hidden lg:flex items-center space-x-6 text-[10px] font-bold uppercase">
                            <Link href="/pc-builder" className="flex items-center gap-2 hover:text-yellow-400 transition-colors group">
                                <div className="bg-white text-blue-800 rounded-full p-2 group-hover:bg-yellow-400 transition-colors">
                                    <MonitorPlay size={20} />
                                </div>
                                <div className="leading-tight text-white">
                                    <span>Xây dựng</span><br />
                                    <span>cấu hình PC</span>
                                </div>
                            </Link>

                            <Link href="http://baohanh.maytinhlmc.vn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-yellow-400 transition-colors group">
                                <div className="bg-white text-blue-800 rounded-full p-2 group-hover:bg-yellow-400 transition-colors">
                                    <ShieldCheck size={20} />
                                </div>
                                <div className="leading-tight text-white">
                                    <span>Tra cứu</span><br />
                                    <span>Bảo hành</span>
                                </div>
                            </Link>

                            <div className="flex items-center gap-2 text-white">
                                <Phone className="h-5 w-5 text-yellow-400" />
                                <div className="leading-tight">
                                    <span className="text-sm">0220.660.6666</span><br />
                                    <span className="text-[9px] text-blue-200">HOTLINE MUA HÀNG</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 cursor-pointer group hover:text-yellow-400 transition-colors text-white">
                                <div className="leading-tight">
                                    <span className="text-sm flex items-center gap-1">
                                        Kinh nghiệm hay
                                        <ChevronDown size={14} />
                                    </span>
                                    <span className="text-[9px] text-blue-200 uppercase">&amp; Khuyến mãi</span>
                                </div>
                            </div>

                            <div className="relative group">
                                <Link href="/cart" className="flex p-2 text-white hover:text-yellow-400 transition-colors border-l border-blue-400 ml-2 pl-4">
                                    <ShoppingCart className="h-6 w-6" />
                                    {mounted && itemCount > 0 && (
                                        <span className="absolute top-1 right-0 bg-yellow-400 text-blue-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[#004b91]">
                                            {itemCount}
                                        </span>
                                    )}
                                </Link>

                                {/* Cart Dropdown Tooltip */}
                                <div className="absolute top-[48px] right-0 w-[340px] bg-white rounded-xl shadow-2xl border border-slate-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-[70] transform origin-top-right scale-95 group-hover:scale-100" style={{ pointerEvents: 'auto' }}>
                                    {/* Header */}
                                    <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm capitalize">
                                            <ShoppingCart size={16} className="text-blue-600" />
                                            Giỏ hàng của bạn
                                        </h3>
                                        <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">{itemCount} sản phẩm</span>
                                    </div>

                                    {/* Items */}
                                    <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                                        {mounted && cartItems.length > 0 ? (
                                            cartItems.map((item) => (
                                                <div key={item.id} className="group/item flex items-center gap-3 bg-white px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0 relative">
                                                    <div className="bg-white border border-slate-100 aspect-square rounded-lg w-16 h-16 shrink-0 shadow-sm relative overflow-hidden">
                                                        {item.imageUrl ? (
                                                            <Image src={item.imageUrl} alt={item.name} fill className="object-contain p-1" sizes="64px" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center bg-slate-50 text-slate-300"><ShoppingCart size={20} /></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col flex-1 min-w-0 py-1">
                                                        <div className="flex justify-between items-start gap-2">
                                                            <Link href={`/product/${item.slug}`} className="text-slate-800 text-sm font-bold truncate hover:text-blue-600 transition-colors normal-case">
                                                                {item.name}
                                                            </Link>
                                                            <button
                                                                onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeFromCart(item.id); }}
                                                                className="text-slate-300 hover:text-red-500 transition-colors shrink-0 p-0.5 z-10"
                                                                title="Xóa khỏi giỏ hàng"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1.5">
                                                            <p className="text-slate-500 text-[11px] font-semibold bg-slate-100 px-2 py-0.5 rounded-md">SL: {item.quantity}</p>
                                                            <p className="text-blue-600 text-sm font-black tracking-tight">
                                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-8 text-center flex flex-col items-center justify-center gap-2">
                                                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-2">
                                                    <ShoppingCart size={24} />
                                                </div>
                                                <p className="text-slate-500 text-sm font-medium normal-case">Giỏ hàng trống</p>
                                                <Link href="/" className="text-blue-600 text-[11px] font-bold hover:underline mt-1 uppercase tracking-wider">Mua sắm ngay</Link>
                                            </div>
                                        )}
                                    </div>

                                    {/* Footer */}
                                    {mounted && cartItems.length > 0 && (
                                        <div className="p-4 border-t border-slate-100 bg-white rounded-b-xl">
                                            <div className="flex justify-between items-center mb-4 px-1">
                                                <span className="text-slate-500 text-[13px] font-semibold capitalize">Tổng cộng</span>
                                                <span className="text-slate-800 text-lg font-black text-blue-600 tracking-tight">
                                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(cartTotal)}
                                                </span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href="/cart" className="flex-1 px-3 py-2.5 rounded-lg border-2 border-slate-100 text-slate-700 text-[11px] font-black uppercase tracking-wider hover:bg-slate-50 hover:border-slate-200 transition-colors text-center flex items-center justify-center">
                                                    Chi tiết
                                                </Link>
                                                <Link href="/checkout" className="flex-[2] px-3 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-wider shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5">
                                                    Thanh toán <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {mounted && isAuthenticated ? (
                                <Link href="/my-account" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                    <User className="h-5 w-5" />
                                    <span className="max-w-[70px] truncate">{user?.name}</span>
                                </Link>
                            ) : (
                                <Link href="/login" className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                                    <User className="h-5 w-5" />
                                    <span>Login</span>
                                </Link>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tier 2: Desktop Nav Bar - hidden on mobile */}
                <div className={`hidden lg:block bg-[#145094] text-white border-t border-white/10 shadow-inner z-50 relative origin-top transform transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${scrolled && !menuOpen ? 'h-0 opacity-0 scale-y-0 pointer-events-none' : 'h-[110px] opacity-100 scale-y-100'}`}
                    style={scrolled && !menuOpen ? { overflow: 'hidden' } : {}}
                >
                    <div className="container mx-auto px-2 lg:overflow-visible overflow-x-auto scrollbar-hide relative h-full">
                        <nav className="flex items-center justify-between gap-2 py-2 w-full min-w-max lg:min-w-0 h-full">
                            {menuTree.map((item) => {
                                const cleanLabel = item.label.replace(/<\/?[^>]+(>|$)/g, "");
                                const hasChildren = (item.children && item.children.length > 0) || (item.columns && item.columns.length > 0);

                                return (
                                    <div key={item.id} className={`group/menu static lg:static h-full flex-1 ${isMenuForceHidden ? 'pointer-events-none' : ''}`}>
                                        <Link
                                            href={item.path.replace(/\/category\//g, '/').replace(/\/product\//g, '/')}
                                            className="flex flex-col items-center justify-center py-2 px-1 bg-white/5 hover:bg-white/15 rounded-xl transition-all group h-full w-full shadow-sm"
                                            onClick={handleMenuClick}
                                        >
                                            <span className="mb-1.5 group-hover:scale-110 group-hover:text-white transition-all text-gray-200">
                                                {renderMenuIcon((item as any).icon, cleanLabel, item.cssClasses, false)}
                                            </span>
                                            <span className="text-[12px] font-bold text-center tracking-tight text-white flex items-center gap-1 uppercase whitespace-nowrap">
                                                {cleanLabel}
                                                {hasChildren && <ChevronDown size={12} className="opacity-70" />}
                                            </span>
                                        </Link>

                                        {hasChildren && (
                                            <div
                                                className={`absolute left-0 right-0 top-full hidden group-hover/menu:block bg-white text-gray-800 shadow-[0_10px_40px_rgba(0,0,0,0.08)] border-t-2 border-yellow-400 p-8 z-[60] w-full animate-in fade-in slide-in-from-top-2 duration-200 rounded-b-xl ${isMenuForceHidden ? '!hidden' : ''}`}
                                                onClick={handleMenuClick}
                                            >
                                                <div className="flex justify-between items-start gap-8">
                                                    {item.columns ? (
                                                        <div className="flex gap-12 flex-wrap">
                                                            {item.columns.map((col: any, idx: number) => {
                                                                // Support both old (MenuItem[]) and new ({heading, items}) format
                                                                const heading: string = col.heading || '';
                                                                const colItems: any[] = col.items ?? col;
                                                                return (
                                                                    <div key={idx} className="flex flex-col min-w-[150px]">
                                                                        {heading && (
                                                                            <span className="text-[12px] font-black text-orange-600 uppercase tracking-wider mb-3 pb-1.5 border-b-2 border-orange-100 block">
                                                                                {heading}
                                                                            </span>
                                                                        )}
                                                                        <div className="flex flex-col space-y-2.5">
                                                                            {colItems.map((child: any) => (
                                                                                <Link
                                                                                    key={child.id}
                                                                                    href={child.path.replace('/category/', '/').replace('/product/', '/')}
                                                                                    className="block text-[13px] font-semibold text-gray-600 hover:text-blue-600 hover:translate-x-1 transition-all"
                                                                                >
                                                                                    {child.label.replace(/<\/?[^>]+(\>|$)/g, "")}
                                                                                </Link>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col space-y-2 min-w-[150px]">
                                                            {item.children?.map(child => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={child.path.replace('/category/', '/').replace('/product/', '/')}
                                                                    className="block py-1 hover:text-blue-600 hover:translate-x-1 text-[13px] font-bold transition-all text-gray-600"
                                                                >
                                                                    {child.label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase()}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {item.image && (
                                                        <div className="flex-shrink-0 w-[390px] h-[390px] relative hidden lg:block rounded-xl overflow-hidden ml-8">
                                                            <img
                                                                src={item.image}
                                                                alt={cleanLabel}
                                                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            {/* ===== MOBILE DRAWER ===== */}
            {mobileDrawerOpen && (
                <>
                    <div className="fixed inset-0 bg-black/50 z-[60] lg:hidden" onClick={() => setMobileDrawerOpen(false)} />
                    <div className="fixed top-0 left-0 bottom-0 w-[85%] max-w-[320px] bg-white z-[70] lg:hidden flex flex-col animate-in slide-in-from-left duration-300">
                        {/* Drawer Header */}
                        <div className="bg-[#004b91] px-4 py-3 flex items-center justify-between shrink-0">
                            <Link href="/" className="flex-shrink-0" onClick={() => setMobileDrawerOpen(false)}>
                                {logoUrl ? (
                                    <Image src={logoUrl} alt="LMC" width={120} height={36} className="h-8 w-auto object-contain" />
                                ) : (
                                    <span className="text-2xl font-black italic text-white">LMC</span>
                                )}
                            </Link>
                            <button onClick={() => setMobileDrawerOpen(false)} className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white">
                                <X size={18} />
                            </button>
                        </div>

                        {/* User Section */}
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 shrink-0">
                            {mounted && isAuthenticated ? (
                                <Link href="/my-account" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{user?.name}</p>
                                        <p className="text-[10px] text-gray-500">Tài khoản của tôi</p>
                                    </div>
                                </Link>
                            ) : (
                                <Link href="/login" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">Đăng nhập / Đăng ký</p>
                                        <p className="text-[10px] text-gray-500">Để theo dõi đơn hàng & ưu đãi</p>
                                    </div>
                                </Link>
                            )}
                        </div>

                        {/* Quick Links */}
                        <div className="px-3 py-2 grid grid-cols-2 gap-2 border-b border-slate-100 shrink-0">
                            <Link href="/pc-builder" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-2 px-2 py-2 bg-blue-50 rounded-lg text-blue-700 justify-center">
                                <MonitorPlay size={14} />
                                <span className="text-[11px] font-bold">Xây dựng PC</span>
                            </Link>
                            <Link href="http://baohanh.maytinhlmc.vn" target="_blank" rel="noopener noreferrer" onClick={() => setMobileDrawerOpen(false)} className="flex items-center gap-2 px-2 py-2 bg-green-50 rounded-lg text-green-700 justify-center">
                                <ShieldCheck size={14} />
                                <span className="text-[11px] font-bold">Tra cứu Bảo hành</span>
                            </Link>
                            <Link href="/cart" onClick={() => setMobileDrawerOpen(false)} className="col-span-2 flex items-center gap-2 px-2 py-2 bg-orange-50 rounded-lg text-orange-700 justify-center">
                                <ShoppingCart size={14} />
                                <span className="text-[11px] font-bold">Giỏ hàng {mounted && itemCount > 0 && `(${itemCount})`}</span>
                            </Link>
                        </div>

                        {/* Menu Items */}
                        <div className="flex-1 overflow-y-auto">
                            <div className="py-1">
                                {menuTree.map((item) => {
                                    const cleanLabel = item.label.replace(/<\/?[^>]+(>|$)/g, "");
                                    const hasChildren = (item.children && item.children.length > 0) || (item.columns && item.columns.length > 0);
                                    const isExpanded = expandedMobileMenu === item.id;

                                    // Collect all children from columns or direct children
                                    const allChildren: any[] = [];
                                    if (item.columns) {
                                        item.columns.forEach((col: any) => {
                                            const colItems = col.items ?? col;
                                            if (Array.isArray(colItems)) {
                                                allChildren.push(...colItems);
                                            }
                                        });
                                    } else if (item.children) {
                                        allChildren.push(...item.children);
                                    }

                                    return (
                                        <div key={item.id} className="border-b border-slate-50">
                                            <div className="flex items-center">
                                                <Link
                                                    href={item.path.replace(/\/category\//g, '/').replace(/\/product\//g, '/')}
                                                    className="flex-1 flex items-center gap-3 px-4 py-3 text-gray-800"
                                                    onClick={() => setMobileDrawerOpen(false)}
                                                >
                                                    <span className="text-gray-400">{getMenuIconSmall(cleanLabel)}</span>
                                                    <span className="text-sm font-semibold">{cleanLabel}</span>
                                                </Link>
                                                {hasChildren && (
                                                    <button
                                                        onClick={() => setExpandedMobileMenu(isExpanded ? null : item.id)}
                                                        className="px-4 py-3 text-gray-400"
                                                    >
                                                        <ChevronDown size={16} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                                    </button>
                                                )}
                                            </div>

                                            {/* Submenu */}
                                            {isExpanded && allChildren.length > 0 && (
                                                <div className="bg-slate-50 pb-1">
                                                    {allChildren.map(child => {
                                                        const childLabel = child.label.replace(/<\/?[^>]+(>|$)/g, "");
                                                        return (
                                                            <Link
                                                                key={child.id}
                                                                href={child.path.replace('/category/', '/').replace('/product/', '/')}
                                                                className="flex items-center gap-2 pl-12 pr-4 py-2.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 transition-colors"
                                                                onClick={() => setMobileDrawerOpen(false)}
                                                            >
                                                                <ChevronRight size={12} className="text-gray-300" />
                                                                <span className="text-xs font-medium">{childLabel}</span>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={14} className="text-blue-600" />
                                <span className="text-xs font-bold">0220.660.6666</span>
                                <span className="text-[10px] text-gray-400">- Hotline mua hàng</span>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* ===== MOBILE BOTTOM NAV BAR ===== */}
            <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-around py-1.5 px-2 safe-area-bottom">
                    <Link href="/" className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-500 hover:text-blue-600">
                        <Home size={20} />
                        <span className="text-[9px] font-bold">Trang chủ</span>
                    </Link>
                    <button
                        onClick={() => setMobileDrawerOpen(true)}
                        className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-500 hover:text-blue-600"
                    >
                        <Menu size={20} />
                        <span className="text-[9px] font-bold">Danh mục</span>
                    </button>
                    <Link href="/pc-builder" className="flex flex-col items-center gap-0.5 px-2 py-1 text-blue-600">
                        <div className="bg-blue-600 text-white rounded-full p-2 -mt-4 shadow-lg border-4 border-white">
                            <MonitorPlay size={20} />
                        </div>
                        <span className="text-[9px] font-bold">Build PC</span>
                    </Link>
                    <Link href="/cart" className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-500 hover:text-blue-600 relative">
                        <ShoppingCart size={20} />
                        {mounted && itemCount > 0 && (
                            <span className="absolute -top-0.5 right-0 bg-red-500 text-white text-[8px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                                {itemCount}
                            </span>
                        )}
                        <span className="text-[9px] font-bold">Giỏ hàng</span>
                    </Link>
                    <Link href={isAuthenticated ? "/my-account" : "/login"} className="flex flex-col items-center gap-0.5 px-2 py-1 text-gray-500 hover:text-blue-600">
                        <User size={20} />
                        <span className="text-[9px] font-bold">{isAuthenticated ? 'Tài khoản' : 'Đăng nhập'}</span>
                    </Link>
                </div>
            </div>
        </>
    );
};
