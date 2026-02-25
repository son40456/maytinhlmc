"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Settings,
    MonitorPlay,
    LogOut,
    Box
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-300 transition-all border-r border-slate-800 fixed h-full z-40">
            <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950/50">
                <span className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <Box className="w-6 h-6 text-blue-500" />
                    LMC Admin
                </span>
            </div>

            <div className="p-4 flex-1">
                <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 mt-2">Cấu hình Hệ Thống</p>
                <nav className="space-y-1">
                    <Link
                        href="/admin"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname === '/admin' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <LayoutDashboard className="w-5 h-5" />
                        Giao diện Website
                    </Link>
                    <Link
                        href="/admin/pc-builder"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${pathname === '/admin/pc-builder' ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800 hover:text-white'}`}
                    >
                        <MonitorPlay className="w-5 h-5" />
                        Danh mục Build PC
                    </Link>
                    <a href="#" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 hover:text-white font-medium transition-colors opacity-50 cursor-not-allowed" title="Sắp ra mắt">
                        <Settings className="w-5 h-5" />
                        Cài đặt chung
                    </a>
                </nav>
            </div>

            <div className="p-4 border-t border-slate-800">
                <Link href="/" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors">
                    <LogOut className="w-4 h-4" /> Về trang chủ
                </Link>
            </div>
        </aside>
    );
}
