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
        <>
            {/* Desktop CompareBar */}
            <div className="hidden lg:block fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t-[3px] border-blue-600 shadow-[0_-12px_40px_rgba(0,0,0,0.15)] animate-in slide-in-from-bottom-4 duration-300">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
                    <div className="flex items-center gap-6 py-4">
                        {/* Label */}
                        <div className="flex items-center gap-3 shrink-0">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <GitCompareArrows className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-slate-800 uppercase tracking-widest">So sánh</p>
                                <p className="text-xs text-slate-500 font-medium mt-0.5">{items.length}/4 sản phẩm</p>
                            </div>
                        </div>

                        {/* Product Slots */}
                        <div className="flex-1 flex items-center gap-4 overflow-x-auto pb-2 -mb-2 scrollbar-hide">
                            {items.map((item) => (
                                <div key={item.id} className="relative flex items-center gap-3 bg-white border-2 border-slate-100 rounded-2xl pl-2 pr-10 py-2 shrink-0 w-[240px] group hover:border-blue-400 hover:shadow-md transition-all duration-300">
                                    <div className="w-14 h-14 relative shrink-0 bg-slate-50 rounded-xl p-1">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-contain mix-blend-multiply p-1"
                                                sizes="56px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[10px]">N/A</div>
                                        )}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">{item.name}</span>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-500 flex items-center justify-center transition-all duration-200"
                                        title="Bỏ khỏi so sánh"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {/* Empty slots */}
                            {Array.from({ length: 4 - items.length }).map((_, i) => (
                                <div key={`empty-${i}`} className="w-[240px] h-[76px] rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 flex items-center justify-center shrink-0">
                                    <span className="text-slate-300 font-medium flex items-center gap-2">
                                        <span className="text-2xl">+</span> 
                                        <span className="text-sm">Thêm sản phẩm</span>
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0 pl-4 border-l border-slate-200">
                            <button
                                onClick={clearAll}
                                className="p-3 text-slate-400 hover:text-red-500 transition-colors rounded-xl hover:bg-red-50"
                                title="Xóa tất cả"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                            <Link
                                href="/so-sanh"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl text-base font-bold shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-0.5 flex items-center gap-2"
                            >
                                <GitCompareArrows className="w-5 h-5" />
                                So sánh ngay
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile CompareBar - above bottom nav */}
            <div className="lg:hidden fixed bottom-[56px] left-0 right-0 z-[45] bg-white/95 backdrop-blur-xl border-t-2 border-blue-600 shadow-[0_-8px_20px_rgba(0,0,0,0.12)] animate-in slide-in-from-bottom-4 duration-300">
                <div className="px-4 py-3">
                    <div className="flex items-center gap-3">
                        {/* Compact product thumbnails */}
                        <div className="flex items-center gap-2 flex-1 overflow-x-auto scrollbar-hide py-1">
                            {items.map((item) => (
                                <div key={item.id} className="relative shrink-0 mr-1">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 overflow-hidden relative shadow-sm">
                                        {item.imageUrl ? (
                                            <Image
                                                src={item.imageUrl}
                                                alt={item.name}
                                                fill
                                                className="object-contain p-1"
                                                sizes="48px"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300 text-[8px]">N/A</div>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center shadow-md border-2 border-white"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                            <span className="text-xs font-bold text-slate-400 shrink-0 ml-1">{items.length}/4</span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={clearAll}
                                className="p-2.5 text-slate-400 hover:text-red-500 transition-colors rounded-xl bg-slate-50 border border-slate-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <Link
                                href="/so-sanh"
                                className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-blue-500/20 flex items-center gap-1.5"
                            >
                                <GitCompareArrows className="w-4 h-4" />
                                So sánh
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
