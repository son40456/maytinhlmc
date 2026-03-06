"use client";

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, User, Phone, Monitor, Cpu, HardDrive, Fan, Headphones, MousePointer2, Layout as CaseIcon, MonitorPlay, ChevronDown, ChevronRight, Loader2, X, Home } from 'lucide-react';
import Image from 'next/image';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { wpgraphqlFetch } from '@/lib/graphql/fetcher';
import { GET_MENU_ITEMS } from '@/lib/graphql/queries';
import { searchProductsLive } from '@/app/actions/searchActions';

import { STATIC_MENU_ITEMS, MenuItemType } from '@/constants/menuData';

const LayoutIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
);

const menuIconsMap: { [key: string]: React.ReactNode } = {
    'BỘ PC': <MonitorPlay size={22} />,
    'MAINBOARD': <LayoutIcon size={22} />,
    'CPU': <Cpu size={22} />,
    'RAM': <HardDrive size={22} />,
    'VGA': <Monitor size={22} />,
    'Ổ CỨNG HDD': <HardDrive size={22} />,
    'Ổ CỨNG SSD': <HardDrive size={22} />,
    'PSU': <Fan size={22} />,
    'CASE': <CaseIcon size={22} />,
    'MÀN HÌNH': <Monitor size={22} />,
    'TẢN NHIỆT': <Fan size={22} />,
    'PHÍM CHUỘT': <MousePointer2 size={22} />,
    'TAI NGHE': <Headphones size={22} />,
};

const menuIconsMapSmall: { [key: string]: React.ReactNode } = {
    'BỘ PC': <MonitorPlay size={18} />,
    'MAINBOARD': <LayoutIcon size={18} />,
    'CPU': <Cpu size={18} />,
    'RAM': <HardDrive size={18} />,
    'VGA': <Monitor size={18} />,
    'Ổ CỨNG HDD': <HardDrive size={18} />,
    'Ổ CỨNG SSD': <HardDrive size={18} />,
    'PSU': <Fan size={18} />,
    'CASE': <CaseIcon size={18} />,
    'MÀN HÌNH': <Monitor size={18} />,
    'TẢN NHIỆT': <Fan size={18} />,
    'PHÍM CHUỘT': <MousePointer2 size={18} />,
    'TAI NGHE': <Headphones size={18} />,
};

const getMenuIcon = (label: string, cssClasses: string[] = []) => {
    const cleanLabel = label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase();
    if (menuIconsMap[cleanLabel]) return menuIconsMap[cleanLabel];
    const iconClass = cssClasses.find(c => c.startsWith('icon-') || c.startsWith('fa-'));
    if (iconClass) {
        return <i className={`${iconClass}`} style={{ fontSize: '22px' }}></i>;
    }
    return <Monitor size={22} />;
};

const getMenuIconSmall = (label: string) => {
    const cleanLabel = label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase();
    if (menuIconsMapSmall[cleanLabel]) return menuIconsMapSmall[cleanLabel];
    return <Monitor size={18} />;
};

export const Header = ({ logoUrl }: { logoUrl?: string | null }) => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [liveResults, setLiveResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showLiveResults, setShowLiveResults] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
    const [isMenuForceHidden, setIsMenuForceHidden] = useState(false);

    const searchRef = React.useRef<HTMLFormElement>(null);
    const itemCount = useCartStore((state) => state.getItemCount());
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const menuTree = STATIC_MENU_ITEMS;

    useEffect(() => {
        setMounted(true);
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowLiveResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
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

    useEffect(() => {
        const fetchResults = async () => {
            if (searchQuery.trim().length < 2) {
                setLiveResults([]);
                setIsSearching(false);
                return;
            }
            setIsSearching(true);
            try {
                const results = await searchProductsLive(searchQuery);
                setLiveResults(results);
            } catch (error) {
                console.error("Live search error:", error);
            } finally {
                setIsSearching(false);
            }
        };
        const delayDebounceFn = setTimeout(() => { fetchResults(); }, 400);
        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setShowLiveResults(false);
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <>
            <header className="sticky top-0 z-50 w-full shadow-md font-sans">
                {/* Tier 1: Blue Bar */}
                <div className="bg-[#004b91] text-white h-14 lg:h-[72px]">
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
                                    width={160}
                                    height={48}
                                    className="h-8 lg:h-12 w-auto object-contain"
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

                        {/* Search Bar */}
                        <div className="flex-1 max-w-3xl lg:px-8 relative">
                            <form ref={searchRef} onSubmit={handleSearch} className="relative group/search">
                                <input
                                    type="search"
                                    placeholder="Tìm sản phẩm..."
                                    className="w-full h-9 lg:h-12 pl-4 lg:pl-5 pr-10 lg:pr-14 rounded-full text-gray-800 bg-white/95 focus:bg-white focus:outline-none focus:ring-2 lg:focus:ring-4 focus:ring-yellow-400/50 shadow-inner transition-all text-sm lg:text-base relative z-10"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        if (e.target.value.trim().length >= 2) {
                                            setShowLiveResults(true);
                                        } else {
                                            setShowLiveResults(false);
                                        }
                                    }}
                                    onFocus={() => {
                                        if (searchQuery.trim().length >= 2) {
                                            setShowLiveResults(true);
                                        }
                                    }}
                                />
                                <button
                                    type="submit"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 lg:h-9 lg:w-9 flex items-center justify-center rounded-full bg-blue-600 text-white hover:bg-yellow-400 hover:text-blue-900 transition-colors shadow-sm z-10"
                                >
                                    <Search className="h-3.5 w-3.5 lg:h-5 lg:w-5" />
                                </button>

                                {/* Dropdown Kết Quả */}
                                {showLiveResults && (
                                    <div className="absolute top-full left-0 mt-2 w-full bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden z-[60] text-gray-800 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {isSearching ? (
                                            <div className="p-4 lg:p-6 text-center text-gray-500 flex items-center justify-center gap-3 text-sm">
                                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Đang tìm kiếm...
                                            </div>
                                        ) : liveResults.length > 0 ? (
                                            <div className="max-h-[60vh] lg:max-h-[70vh] overflow-y-auto custom-scrollbar">
                                                <div className="p-3 lg:p-4 border-b border-slate-100">
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 lg:mb-3 px-2">Top Sản Phẩm</h4>
                                                    <div className="grid grid-cols-1 gap-1 lg:gap-2">
                                                        {liveResults.map((product) => (
                                                            <Link
                                                                key={product.id}
                                                                href={`/product/${product.slug}`}
                                                                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors group"
                                                                onClick={() => setShowLiveResults(false)}
                                                            >
                                                                <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-md bg-slate-100 overflow-hidden flex-shrink-0 relative">
                                                                    {product.image?.sourceUrl ? (
                                                                        <Image src={product.image.sourceUrl} alt={product.name} fill className="object-cover" />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                                            <Search className="w-4 h-4" />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <h3 className="text-slate-900 font-semibold text-xs lg:text-sm truncate group-hover:text-blue-600 transition-colors">
                                                                        {product.name}
                                                                    </h3>
                                                                    <p className="font-bold text-xs lg:text-sm mt-0.5 text-rose-600">
                                                                        {product.price || product.regularPrice || 'Liên hệ'}
                                                                    </p>
                                                                </div>
                                                            </Link>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div
                                                    className="p-2.5 lg:p-3 bg-blue-600 text-white text-center text-xs lg:text-sm font-bold cursor-pointer hover:bg-blue-700 transition-colors"
                                                    onClick={(e) => { e.preventDefault(); handleSearch(e); }}
                                                >
                                                    Xem tất cả kết quả cho &quot;{searchQuery}&quot;
                                                </div>
                                            </div>
                                        ) : searchQuery.trim().length >= 2 ? (
                                            <div className="p-4 lg:p-6 text-center text-gray-500 text-sm">
                                                Không tìm thấy sản phẩm nào cho <span className="font-bold">&quot;{searchQuery}&quot;</span>
                                            </div>
                                        ) : null}
                                    </div>
                                )}
                            </form>
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

                            <Link href="/cart" className="relative group p-2 text-white hover:text-yellow-400 transition-colors border-l border-blue-400 ml-2 pl-4">
                                <ShoppingCart className="h-6 w-6" />
                                {mounted && itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-blue-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-[#004b91]">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>

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
                <div className={`hidden lg:block bg-[#12243d] text-white border-b border-[#1a3458] z-50 relative origin-top transform transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] ${scrolled && !menuOpen ? 'h-0 opacity-0 scale-y-0 pointer-events-none' : 'h-[80px] opacity-100 scale-y-100'}`}
                    style={scrolled && !menuOpen ? { overflow: 'hidden' } : {}}
                >
                    <div className="container mx-auto px-2 lg:overflow-visible overflow-x-auto scrollbar-hide relative">
                        <nav className="flex items-center justify-between w-full min-w-max lg:min-w-0">
                            {menuTree.map((item) => {
                                const cleanLabel = item.label.replace(/<\/?[^>]+(>|$)/g, "");
                                const hasChildren = (item.children && item.children.length > 0) || (item.columns && item.columns.length > 0);

                                return (
                                    <div key={item.id} className={`group/menu static lg:static ${isMenuForceHidden ? 'pointer-events-none' : ''}`}>
                                        <Link
                                            href={item.path.replace(/\/category\//g, '/').replace(/\/product\//g, '/')}
                                            className="flex flex-col items-center justify-center py-3 px-4 hover:bg-[#1a3458] transition-all group border-b-2 border-transparent hover:border-yellow-400"
                                            onClick={handleMenuClick}
                                        >
                                            <span className="mb-1.5 group-hover:scale-110 group-hover:text-yellow-400 transition-all text-gray-300">
                                                {getMenuIcon(cleanLabel, item.cssClasses)}
                                            </span>
                                            <span className="text-[11px] font-bold text-center tracking-tight text-gray-100 group-hover:text-white flex items-center gap-1 uppercase whitespace-nowrap">
                                                {cleanLabel}
                                                {hasChildren && <ChevronDown size={12} />}
                                            </span>
                                        </Link>

                                        {hasChildren && (
                                            <div
                                                className={`absolute left-0 right-0 top-full hidden group-hover/menu:block bg-white text-gray-800 shadow-2xl border border-gray-100 p-8 z-[60] w-full animate-in fade-in slide-in-from-top-2 duration-200 ${isMenuForceHidden ? '!hidden' : ''}`}
                                                onClick={handleMenuClick}
                                            >
                                                <div className="flex justify-between items-start">
                                                    {item.columns ? (
                                                        <div className="flex gap-8 min-w-max">
                                                            {item.columns.map((col, idx) => (
                                                                <div key={idx} className="flex flex-col space-y-2 min-w-[150px]">
                                                                    {col.map(child => (
                                                                        <Link
                                                                            key={child.id}
                                                                            href={child.path.replace('/category/', '/').replace('/product/', '/')}
                                                                            className="block py-1 hover:text-blue-600 text-[11px] font-bold transition-colors"
                                                                        >
                                                                            {child.label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase()}
                                                                        </Link>
                                                                    ))}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col space-y-2 min-w-[150px]">
                                                            {item.children?.map(child => (
                                                                <Link
                                                                    key={child.id}
                                                                    href={child.path.replace('/category/', '/').replace('/product/', '/')}
                                                                    className="block py-1 hover:text-blue-600 text-[11px] font-bold transition-colors"
                                                                >
                                                                    {child.label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase()}
                                                                </Link>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {item.image && (
                                                        <div className="flex-shrink-0 w-48 h-48 relative hidden xl:block">
                                                            <img
                                                                src={item.image}
                                                                alt={cleanLabel}
                                                                className="w-full h-full object-contain opacity-90"
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
                        <div className="px-3 py-2 flex gap-2 border-b border-slate-100 shrink-0">
                            <Link href="/pc-builder" onClick={() => setMobileDrawerOpen(false)} className="flex-1 flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg text-blue-700">
                                <MonitorPlay size={16} />
                                <span className="text-[11px] font-bold">Xây dựng PC</span>
                            </Link>
                            <Link href="/cart" onClick={() => setMobileDrawerOpen(false)} className="flex-1 flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg text-orange-700">
                                <ShoppingCart size={16} />
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
                                    const allChildren: MenuItemType[] = [];
                                    if (item.columns) {
                                        item.columns.forEach(col => allChildren.push(...col));
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
