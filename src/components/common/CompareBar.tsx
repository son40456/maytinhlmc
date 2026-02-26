"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompareStore } from '@/store/useCompareStore';
import { X, GitCompareArrows, Trash2 } from 'lucide-react';

export function CompareBar() {
    const items = useCompareStore(state => state.items);
    const removeItem = useCompareStore(state => state.removeItem);
    const clearAll = useCompareStore(state => state.clearAll);

    if (items.length === 0) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-t-2 border-blue-600 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-4 duration-300">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 py-3">
                    {/* Label */}
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm">
                            <GitCompareArrows className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">So sánh</p>
                            <p className="text-[10px] text-slate-400">{items.length}/4 sản phẩm</p>
                        </div>
                    </div>

                    {/* Product Slots */}
                    <div className="flex-1 flex items-center gap-2 overflow-x-auto">
                        {items.map((item) => (
                            <div key={item.id} className="relative flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl pl-2 pr-8 py-1.5 shrink-0 max-w-[200px] group hover:border-blue-300 transition-colors">
                                <div className="w-10 h-10 relative shrink-0 bg-white rounded-lg border border-slate-100">
                                    {item.imageUrl ? (
                                        <Image
                                            src={item.imageUrl}
                                            alt={item.name}
                                            fill
                                            className="object-contain p-0.5 rounded-lg"
                                            sizes="40px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px]">N/A</div>
                                    )}
                                </div>
                                <span className="text-xs font-medium text-slate-700 line-clamp-2 leading-tight">{item.name}</span>
                                <button
                                    onClick={() => removeItem(item.id)}
                                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-500 flex items-center justify-center transition-colors"
                                    title="Bỏ khỏi so sánh"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}

                        {/* Empty slots */}
                        {Array.from({ length: 4 - items.length }).map((_, i) => (
                            <div key={`empty-${i}`} className="hidden md:flex w-10 h-10 rounded-xl border-2 border-dashed border-slate-200 items-center justify-center shrink-0">
                                <span className="text-slate-300 text-lg">+</span>
                            </div>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={clearAll}
                            className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50"
                            title="Xóa tất cả"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                            href="/so-sanh"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"
                        >
                            <GitCompareArrows className="w-4 h-4" />
                            <span className="hidden sm:inline">Xem so sánh</span>
                            <span className="sm:hidden">So sánh</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
