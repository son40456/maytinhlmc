"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { searchProductsLive } from '@/app/actions/searchActions';
import { useRouter } from 'next/navigation';

interface SearchResult {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
    price: string;
    image?: {
        sourceUrl: string;
        altText: string;
    };
}

const POPULAR_SUGGESTIONS = [
    'RTX 4090',
    'CPU Intel i9',
    'Laptop Gaming',
    'RAM DDR5',
    'Màn hình 4K',
];

const RECENT_SEARCHES_KEY = 'lmc_recent_searches';

function getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
    } catch { return []; }
}

function saveRecentSearch(query: string) {
    if (typeof window === 'undefined' || !query.trim()) return;
    try {
        const recent = getRecentSearches().filter(q => q !== query);
        recent.unshift(query);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recent.slice(0, 5)));
    } catch { }
}

function clearRecentSearches() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(RECENT_SEARCHES_KEY);
}

interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    // Load recent searches and focus input when opened
    useEffect(() => {
        if (isOpen) {
            setRecentSearches(getRecentSearches());
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    // Keyboard shortcut (Escape to close)
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Debounced search
    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setIsSearching(false);
            return;
        }
        setIsSearching(true);
        const timer = setTimeout(async () => {
            try {
                const hits = await searchProductsLive(query, 5);
                setResults(hits as SearchResult[]);
            } catch {
                setResults([]);
            } finally {
                setIsSearching(false);
            }
        }, 200);
        return () => clearTimeout(timer);
    }, [query]);

    const handleSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;
        saveRecentSearch(searchQuery.trim());
        onClose();
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, [onClose, router]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSearch(query);
    };

    const handleClearRecent = () => {
        clearRecentSearches();
        setRecentSearches([]);
    };

    if (!isOpen) return null;

    const hasQuery = query.trim().length >= 2;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Overlay panel */}
            <div className="fixed inset-0 z-[201] flex items-start justify-center pt-4 px-4 lg:pt-20 lg:px-0 pointer-events-none">
                <div
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden pointer-events-auto flex flex-col"
                    style={{ maxHeight: 'calc(100vh - 2rem)', minHeight: '200px' }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Search Input Bar */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 flex-shrink-0">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Tìm sản phẩm, thương hiệu, hoặc danh mục..."
                            className="flex-1 text-gray-800 text-base placeholder-gray-400 bg-transparent outline-none"
                        />
                        {query ? (
                            <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <X className="w-4 h-4" />
                            </button>
                        ) : (
                            <kbd className="hidden lg:flex items-center gap-1 px-2 py-1 text-[10px] font-medium text-gray-400 border border-gray-200 rounded-md bg-gray-50">ESC</kbd>
                        )}
                        <button type="button" onClick={onClose} className="lg:hidden text-sm font-semibold text-blue-600">
                            Đóng
                        </button>
                    </form>

                    {/* Content area */}
                    <div className="overflow-y-auto flex-1">
                        {/* While searching */}
                        {isSearching && (
                            <div className="flex items-center gap-3 px-5 py-4 text-sm text-gray-500">
                                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                                Đang tìm kiếm...
                            </div>
                        )}

                        {/* Search results */}
                        {!isSearching && hasQuery && results.length > 0 && (
                            <div>
                                <div className="flex items-center justify-between px-5 py-3">
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sản phẩm nổi bật</span>
                                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                        Cung cấp bởi <span className="font-bold text-orange-500">Meilisearch</span>
                                    </span>
                                </div>
                                <div className="divide-y divide-gray-50">
                                    {results.map(product => (
                                        <Link
                                            key={product.id}
                                            href={`/product/${product.slug}`}
                                            onClick={() => { saveRecentSearch(query); onClose(); }}
                                            className="flex items-center gap-4 px-5 py-3 hover:bg-blue-50/60 transition-colors group"
                                        >
                                            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
                                                {product.image?.sourceUrl ? (
                                                    <Image src={product.image.sourceUrl} alt={product.name} fill className="object-contain p-1" sizes="56px" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Search className="w-5 h-5 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-700 transition-colors">{product.name}</p>
                                                <p className="text-sm font-bold text-rose-600 mt-0.5">{product.price}</p>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                                        </Link>
                                    ))}
                                </div>
                                <button
                                    onClick={() => handleSearch(query)}
                                    className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                                >
                                    Xem tất cả kết quả cho &quot;{query}&quot;
                                    <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {/* No results */}
                        {!isSearching && hasQuery && results.length === 0 && (
                            <div className="px-5 py-10 text-center">
                                <p className="text-gray-500 text-sm">Không tìm thấy sản phẩm nào cho <span className="font-bold text-gray-700">&quot;{query}&quot;</span></p>
                                <p className="text-gray-400 text-xs mt-1">Hãy thử từ khoá khác hoặc xem gợi ý bên dưới.</p>
                            </div>
                        )}

                        {/* Idle state: Recents + Suggestions */}
                        {!hasQuery && !isSearching && (
                            <div className="px-5 py-4 space-y-5">
                                {/* Recent searches */}
                                {recentSearches.length > 0 && (
                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tìm kiếm gần đây</span>
                                            <button onClick={handleClearRecent} className="text-[11px] text-gray-400 hover:text-red-500 transition-colors">Xoá tất cả</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map(search => (
                                                <button
                                                    key={search}
                                                    onClick={() => setQuery(search)}
                                                    className="flex items-center gap-1.5 pl-2.5 pr-3 py-1.5 rounded-full border border-gray-200 text-xs font-medium text-gray-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                                >
                                                    <Clock className="w-3 h-3 text-gray-400" />
                                                    {search}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Popular suggestions */}
                                <div>
                                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 block mb-2">Tìm kiếm phổ biến</span>
                                    <div className="space-y-1">
                                        {POPULAR_SUGGESTIONS.map(suggestion => (
                                            <button
                                                key={suggestion}
                                                onClick={() => setQuery(suggestion)}
                                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors text-left group"
                                            >
                                                <TrendingUp className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                                {suggestion}
                                                <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 ml-auto transition-colors" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer keyboard shortcuts - Desktop only */}
                    <div className="hidden lg:flex items-center gap-4 px-5 py-2.5 border-t border-gray-100 bg-gray-50/80 flex-shrink-0">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">↑↓</kbd> điều hướng
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">↵</kbd> chọn
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">ESC</kbd> đóng
                        </span>
                    </div>
                </div>
            </div>
        </>
    );
};
