"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Search, Menu, User } from 'lucide-react';
import { Input } from '../ui/Input';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';

export const Header = () => {
    const [mounted, setMounted] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const itemCount = useCartStore((state) => state.getItemCount());
    const { user, isAuthenticated } = useAuthStore();
    const router = useRouter();

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
        <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    {/* Logo & Mobile Menu */}
                    <div className="flex items-center">
                        <button className="mr-4 lg:hidden p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md">
                            <Menu className="h-6 w-6" />
                        </button>
                        <Link href="/" className="flex-shrink-0">
                            <span className="text-2xl font-bold tracking-tight text-blue-600">Store<span className="text-gray-900">Next</span></span>
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
                    <nav className="hidden lg:flex lg:space-x-8">
                        <Link href="/category/all" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Sản phẩm</Link>
                        <Link href="/category/new" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Hàng mới</Link>
                        <Link href="/category/sale" className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors">Khuyến mãi</Link>
                        <Link href="/blog" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Tin tức</Link>
                    </nav>

                    {/* Search Bar - Desktop */}
                    <div className="hidden flex-1 items-center justify-center px-8 lg:flex max-w-md">
                        <form onSubmit={handleSearch} className="relative w-full">
                            <Input
                                type="search"
                                placeholder="Tìm kiếm sản phẩm..."
                                className="pl-10 rounded-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <Search className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                            </button>
                        </form>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center space-x-6">
                        {mounted && isAuthenticated ? (
                            <Link href="/my-account" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                <User className="h-6 w-6 mr-1" />
                                <span className="text-sm font-medium hidden sm:inline">{user?.name}</span>
                            </Link>
                        ) : (
                            <Link href="/login" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
                                <User className="h-6 w-6" />
                                <span className="text-sm font-medium hidden sm:inline">Đăng nhập</span>
                            </Link>
                        )}
                        <Link href="/cart" className="group flex items-center p-2 -m-2 relative">
                            <ShoppingCart className="h-6 w-6 flex-shrink-0 text-gray-600 group-hover:text-blue-600 transition-colors" />
                            {mounted && itemCount > 0 && (
                                <span className="absolute -top-1 -right-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-600 rounded-full">
                                    {itemCount}
                                </span>
                            )}
                            <span className="sr-only">giỏ hàng</span>
                        </Link>
                    </div>
                </div>

                {/* Mobile Search Bar */}
                <div className="pb-3 lg:hidden">
                    <form onSubmit={handleSearch} className="relative w-full">
                        <Input
                            type="search"
                            placeholder="Tìm kiếm sản phẩm..."
                            className="pl-10"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="absolute inset-y-0 left-0 flex items-center pl-3">
                            <Search className="h-5 w-5 text-gray-400 hover:text-blue-600" />
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
};
