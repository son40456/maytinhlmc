"use client";

import React, { useState } from "react";
import { X, ClipboardList } from "lucide-react";

interface DetailedSpecsTableProps {
    shortDescription: string;
    attributes?: any;
    acfDetailedSpecs?: string;
}

export function DetailedSpecsTable({ shortDescription, attributes, acfDetailedSpecs }: DetailedSpecsTableProps) {
    const [showModal, setShowModal] = useState(false);

    // 1. Extract info from shortDescription
    const extractSpecsFromText = (text: string) => {
        const lines = text.replace(/<[^>]+>/g, "\n").split("\n").map(l => l.trim()).filter(l => l);
        const specs: Array<{ label: string; value: string }> = [];

        lines.forEach(line => {
            if (line.includes(":") && !line.startsWith(">>>")) {
                const [label, ...valueParts] = line.split(":");
                specs.push({
                    label: label.trim(),
                    value: valueParts.join(":").trim()
                });
            }
        });

        return specs;
    };

    const specs = extractSpecsFromText(shortDescription || "");

    // 2. Extract from attributes (if any)
    const attrSpecs = attributes?.nodes?.map((attr: any) => ({
        label: attr.label || attr.name,
        value: attr.options?.join(", ") || ""
    })) || [];

    // Merge both sources
    const allSpecs = [...specs];
    attrSpecs.forEach((as: any) => {
        if (!allSpecs.find(s => s.label.toLowerCase() === as.label.toLowerCase())) {
            allSpecs.push(as);
        }
    });

    if (allSpecs.length === 0) return null;

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
                    <h3 className="text-xl font-bold text-gray-900 m-0">
                        Thông số kỹ thuật
                    </h3>
                </div>
                <div className="p-0">
                    <table className="w-full text-left text-sm text-gray-700">
                        <tbody className="divide-y divide-slate-100">
                            {allSpecs.map((spec, idx) => (
                                <tr key={idx} className="even:bg-slate-50 hover:bg-blue-50/50 transition-colors">
                                    <td className="py-4 px-6 font-medium text-slate-500 w-1/3 align-top">
                                        {spec.label}
                                    </td>
                                    <td className="py-4 px-6 text-slate-800 font-semibold align-top">
                                        {spec.value}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Button: Xem thông số kỹ thuật chi tiết */}
                {acfDetailedSpecs && (
                    <div className="px-6 py-4 border-t border-slate-100">
                        <button
                            onClick={() => setShowModal(true)}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/20 active:scale-[0.98]"
                        >
                            <ClipboardList className="w-4 h-4" />
                            Xem thông số kỹ thuật chi tiết
                        </button>
                    </div>
                )}
            </div>

            {/* Modal: ACF Detailed Specs */}
            {showModal && acfDetailedSpecs && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={() => setShowModal(false)}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" />

                    {/* Modal Content */}
                    <div
                        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col animate-[slideUp_0.3s_ease-out]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 rounded-t-2xl shrink-0">
                            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                                <ClipboardList className="w-5 h-5 text-blue-600" />
                                Thông số kỹ thuật chi tiết
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-200 hover:bg-red-500 hover:text-white text-slate-500 flex items-center justify-center transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="overflow-y-auto px-6 py-4 flex-1">
                            <div
                                className="acf-specs-content prose prose-sm max-w-none
                                    [&_table]:w-full [&_table]:border-collapse [&_table]:text-sm
                                    [&_th]:bg-slate-50 [&_th]:text-left [&_th]:px-4 [&_th]:py-3 [&_th]:border [&_th]:border-slate-200 [&_th]:font-bold [&_th]:text-slate-700
                                    [&_td]:px-4 [&_td]:py-3 [&_td]:border [&_td]:border-slate-200 [&_td]:text-slate-700
                                    [&_tr:nth-child(even)]:bg-slate-50 [&_tr:hover]:bg-blue-50/50
                                    [&_p]:mb-2 [&_p]:text-slate-700
                                    [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1
                                    [&_li]:text-slate-700
                                    [&_strong]:text-slate-900"
                                dangerouslySetInnerHTML={{ __html: acfDetailedSpecs }}
                            />
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 rounded-b-2xl shrink-0">
                            <button
                                onClick={() => setShowModal(false)}
                                className="w-full py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-xl transition-colors"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyframe styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px) scale(0.97); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            ` }} />
        </>
    );
}
