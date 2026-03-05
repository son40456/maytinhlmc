"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
    mainImage: { sourceUrl: string; altText?: string };
    galleryNodes: Array<{ sourceUrl: string; altText?: string }>;
    name: string;
    salePrice?: string;
    regularPrice?: string;
}

const AUTO_SLIDE_MS = 4000;

export function ProductGallery({ mainImage, galleryNodes, name, salePrice, regularPrice }: ProductGalleryProps) {
    const allImages = [mainImage, ...galleryNodes].filter(img => img?.sourceUrl);
    const [activeIndex, setActiveIndex] = useState(0);
    const thumbContainerRef = useRef<HTMLDivElement>(null);
    const mobileThumbRef = useRef<HTMLDivElement>(null);
    const isHovering = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const numericRegular = regularPrice ? parseInt(regularPrice.replace(/\D/g, ''), 10) : 0;
    const numericSale = salePrice ? parseInt(salePrice.replace(/\D/g, ''), 10) : 0;
    const discountPercent = numericRegular > numericSale && numericSale > 0
        ? Math.round(((numericRegular - numericSale) / numericRegular) * 100) : 0;

    const goTo = useCallback((idx: number) => setActiveIndex(idx), []);
    const goToNext = useCallback(() => setActiveIndex(p => (p + 1) % allImages.length), [allImages.length]);
    const goToPrev = useCallback(() => setActiveIndex(p => (p === 0 ? allImages.length - 1 : p - 1)), [allImages.length]);

    // Auto-slide
    useEffect(() => {
        if (allImages.length <= 1) return;
        intervalRef.current = setInterval(() => {
            if (!isHovering.current) {
                setActiveIndex(p => (p + 1) % allImages.length);
            }
        }, AUTO_SLIDE_MS);
        return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }, [allImages.length]);

    // Scroll desktop thumbnail strip – use scrollTop directly to avoid page scroll
    useEffect(() => {
        const container = thumbContainerRef.current;
        if (!container) return;
        // Each thumb is 96px + 10px gap (gap-2.5 = 10px)
        const THUMB_SIZE = 106;
        const targetTop = activeIndex * THUMB_SIZE - container.clientHeight / 2 + THUMB_SIZE / 2;
        container.scrollTop = Math.max(0, Math.min(targetTop, container.scrollHeight - container.clientHeight));
    }, [activeIndex]);

    // Scroll horizontal mobile thumbs – use scrollLeft directly
    useEffect(() => {
        const container = mobileThumbRef.current;
        if (!container) return;
        const THUMB_SIZE = 64; // w-14 h-14 = 56px + gap-2 = 8px = 64
        const targetLeft = activeIndex * THUMB_SIZE - container.clientWidth / 2 + THUMB_SIZE / 2;
        container.scrollLeft = Math.max(0, Math.min(targetLeft, container.scrollWidth - container.clientWidth));
    }, [activeIndex]);

    const scrollThumbs = (dir: 'up' | 'down') => {
        if (thumbContainerRef.current) {
            thumbContainerRef.current.scrollTop += dir === 'up' ? -106 : 106;
        }
    };

    if (!allImages[0]?.sourceUrl) return (
        <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">Không có hình ảnh</div>
    );

    // Shared prev/next arrows
    const Arrows = ({ mobile = false }: { mobile?: boolean }) => allImages.length <= 1 ? null : (
        <>
            <button
                onClick={goToPrev}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 ${mobile ? "w-8 h-8" : "w-10 h-10 opacity-0 group-hover:opacity-100"} rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all`}
            ><ChevronLeft className={mobile ? "w-4 h-4" : "w-5 h-5"} /></button>
            <button
                onClick={goToNext}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 ${mobile ? "w-8 h-8" : "w-10 h-10 opacity-0 group-hover:opacity-100"} rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all`}
            ><ChevronRight className={mobile ? "w-4 h-4" : "w-5 h-5"} /></button>
        </>
    );

    return (
        <div>
            {/* ===== DESKTOP ===== */}
            <div className="hidden md:flex gap-4 lg:gap-5">
                {/* Vertical thumbnail strip */}
                {allImages.length > 1 && (
                    <div className="flex flex-col items-center gap-1.5 shrink-0">
                        {allImages.length > 5 && (
                            <button onClick={() => scrollThumbs('up')} className="w-[96px] h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-slate-50">
                                <ChevronUp className="w-4 h-4" />
                            </button>
                        )}
                        <div ref={thumbContainerRef} className="flex flex-col gap-2.5 max-h-[520px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
                            {allImages.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => goTo(idx)}
                                    className={`relative w-[96px] h-[96px] rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shrink-0 ${activeIndex === idx ? "border-blue-600 shadow-md" : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"}`}
                                >
                                    <Image src={img.sourceUrl} alt={img.altText || `${name} ${idx}`} fill className="object-cover p-1.5" sizes="96px" />
                                </button>
                            ))}
                        </div>
                        {allImages.length > 5 && (
                            <button onClick={() => scrollThumbs('down')} className="w-[96px] h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-slate-50">
                                <ChevronDown className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                )}

                {/* Main image — horizontal slide via translateX */}
                <div
                    className="relative flex-1 rounded-xl bg-white overflow-hidden border border-slate-100 group"
                    onMouseEnter={() => { isHovering.current = true; }}
                    onMouseLeave={() => { isHovering.current = false; }}
                >
                    {discountPercent > 0 && (
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow">-{discountPercent}%</span>
                        </div>
                    )}
                    <Arrows />

                    {/* Slide track: mỗi ảnh absolute, dịch theo (idx - activeIndex) * 100% */}
                    <div className="aspect-square overflow-hidden relative">
                        {allImages.map((img, idx) => (
                            <div
                                key={idx}
                                className="absolute inset-0 transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(${(idx - activeIndex) * 100}%)` }}
                            >
                                <Image
                                    src={img.sourceUrl}
                                    alt={img.altText || name}
                                    fill
                                    className="object-contain p-6"
                                    sizes="45vw"
                                    priority={idx === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Counter */}
                    {allImages.length > 1 && (
                        <div className="absolute bottom-3 right-3 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {activeIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>
            </div>

            {/* ===== MOBILE ===== */}
            <div className="md:hidden">
                <div
                    className="relative rounded-lg bg-white overflow-hidden border border-slate-100"
                    onTouchStart={() => { isHovering.current = true; setTimeout(() => { isHovering.current = false; }, 3000); }}
                >
                    {discountPercent > 0 && (
                        <div className="absolute top-3 left-3 z-10 pointer-events-none">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow">-{discountPercent}%</span>
                        </div>
                    )}
                    <Arrows mobile />

                    {/* Slide track mobile */}
                    <div className="aspect-square overflow-hidden relative">
                        {allImages.map((img, idx) => (
                            <div
                                key={idx}
                                className="absolute inset-0 transition-transform duration-500 ease-in-out"
                                style={{ transform: `translateX(${(idx - activeIndex) * 100}%)` }}
                            >
                                <Image
                                    src={img.sourceUrl}
                                    alt={img.altText || name}
                                    fill
                                    className="object-contain p-4"
                                    sizes="100vw"
                                    priority={idx === 0}
                                />
                            </div>
                        ))}
                    </div>

                    {allImages.length > 1 && (
                        <div className="absolute bottom-2 right-2 bg-black/40 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                            {activeIndex + 1} / {allImages.length}
                        </div>
                    )}
                </div>

                {/* Mobile horizontal thumbnails */}
                {allImages.length > 1 && (
                    <div ref={mobileThumbRef} className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => goTo(idx)}
                                className={`relative w-14 h-14 rounded-md overflow-hidden border-2 transition-all duration-200 bg-white shrink-0 ${activeIndex === idx ? "border-blue-600 shadow-sm" : "border-slate-200 opacity-50"}`}
                            >
                                <Image src={img.sourceUrl} alt={img.altText || `${name} ${idx}`} fill className="object-cover p-1" sizes="56px" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
