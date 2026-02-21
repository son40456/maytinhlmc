"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, User, Phone, Monitor, Cpu, HardDrive, Fan, Headphones, MousePointer2, Layout as CaseIcon, MonitorPlay, ChevronDown } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { wpgraphqlFetch } from '@/lib/graphql/fetcher';
import { GET_MENU_ITEMS } from '@/lib/graphql/queries';

import { STATIC_MENU_ITEMS, MenuItemType } from '@/constants/menuData';

const LayoutIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
);

const menuIconsMap: { [key: string]: React.ReactNode } = {
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

// Hàm lấy icon dựa trên nhãn hoặc class
const getMenuIcon = (label: string, cssClasses: string[] = []) => {
    const cleanLabel = label.replace(/<\/?[^>]+(>|$)/g, "").toUpperCase();

    // 1. Kiểm tra mapping thủ công
    if (menuIconsMap[cleanLabel]) return menuIconsMap[cleanLabel];

    // 2. Kiểm tra CSS Classes (Hỗ trợ Flatsome/Mega Menu icons)
    const iconClass = cssClasses.find(c => c.startsWith('icon-') || c.startsWith('fa-'));
    if (iconClass) {
        return <i className={`${iconClass}`} style={{ fontSize: '18px' }}></i>;
    }

    return <Monitor size={18} />;
};

export const Header = () => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const itemCount = useCartStore((state) => state.getItemCount());
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

    const menuTree = STATIC_MENU_ITEMS;

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full shadow-md font-sans">
            {/* Tier 1: Blue Bar */}
            <div className="bg-[#004b91] text-white py-3">
                <div className="container mx-auto px-4 flex items-center justify-between gap-4">
                    {/* Logo LMC */}
                    <Link href="/" className="flex-shrink-0">
                        <span className="text-4xl font-black italic tracking-tighter">LMC</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-2xl px-4">
                        <form onSubmit={handleSearch} className="relative">
                            <input
                                type="search"
                                placeholder="Bạn tìm gì..."
                                className="w-full h-10 pl-4 pr-10 rounded-full text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 transition-colors">
                                <Search className="h-5 w-5" />
                            </button>
                        </form>
                    </div>

                    {/* Right Actions */}
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
                                <span className="text-[9px] text-blue-200 uppercase">& Khuyến mãi</span>
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

                    {/* Mobile Menu Icon */}
                    <button className="lg:hidden p-2 text-white">
                        <Menu size={24} />
                    </button>
                </div>
            </div>

            {/* Tier 2: Navy Menu Bar */}
            <div className="bg-[#12243d] text-white border-b border-[#1a3458] z-50 relative">
                <div className="container mx-auto px-2 lg:overflow-visible overflow-x-auto scrollbar-hide relative">
                    <nav className="flex items-center justify-between w-full min-w-max lg:min-w-0">
                        {menuTree.map((item) => {
                            const cleanLabel = item.label.replace(/<\/?[^>]+(>|$)/g, "");
                            const hasChildren = (item.children && item.children.length > 0) || (item.columns && item.columns.length > 0);

                            return (
                                <div key={item.id} className="group/menu static lg:static">
                                    <Link
                                        href={item.path.replace(/\/category\//g, '/').replace(/\/product\//g, '/')}
                                        className="flex flex-col items-center justify-center py-2 px-3 hover:bg-[#1a3458] transition-all group border-b-2 border-transparent hover:border-yellow-400"
                                    >
                                        <span className="mb-0.5 group-hover:scale-110 group-hover:text-yellow-400 transition-all text-gray-300">
                                            {getMenuIcon(cleanLabel, item.cssClasses)}
                                        </span>
                                        <span className="text-[9px] font-bold text-center tracking-tight text-gray-100 group-hover:text-white flex items-center gap-0.5 uppercase whitespace-nowrap">
                                            {cleanLabel}
                                            {hasChildren && <ChevronDown size={10} />}
                                        </span>
                                    </Link>

                                    {/* Dropdown / Mega Menu */}
                                    {hasChildren && (
                                        <div className="absolute left-0 right-0 top-full hidden group-hover/menu:block bg-white text-gray-800 shadow-2xl border border-gray-100 p-8 z-[60] w-full animate-in fade-in slide-in-from-top-2 duration-200">
                                            <div className="flex justify-between items-start">
                                                {/* Columns Rendering */}
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
                                                    // Simple Dropdown if no columns
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

                                                {/* Image Rendering */}
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
    );
};
