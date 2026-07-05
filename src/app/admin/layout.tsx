import type { Metadata } from "next";
import { Menu } from "lucide-react";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { LogoutButton } from "@/components/admin/LogoutButton";

export const metadata: Metadata = {
    title: "Admin Dashboard - LMC",
    description: "Hệ thống Quản trị LMC",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-slate-50 flex font-sans">
            <AdminSidebar />

            {/* Main Content */}
            <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
                {/* Header (Top Nav) */}
                <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-sm">
                    <div className="flex items-center gap-4">
                        <button className="md:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
                            <Menu className="w-5 h-5" />
                        </button>
                        <h2 className="text-lg font-bold text-slate-800 hidden sm:block">Dashboard</h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <LogoutButton />
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center border border-blue-200">
                            <span className="text-blue-700 font-bold text-sm">AD</span>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
