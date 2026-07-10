"use client";

import React, { useEffect, useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, ChevronRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProductsLive } from '@/app/actions/searchActions';

// ─── Types ───────────────────────────────────────────────────────────────────
interface SearchResult {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
    price: string;
    regularPrice?: string;
    image?: { sourceUrl: string; altText: string };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
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

// ─── Props & Ref handle ───────────────────────────────────────────────────────
interface SearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
}

export interface SearchOverlayHandle {
    focusInput: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────
export const SearchOverlay = forwardRef<SearchOverlayHandle, SearchOverlayProps>(
    ({ isOpen, onClose }, ref) => {
        const [query, setQuery] = useState('');
        const [results, setResults] = useState<SearchResult[]>([]);
        const [isSearching, setIsSearching] = useState(false);
        const [recentSearches, setRecentSearches] = useState<string[]>([]);
        const inputRef = useRef<HTMLInputElement>(null);
        const router = useRouter();

        // Expose focusInput so Header's onClick can call it directly in the user-gesture
        useImperativeHandle(ref, () => ({
            focusInput: () => {
                const el = inputRef.current;
                if (!el) return;
                el.removeAttribute('readonly');
                el.focus();
            }
        }));

        // Lock body scroll & load recent searches when opened
        useEffect(() => {
            if (isOpen) {
                setRecentSearches(getRecentSearches());
                document.body.style.overflow = 'hidden';
                // Fallback focus for non-iOS (iOS is handled via focusInput in Header onClick)
                const t = setTimeout(() => {
                    const el = inputRef.current;
                    if (el && document.activeElement !== el) {
                        el.removeAttribute('readonly');
                        el.focus();
                    }
                }, 80);
                return () => { clearTimeout(t); document.body.style.overflow = ''; };
            } else {
                document.body.style.overflow = '';
                setQuery('');
                setResults([]);
                setIsSearching(false);
            }
        }, [isOpen]);

        // Esc to close
        useEffect(() => {
            const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
            document.addEventListener('keydown', handler);
            return () => document.removeEventListener('keydown', handler);
        }, [onClose]);

        // Debounced live search via Typesense (same as desktop header)
        useEffect(() => {
            const trimmed = query.trim();
            if (trimmed.length < 2) {
                setResults([]);
                setIsSearching(false);
                return;
            }

            setIsSearching(true);
            let cancelled = false;

            const timer = setTimeout(async () => {
                try {
                    const hits = await searchProductsLive(trimmed, 6);
                    if (!cancelled) {
                        // searchProductsLive returns objects that match SearchResult shape
                        setResults(hits.map((h: any) => ({
                            id: String(h.id ?? h.databaseId),
                            databaseId: h.databaseId ?? 0,
                            name: h.name,
                            slug: h.slug,
                            price: h.price,
                            regularPrice: h.regularPrice,
                            image: h.image ?? undefined,
                        })));
                    }
                } catch {
                    if (!cancelled) setResults([]);
                } finally {
                    if (!cancelled) setIsSearching(false);
                }
            }, 200);

            return () => { cancelled = true; clearTimeout(timer); };
        }, [query]);

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

        const hasQuery = query.trim().length >= 2;

        // Always render — hidden via CSS so inputRef is always available (critical for iOS focus)
        return (
            <>
                {/* Backdrop */}
                <div
                    className={`fixed inset-0 z-[200] bg-black/50 backdrop-blur-[2px] transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                    onClick={onClose}
                />

                {/* ========== DESKTOP OVERLAY ========== */}
                <div className={`hidden lg:flex fixed inset-0 z-[201] items-start justify-center pt-24 px-4 pointer-events-none transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
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
                            {hasQuery && (
                                <>
                                    {results.length > 0 && (
                                        <>
                                            <div className="flex items-center justify-between px-5 pt-4 pb-2">
                                                <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Kết quả nổi bật</span>
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

                            {!hasQuery && !isSearching && (
                                <div className="grid grid-cols-2 gap-0 divide-x divide-gray-100">
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

                        {/* Footer */}
                        <div className="flex items-center gap-5 px-5 py-2.5 border-t border-gray-100 bg-gray-50/80 flex-shrink-0">
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
                <div
                    className={`lg:hidden fixed inset-0 z-[201] bg-white flex flex-col transition-transform duration-200 ease-out ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
                    onClick={e => e.stopPropagation()}
                >
                    {/* Search bar */}
                    <div className="flex items-center gap-3 px-4 pt-safe-top pt-4 pb-3 border-b border-gray-100 flex-shrink-0 bg-white">
                        <form onSubmit={handleSubmit} className="flex-1 flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-xl">
                            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
                            <input
                                ref={inputRef}
                                type="text"
                                inputMode="search"
                                enterKeyHint="search"
                                autoComplete="off"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck="false"
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                placeholder="Tìm sản phẩm, danh mục..."
                                className="flex-1 text-[15px] text-gray-800 placeholder-gray-500 bg-transparent outline-none min-w-0"
                            />
                            {isSearching && <Loader2 className="w-4 h-4 animate-spin text-blue-500 flex-shrink-0" />}
                            {query && !isSearching && (
                                <button type="button" onClick={() => setQuery('')} className="p-0.5 text-gray-400 bg-gray-300 rounded-full active:bg-gray-400 flex-shrink-0">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </form>
                        <button type="button" onClick={onClose} className="text-[15px] font-medium text-gray-600 flex-shrink-0 px-1">
                            Huỷ
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto overscroll-contain">
                        {/* IDLE STATE */}
                        {!hasQuery && !isSearching && (
                            <>
                                {recentSearches.length > 0 && (
                                    <div className="px-4 pt-5">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Tìm kiếm gần đây</span>
                                            <button onClick={clearAllRecent} className="text-[11px] font-semibold text-orange-500 uppercase">Xoá tất cả</button>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {recentSearches.map(r => (
                                                <button
                                                    key={r}
                                                    onClick={() => setQuery(r)}
                                                    className="flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-gray-100 rounded-full text-xs font-medium text-gray-700 active:bg-gray-200"
                                                >
                                                    <span>{r}</span>
                                                    <span
                                                        role="button"
                                                        onClick={e => { e.stopPropagation(); removeRecentSearch(r); }}
                                                        className="text-gray-400 hover:text-gray-600"
                                                    >
                                                        <X className="w-3 h-3" />
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="px-4 pt-6">
                                    <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400 block mb-2">Tìm kiếm phổ biến</span>
                                    <div className="divide-y divide-gray-100">
                                        {POPULAR_SUGGESTIONS.map(s => (
                                            <button
                                                key={s}
                                                onClick={() => setQuery(s)}
                                                className="w-full flex items-center gap-3 py-3 text-left group active:bg-gray-50"
                                            >
                                                <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" />
                                                <span className="text-[15px] text-gray-800 flex-1">{s}</span>
                                                <ArrowRight className="w-4 h-4 text-gray-300 group-active:text-orange-400" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* LOADING skeleton */}
                        {isSearching && (
                            <div className="px-4 pt-4 space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3 animate-pulse">
                                        <div className="w-16 h-16 rounded-lg bg-gray-100 flex-shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                                            <div className="h-3 bg-gray-100 rounded w-1/2" />
                                            <div className="h-3.5 bg-gray-100 rounded w-1/3" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* RESULTS */}
                        {hasQuery && !isSearching && (
                            <div className="px-4 pt-4 pb-32">
                                {results.length > 0 && (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Sản phẩm</span>
                                            <button onClick={() => handleSearch(query)} className="text-[11px] font-semibold text-orange-500">Xem tất cả</button>
                                        </div>
                                        <div className="divide-y divide-gray-100">
                                            {results.map(product => (
                                                <Link
                                                    key={product.id}
                                                    href={`/product/${product.slug}`}
                                                    onClick={() => { saveRecentSearch(query); onClose(); }}
                                                    className="flex items-start gap-3 py-3.5 group active:bg-gray-50 -mx-4 px-4"
                                                >
                                                    <div className="relative w-16 h-16 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex-shrink-0">
                                                        {product.image?.sourceUrl
                                                            ? <Image src={product.image.sourceUrl} alt={product.name} fill className="object-contain p-1" sizes="64px" />
                                                            : <div className="w-full h-full flex items-center justify-center"><Search className="w-5 h-5 text-gray-300" /></div>
                                                        }
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <p className="text-[13px] font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                                                            <Highlight text={product.name} query={query} />
                                                        </p>
                                                        <p className="text-[15px] font-bold text-red-600 mt-1.5">{product.price}</p>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                                                </Link>
                                            ))}
                                        </div>
                                    </>
                                )}
                                {results.length === 0 && (
                                    <div className="py-16 flex flex-col items-center gap-3 text-center">
                                        <Search className="w-10 h-10 text-gray-200" />
                                        <p className="text-sm text-gray-400">Không tìm thấy kết quả cho<br /><span className="font-semibold text-gray-600">&quot;{query}&quot;</span></p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Bottom CTA */}
                    {hasQuery && results.length > 0 && !isSearching && (
                        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex items-center justify-between shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
                            <span className="text-xs text-gray-400 font-medium">{results.length}+ kết quả</span>
                            <button
                                onClick={() => handleSearch(query)}
                                className="bg-orange-500 text-white px-6 py-2.5 rounded-full text-sm font-bold active:bg-orange-600 transition-colors"
                            >
                                Xem tất cả kết quả
                            </button>
                        </div>
                    )}
                </div>
            </>
        );
    }
);

SearchOverlay.displayName = 'SearchOverlay';
