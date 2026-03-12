"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { algoliasearch } from 'algoliasearch';
import { useRouter } from 'next/navigation';

const algoliaClient = algoliasearch(
    process.env.NEXT_PUBLIC_ALGOLIA_APP_ID!,
    process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY!
);

interface SearchResult {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
    price: string;
    regularPrice?: string;
    image?: {
        sourceUrl: string;
        altText: string;
    };
}

function parseAlgoliaPrice(priceHtml: string): string {
    if (!priceHtml) return 'Liên hệ';
    // Use [\s\S] instead of /s flag for ES2017 compat
    const insMatch = priceHtml.match(/<ins[^>]*>[\s\S]*?(\d[\d.,]+)\s*[₫đ]/);
    if (insMatch) return insMatch[1].replace(/\./g, '') + ' ₫';
    const match = priceHtml.match(/(\d[\d.,]+)\s*[₫đ]/);
    if (match) return match[1].replace(/\./g, '') + ' ₫';
    return 'Liên hệ';
}

async function searchAlgolia(query: string, hitsPerPage = 5): Promise<SearchResult[]> {
    const result = await algoliaClient.searchSingleIndex({
        indexName: 'wp_posts_product',
        searchParams: { query, hitsPerPage, attributesToRetrieve: ['post_id', 'post_title', 'permalink', 'images', 'price_html'] },
    });
    return (result.hits as any[]).map((h) => ({
        id: String(h.post_id),
        databaseId: h.post_id,
        name: h.post_title,
        slug: h.permalink?.replace(/^https?:\/\/[^/]+\//, '').replace(/\/$/, '') ?? '',
        price: parseAlgoliaPrice(h.price_html),
        image: { sourceUrl: h.images?.thumbnail?.url ?? '', altText: h.post_title },
    }));
}

// Highlighted text: makes the matched query bold/orange
function Highlight({ text, query }: { text: string; query: string }) {
    if (!query) return <>{text}</>;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return (
        <>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase()
                    ? <span key={i} className="text-orange-500 font-semibold">{part}</span>
                    : part
            )}
        </>
    );
}

const POPULAR_SUGGESTIONS = [
    'RTX 4090', 'CPU Intel i9', 'Laptop Gaming', 'RAM DDR5', 'Màn hình 4K',
];

const RECENT_SEARCHES_KEY = 'lmc_recent_searches';
function getRecentSearches(): string[] {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]'); } catch { return []; }
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
    const [totalCount, setTotalCount] = useState(0);
    const [isSearching, setIsSearching] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            setRecentSearches(getRecentSearches());
            setTimeout(() => inputRef.current?.focus(), 50);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            setQuery('');
            setResults([]);
            setTotalCount(0);
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    // Debounced search - optimized with useTransition for non-blocking UI
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setTotalCount(0);
            setIsSearching(false);
            setDebouncedQuery('');
            return;
        }

        // Update debounced query after user stops typing (80ms - Algolia is fast)
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 80);

        return () => clearTimeout(timer);
    }, [query]);

    // Actual search effect - runs only when debounced query changes
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) return;

        setIsSearching(true);
        const controller = new AbortController();

        const doSearch = async () => {
            try {
                const hits = await searchAlgolia(debouncedQuery, 5);
                // Check if component still mounted and query hasn't changed
                if (!controller.signal.aborted) {
                    setResults(hits);
                    setTotalCount(hits.length > 0 ? hits.length * 3 : 0);
                }
            } catch {
                if (!controller.signal.aborted) {
                    setResults([]);
                    setTotalCount(0);
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsSearching(false);
                }
            }
        };

        doSearch();
        return () => { controller.abort(); };
    }, [debouncedQuery]);

    const handleSearch = useCallback((searchQuery: string) => {
        if (!searchQuery.trim()) return;
        saveRecentSearch(searchQuery.trim());
        onClose();
        router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }, [onClose, router]);

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); handleSearch(query); };

    const removeRecentSearch = (term: string) => {
        const updated = recentSearches.filter(r => r !== term);
        setRecentSearches(updated);
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    };

    const clearAllRecent = () => { clearRecentSearches(); setRecentSearches([]); };

    if (!isOpen) return null;

    const hasQuery = query.trim().length >= 2;

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px]" onClick={onClose} />

            {/* ========== DESKTOP OVERLAY (spotlight/command palette style) ========== */}
            <div className="hidden lg:flex fixed inset-0 z-[201] items-start justify-center pt-24 px-4 pointer-events-none">
                <div
                    className="w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_80px_rgba(0,0,0,0.18)] border border-gray-200 overflow-hidden pointer-events-auto flex flex-col"
                    style={{ maxHeight: '70vh' }}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search Input */}
                    <form onSubmit={handleSubmit} className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                        <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Tìm sản phẩm, thương hiệu hoặc danh mục..."
                            className="flex-1 text-gray-800 text-sm placeholder-gray-400 bg-transparent outline-none"
                        />
                        {isSearching
                            ? <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />
                            : query
                                ? <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"><X className="w-4 h-4" /></button>
                                : <kbd className="flex items-center px-2 py-0.5 text-[10px] font-medium text-gray-400 border border-gray-200 rounded bg-gray-50">ESC</kbd>
                        }
                    </form>

                    {/* Content */}
                    <div className="overflow-y-auto flex-1">
                        {/* Search Results */}
                        {hasQuery && (
                            <>
                                {results.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kết quả nổi bật</span>
                                            <span className="text-[10px] text-gray-400">Cung cấp bởi <span className="font-bold text-orange-500">SONBN</span></span>
                                        </div>
                                        <div className="divide-y divide-gray-50">
                                            {results.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.slug}`}
                                                    onClick={() => { saveRecentSearch(query); onClose(); }}
                                                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors group"
                                                >
                                                    <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-100">
                                                        {product.image?.sourceUrl
                                                            ? <Image src={product.image.sourceUrl} alt={product.name} fill className="object-contain p-1" sizes="48px" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Search className="w-4 h-4 text-gray-300" /></div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[13px] font-semibold text-gray-800 truncate group-hover:text-blue-700">
                                                            <Highlight text={product.name} query={query} />
                                                        </p>
                                                        <p className="text-[11px] text-gray-400 truncate mt-0.5">Xem chi tiết sản phẩm</p>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-4">
                                                        <p className="text-[13px] font-bold text-gray-800">{product.price}</p>
                                                        <p className="text-[10px] font-semibold text-green-600 mt-0.5">Còn hàng</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {!isSearching && results.length === 0 && (
                                    <p className="px-5 py-8 text-sm text-center text-gray-400">Không tìm thấy kết quả cho <span className="font-semibold text-gray-600">&quot;{query}&quot;</span></p>
                                )}
                            </>
                        )}

                        {/* Suggestions + Recent (idle state) */}
                        {!hasQuery && !isSearching && (
                            <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">
                                {/* Suggestions column */}
                                <div className="px-5 py-4">
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Gợi ý tìm kiếm</p>
                                    <div className="space-y-2.5">
                                        {POPULAR_SUGGESTIONS.map(s => (
                                            <button key={s} onClick={() => setQuery(s)} className="w-full flex items-center gap-2 text-[13px] text-left group">
                                                <TrendingUp className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />
                                                <span className="text-orange-500 hover:underline font-medium">{s}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {/* Recent column */}
                                <div className="px-5 py-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tìm kiếm gần đây</p>
                                        {recentSearches.length > 0 && (
                                            <button onClick={clearAllRecent} className="text-[10px] text-orange-500 hover:text-orange-700 font-semibold uppercase tracking-wide">Xoá tất cả</button>
                                        )}
                                    </div>
                                    {recentSearches.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {recentSearches.map(r => (
                                                <button key={r} onClick={() => setQuery(r)} className="w-full flex items-center gap-2 text-[13px] text-left">
                                                    <Clock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                                                    <span className="text-gray-600 hover:text-blue-600 flex-1">{r}</span>
                                                    <X className="w-3 h-3 text-gray-300 hover:text-gray-500" onClick={e => { e.stopPropagation(); removeRecentSearch(r); }} />
                                                </button>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[12px] text-gray-300">Chưa có lịch sử tìm kiếm</p>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer: keyboard shortcuts */}
                    <div className="flex items-center gap-5 px-5 py-2.5 border-t border-gray-100 bg-gray-50/80 flex-shrink-0">
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">↑↓</kbd> điều hướng
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">↵</kbd> chọn
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] text-gray-400">
                            <kbd className="px-1.5 py-0.5 border border-gray-200 rounded text-[10px] bg-white">ESC</kbd> đóng
                        </span>
                        {hasQuery && results.length > 0 && (
                            <button onClick={() => handleSearch(query)} className="ml-auto text-[11px] font-semibold text-blue-600 hover:underline flex items-center gap-1">
                                Xem tất cả kết quả <ArrowRight className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* ========== MOBILE OVERLAY (full screen) ========== */}
            <div className="lg:hidden fixed inset-0 z-[201] bg-white flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Mobile search input bar */}
                <form onSubmit={handleSubmit} className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-100 flex-shrink-0">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        placeholder="Tìm kiếm..."
                        className="flex-1 text-sm text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                    />
                    {isSearching && <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />}
                    {query && !isSearching && (
                        <button type="button" onClick={() => setQuery('')} className="p-1 text-gray-400">
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <button type="button" onClick={onClose} className="text-sm font-bold text-orange-500 flex-shrink-0">Huỷ</button>
                </form>

                {/* Scrollable content */}
                <div className="flex-1 overflow-y-auto pb-24">
                    {/* IDLE STATE */}
                    {!hasQuery && !isSearching && (
                        <>
                            {/* Recent Searches */}
                            {recentSearches.length > 0 && (
                                <div className="px-4 pt-5">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Tìm kiếm gần đây</span>
                                        <button onClick={clearAllRecent} className="text-[11px] font-semibold text-orange-500 uppercase">Xoá tất cả</button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {recentSearches.map(r => (
                                            <div key={r} className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700">
                                                <span>{r}</span>
                                                <button onClick={() => removeRecentSearch(r)} className="text-gray-400 hover:text-gray-600">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Popular Suggestions */}
                            <div className="px-4 pt-6">
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-3">Tìm kiếm phổ biến</span>
                                <div className="space-y-1">
                                    {POPULAR_SUGGESTIONS.map(s => (
                                        <button
                                            key={s}
                                            onClick={() => setQuery(s)}
                                            className="w-full flex items-center gap-3 py-3 text-left group border-b border-gray-50"
                                        >
                                            <TrendingUp className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                            <span className="text-sm text-gray-800 flex-1">{s}</span>
                                            <ArrowRight className="w-4 h-4 text-gray-200 group-hover:text-orange-400 transition-colors" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}

                    {/* SEARCH RESULTS STATE */}
                    {hasQuery && (
                        <div className="px-4 pt-4">
                            {results.length > 0 && (
                                <>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>
                                        <button onClick={() => handleSearch(query)} className="text-[11px] font-semibold text-orange-500">Xem tất cả kết quả</button>
                                    </div>
                                    <div className="space-y-0 divide-y divide-gray-100">
                                        {results.map((product, i) => (
                                            <Link
                                                key={product.id}
                                                href={`/product/${product.slug}`}
                                                onClick={() => { saveRecentSearch(query); onClose(); }}
                                                className="flex items-center gap-3 py-3 group"
                                            >
                                                {/* Badge + image */}
                                                <div className="relative w-16 h-16 rounded-xl bg-gray-900 overflow-hidden flex-shrink-0">
                                                    {product.image?.sourceUrl
                                                        ? <Image src={product.image.sourceUrl} alt={product.name} fill className="object-contain p-1 opacity-90" sizes="64px" />
                                                        : <div className="w-full h-full flex items-center justify-center"><Search className="w-5 h-5 text-gray-500" /></div>
                                                    }
                                                    {/* Status badge */}
                                                    <span className={`absolute top-1 left-1 text-[8px] font-bold uppercase px-1 py-0.5 rounded ${i === 1 ? 'bg-amber-500 text-white' : i === 2 ? 'bg-blue-500 text-white' : 'bg-green-500 text-white'}`}>
                                                        {i === 1 ? 'PRE-ORDER' : i === 2 ? 'NEW' : 'IN STOCK'}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-xs font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-700 transition-colors">
                                                        <Highlight text={product.name} query={query} />
                                                    </p>
                                                    <p className="text-sm font-bold text-gray-900 mt-1">{product.price}</p>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
                                            </Link>
                                        ))}
                                    </div>
                                </>
                            )}
                            {!isSearching && results.length === 0 && (
                                <p className="py-12 text-sm text-center text-gray-400">Không tìm thấy kết quả cho &quot;{query}&quot;</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Mobile Fixed Bottom Bar */}
                {hasQuery && results.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between flex-shrink-0 safe-area-bottom shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                        <span className="text-xs text-gray-400 font-medium">{Math.max(results.length * 3, results.length)} Kết quả</span>
                        <button
                            onClick={() => handleSearch(query)}
                            className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-orange-600 transition-colors"
                        >
                            Xem kết quả
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};
