"use client";

import { useState, useRef, useEffect } from "react";

interface ExpandableDescriptionProps {
    content: string;
}

export function ExpandableDescription({ content }: ExpandableDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [needsExpansion, setNeedsExpansion] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    // Check if the content is taller than the max collapsed height (e.g., 600px)
    useEffect(() => {
        if (contentRef.current) {
            requestAnimationFrame(() => {
                if (contentRef.current && contentRef.current.scrollHeight > 600) {
                    setNeedsExpansion(true);
                }
            });
        }
    }, [content]);

    return (
        <div className="overflow-hidden relative">
            <div
                ref={contentRef}
                className={`prose max-w-none prose-blue prose-img:rounded-2xl transition-all duration-500 overflow-hidden ${!isExpanded && needsExpansion ? "max-h-[600px]" : "max-h-[10000px]"
                    }`}
                dangerouslySetInnerHTML={{ __html: content }}
            />

            {needsExpansion && !isExpanded && (
                <div className="absolute bottom-0 left-0 w-full h-48 bg-gradient-to-t from-white via-white/95 to-transparent flex items-end justify-center pb-6 z-10 pointer-events-none">
                    <button
                        onClick={() => setIsExpanded(true)}
                        className="pointer-events-auto group flex items-center gap-2 px-8 py-2.5 bg-white border border-slate-200 text-blue-600 rounded-full font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.1)] hover:border-blue-300 hover:text-blue-700 transition-all duration-300"
                    >
                        Xem thêm
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                    </button>
                </div>
            )}

            {needsExpansion && isExpanded && (
                <div className="mt-8 flex justify-center">
                    <button
                        onClick={() => setIsExpanded(false)}
                        className="group flex items-center gap-2 px-8 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-full font-semibold shadow-[0_4px_20px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_25px_rgba(0,0,0,0.08)] hover:border-slate-300 hover:text-slate-800 transition-all duration-300"
                    >
                        Thu gọn
                        <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" /></svg>
                    </button>
                </div>
            )}
        </div>
    );
}
