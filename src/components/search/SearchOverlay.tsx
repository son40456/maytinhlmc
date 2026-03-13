"use client";

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { MeiliSearch } from 'meilisearch';
import { useRouter } from 'next/navigation';

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

function formatVND(amount: number | null | undefined): string {
    if (!amount || amount <= 0) return 'Liên hệ';
    return amount.toLocaleString('vi-VN') + ' ₫';
}

function mapHit(hit: any): SearchResult {
    const displayPrice = hit.price || hit.regularPrice || hit.salePrice;
    return {
        id: hit.objectID || hit.id,
        databaseId: parseInt(hit.id),
        name: hit.name,
        slug: hit.slug,
        price: formatVND(displayPrice),
        image: {
            sourceUrl: hit.image,
            altText: hit.name || ''
        }
    };
}

// Lazy client - only initialize when actually searching
let meiliClient: MeiliSearch | null = null;
function getMeiliClient() {
    if (!meiliClient && typeof window !== 'undefined') {
        meiliClient = new MeiliSearch({
            host: process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700',
            apiKey: process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || ''
        });
    }
    return meiliClient;
}

async function searchMeilisearch(query: string, hitsPerPage = 5): Promise<SearchResult[]> {
    const client = getMeiliClient();
    if (!client) return [];
    const index = client.index(process.env.MEILISEARCH_INDEX_NAME || 'products');
    const result = await index.search(query, { limit: hitsPerPage });
    return (result.hits || []).map(mapHit);
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

    // Debounced search
    const [debouncedQuery, setDebouncedQuery] = useState('');

    useEffect(() => {
        if (query.trim().length < 2) {
            setResults([]);
            setTotalCount(0);
            setIsSearching(false);
            setDebouncedQuery('');
            return;
        }

        // Debounce 150ms for Meilisearch
        const timer = setTimeout(() => {
            setDebouncedQuery(query.trim());
        }, 150);

        return () => clearTimeout(timer);
    }, [query]);

    // Actual search effect - runs only when debounced query changes
    useEffect(() => {
        if (!debouncedQuery || debouncedQuery.length < 2) return;

        setIsSearching(true);
        const controller = new AbortController();

        const doSearch = async () => {
            try {
                const hits = await searchMeilisearch(debouncedQuery, 5);
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

    const clearAllRecent = () => { clearRecentSearches(); setRecentSearches([]); };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-2xl mx-4">
                <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                    {/* Search Input */}
                    <form onSubmit={handleSubmit} className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Tìm kiếm sản phẩm..."
                            className="w-full h-14 pl-12 pr-12 text-lg outline-none"
                            autoComplete="off"
                        />
                        <button type="button" onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full">
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </form>

                    {/* Results / Suggestions */}
                    <div className="max-h-[70vh] overflow-y-auto">
                        {isSearching ? (
                            <div className="p-8 text-center">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-600" />
                                <p className="text-slate-500 mt-2">Đang tìm kiếm...</p>
                            </div>
                        ) : query.length >= 2 && results.length > 0 ? (
                            <div className="p-2">
                                {results.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={`/${result.slug}`}
                                        onClick={() => { saveRecentSearch(query); onClose(); }}
                                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors"
                                    >
                                        <div className="w-14 h-14 bg-slate-100 rounded-lg overflow-hidden shrink-0">
                                            {result.image?.sourceUrl && (
                                                <Image src={result.image.sourceUrl} alt={result.name} width={56} height={56} className="w-full h-full object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-slate-900 truncate">
                                                <Highlight text={result.name} query={query} />
                                            </h4>
                                            <p className="text-sm text-blue-600 font-bold">{result.price}</p>
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
                                    </Link>
                                ))}
                                <button onClick={() => { handleSearch(query); }} className="w-full p-3 text-center text-blue-600 font-medium hover:bg-slate-50 rounded-xl mt-2">
                                    Xem tất cả kết quả cho "{query}"
                                </button>
                            </div>
                        ) : query.length >= 2 ? (
                            <div className="p-8 text-center text-slate-500">
                                <p>Không tìm thấy kết quả nào</p>
                            </div>
                        ) : (
                            <div className="p-4">
                                {/* Recent Searches */}
                                {recentSearches.length > 0 && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2 px-2">
                                            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tìm kiếm gần đây</h4>
                                            <button onClick={clearAllRecent} className="text-xs text-slate-400 hover:text-slate-600">Xóa</button>
                                        </div>
                                        {recentSearches.map((term, i) => (
                                            <button key={i} onClick={() => setQuery(term)} className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-slate-50 text-left">
                                                <Clock className="w-4 h-4 text-slate-400" />
                                                <span className="text-slate-600">{term}</span>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* Popular */}
                                <div>
                                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-2">Xu hướng tìm kiếm</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {POPULAR_SUGGESTIONS.map((term) => (
                                            <button key={term} onClick={() => setQuery(term)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-full text-sm text-slate-600 hover:bg-slate-200 transition-colors">
                                                <TrendingUp className="w-3.5 h-3.5" />
                                                {term}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
