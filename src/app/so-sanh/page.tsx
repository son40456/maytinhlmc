"use client";

import React, { useEffect, useState, useTransition } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCompareStore } from '@/store/useCompareStore';
import { fetchProductsForCompare } from '@/app/actions/productActions';
import { X, ArrowLeft, Loader2, GitCompareArrows } from 'lucide-react';

interface CompareProduct {
    id: string;
    databaseId: number;
    name: string;
    slug: string;
    price: string;
    regularPrice: string | null;
    salePrice: string | null;
    image: string | null;
    sku: string;
    stockStatus: string;
    shortDescription: string;
    attributes: { name: string; options: string[] }[];
    categories: string[];
    acfSpecs: string;
}

// Parse ACF HTML specs into key-value pairs
function parseAcfSpecs(html: string): { label: string; value: string }[] {
    if (!html) return [];
    const rows: { label: string; value: string }[] = [];
    // Match table rows: <tr><td>Label</td><td>Value</td></tr>
    const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
    let trMatch;
    while ((trMatch = trRegex.exec(html)) !== null) {
        const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/gi;
        const cells: string[] = [];
        let tdMatch;
        while ((tdMatch = tdRegex.exec(trMatch[1])) !== null) {
            cells.push(tdMatch[1].replace(/<[^>]+>/g, '').trim());
        }
        if (cells.length >= 2 && cells[0]) {
            rows.push({ label: cells[0], value: cells[1] || '—' });
        }
    }
    // If no table, try parsing <p> or <li> tags as "key: value"
    if (rows.length === 0) {
        const lineRegex = /<(?:p|li)[^>]*>([\s\S]*?)<\/(?:p|li)>/gi;
        let lineMatch;
        while ((lineMatch = lineRegex.exec(html)) !== null) {
            const text = lineMatch[1].replace(/<[^>]+>/g, '').trim();
            const colonIdx = text.indexOf(':');
            if (colonIdx > 0) {
                rows.push({
                    label: text.slice(0, colonIdx).trim(),
                    value: text.slice(colonIdx + 1).trim() || '—',
                });
            }
        }
    }
    return rows;
}

export default function ComparePage() {
    const items = useCompareStore(state => state.items);
    const removeItem = useCompareStore(state => state.removeItem);
    const clearAll = useCompareStore(state => state.clearAll);
    const [products, setProducts] = useState<CompareProduct[]>([]);
    const [isPending, startTransition] = useTransition();
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (items.length === 0) {
            setProducts([]);
            setLoaded(true);
            return;
        }
        startTransition(async () => {
            const slugs = items.map(i => i.slug);
            const data = await fetchProductsForCompare(slugs);
            setProducts(data as CompareProduct[]);
            setLoaded(true);
        });
    }, [items]);

    // Collect all unique attribute names across all products
    const allAttrNames = Array.from(
        new Set(products.flatMap(p => p.attributes.map(a => a.name)))
    );

    // Parse ACF specs for each product and collect all unique spec labels
    const parsedAcfSpecs = products.map(p => parseAcfSpecs(p.acfSpecs));
    const allAcfSpecLabels = Array.from(
        new Set(parsedAcfSpecs.flatMap(specs => specs.map(s => s.label)))
    );

    const handleRemove = (id: string) => {
        removeItem(id);
    };

    if (!loaded || isPending) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-slate-500">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="font-medium">Đang tải dữ liệu so sánh...</p>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <div className="text-center space-y-6 max-w-md mx-auto px-4">
                    <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
                        <GitCompareArrows className="w-10 h-10 text-slate-300" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Chưa có sản phẩm nào để so sánh</h1>
                    <p className="text-slate-500">
                        Hãy bấm nút <strong>"So sánh"</strong> trên các thẻ sản phẩm để thêm sản phẩm vào danh sách so sánh.
                    </p>
                    <Link href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Quay lại Trang chủ
                    </Link>
                </div>
            </div>
        );
    }

    const specRows: { label: string; key: string }[] = [
        { label: 'Giá bán', key: 'price' },
        { label: 'Giá gốc', key: 'regularPrice' },
        { label: 'Tình trạng', key: 'stockStatus' },
        { label: 'Mã SKU', key: 'sku' },
        { label: 'Danh mục', key: 'categories' },
        { label: 'Mô tả ngắn', key: 'shortDescription' },
    ];

    const getFieldValue = (product: CompareProduct, key: string) => {
        switch (key) {
            case 'price':
                return product.price || 'Liên hệ';
            case 'regularPrice':
                return product.regularPrice || '—';
            case 'stockStatus':
                return product.stockStatus === 'IN_STOCK' ? '✅ Còn hàng' : '❌ Hết hàng';
            case 'sku':
                return product.sku || '—';
            case 'categories':
                return product.categories.join(', ') || '—';
            case 'shortDescription':
                return product.shortDescription || '—';
            default:
                return '—';
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                                <GitCompareArrows className="w-6 h-6 text-blue-600" />
                                So sánh Sản phẩm
                            </h1>
                            <p className="text-sm text-slate-500 mt-1">Đang so sánh {products.length} sản phẩm</p>
                        </div>
                    </div>
                    <button
                        onClick={clearAll}
                        className="text-sm text-red-500 hover:text-red-700 font-semibold transition-colors"
                    >
                        Xóa tất cả
                    </button>
                </div>

                {/* Comparison Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[600px]">
                            {/* Product Header Row */}
                            <thead>
                                <tr className="border-b-2 border-slate-100">
                                    <th className="p-4 text-left w-[160px] bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider sticky left-0 z-10">
                                        Sản phẩm
                                    </th>
                                    {products.map((product) => (
                                        <th key={product.id} className="p-4 text-center min-w-[200px] relative">
                                            <button
                                                onClick={() => handleRemove(product.id)}
                                                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-slate-100 hover:bg-red-500 hover:text-white text-slate-400 flex items-center justify-center transition-colors"
                                                title="Bỏ khỏi so sánh"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            <Link href={`/${product.slug}`} className="block group">
                                                <div className="w-32 h-32 mx-auto relative mb-3">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-contain group-hover:scale-105 transition-transform"
                                                            sizes="128px"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-slate-100 rounded-lg flex items-center justify-center text-slate-300 text-xs">
                                                            No Image
                                                        </div>
                                                    )}
                                                </div>
                                                <h3 className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                                                    {product.name}
                                                </h3>
                                                <p className="text-lg font-extrabold text-blue-600 mt-2">
                                                    {product.price}
                                                </p>
                                            </Link>
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            {/* Spec Rows */}
                            <tbody>
                                {specRows.map((row, idx) => (
                                    <tr key={row.key} className={`border-b border-slate-50 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className={`p-4 text-sm font-semibold text-slate-600 sticky left-0 z-10 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                            {row.label}
                                        </td>
                                        {products.map((product) => (
                                            <td key={product.id} className="p-4 text-sm text-slate-700 text-center">
                                                {row.key === 'price' ? (
                                                    <span className="font-bold text-blue-600">{getFieldValue(product, row.key)}</span>
                                                ) : (
                                                    <span className="leading-relaxed">{getFieldValue(product, row.key)}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}

                                {/* Dynamic Attribute Rows */}
                                {allAttrNames.map((attrName, idx) => (
                                    <tr key={attrName} className={`border-b border-slate-50 ${(specRows.length + idx) % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                        <td className={`p-4 text-sm font-semibold text-slate-600 sticky left-0 z-10 ${(specRows.length + idx) % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                            {attrName}
                                        </td>
                                        {products.map((product) => {
                                            const attr = product.attributes.find(a => a.name === attrName);
                                            return (
                                                <td key={product.id} className="p-4 text-sm text-slate-700 text-center">
                                                    {attr ? attr.options.join(', ') : '—'}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}

                                {/* ACF Detailed Specs Section Header */}
                                {allAcfSpecLabels.length > 0 && (
                                    <tr className="bg-blue-50 border-b-2 border-blue-200">
                                        <td colSpan={products.length + 1} className="p-3 text-sm font-bold text-blue-700 uppercase tracking-wider">
                                            📋 Thông số kỹ thuật chi tiết
                                        </td>
                                    </tr>
                                )}

                                {/* ACF Detailed Spec Rows */}
                                {allAcfSpecLabels.map((specLabel, idx) => {
                                    const rowIdx = specRows.length + allAttrNames.length + idx;
                                    return (
                                        <tr key={`acf-${specLabel}`} className={`border-b border-slate-50 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                            <td className={`p-4 text-sm font-semibold text-slate-600 sticky left-0 z-10 ${rowIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                                                {specLabel}
                                            </td>
                                            {products.map((product, pIdx) => {
                                                const specs = parsedAcfSpecs[pIdx];
                                                const spec = specs.find(s => s.label === specLabel);
                                                return (
                                                    <td key={product.id} className="p-4 text-sm text-slate-700 text-center">
                                                        {spec?.value || '—'}
                                                    </td>
                                                );
                                            })}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA back */}
                <div className="mt-8 text-center">
                    <Link href="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold text-sm transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Tiếp tục mua sắm
                    </Link>
                </div>
            </div>
        </div>
    );
}
