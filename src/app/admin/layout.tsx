import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Admin Dashboard - LMC",
    description: "Quản trị viên LMC",
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900">LMC Admin</h1>
                    <nav className="flex items-center gap-4">
                        <a href="/" className="text-sm font-medium text-blue-600 hover:text-blue-800">
                            Quay lại Website
                        </a>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto px-4 py-8">
                {children}
            </main>
        </div>
    );
}
