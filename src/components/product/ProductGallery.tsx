"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";

interface ProductGalleryProps {
    mainImage: { sourceUrl: string; altText?: string };
    galleryNodes: Array<{ sourceUrl: string; altText?: string }>;
    name: string;
    salePrice?: string;
    regularPrice?: string;
}

const AUTO_SLIDE_INTERVAL = 4000; // 4 giây

export function ProductGallery({ mainImage, galleryNodes, name, salePrice, regularPrice }: ProductGalleryProps) {
    const allImages = [mainImage, ...galleryNodes].filter(img => img?.sourceUrl);
    const [activeIndex, setActiveIndex] = useState(0);
    const [imageOpacity, setImageOpacity] = useState(1);
    const [isPlaying, setIsPlaying] = useState(true);
    const thumbContainerRef = useRef<HTMLDivElement>(null);
    const mobileThumbRef = useRef<HTMLDivElement>(null);
    const isHovering = useRef(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const numericRegular = regularPrice ? parseInt(regularPrice.replace(/\D/g, ''), 10) : 0;
    const numericSale = salePrice ? parseInt(salePrice.replace(/\D/g, ''), 10) : 0;
    const discountPercent = numericRegular > numericSale && numericSale > 0
        ? Math.round(((numericRegular - numericSale) / numericRegular) * 100) : 0;

    // Crossfade to a specific index
    const switchTo = useCallback((newIndex: number) => {
        if (newIndex === setActiveIndex(val => val) as unknown as number) return;
        setImageOpacity(0);
        setTimeout(() => {
            setActiveIndex(newIndex);
            setImageOpacity(1);
        }, 350);
    }, []);

    // Simple helper using functional update to get current index
    const goToIndexFn = useCallback((fn: (prev: number) => number) => {
        setImageOpacity(0);
        setTimeout(() => {
            setActiveIndex(fn);
            setImageOpacity(1);
        }, 350);
    }, []);

    const goToNext = useCallback(() => goToIndexFn(prev => (prev + 1) % allImages.length), [goToIndexFn, allImages.length]);
    const goToPrev = useCallback(() => goToIndexFn(prev => (prev === 0 ? allImages.length - 1 : prev - 1)), [goToIndexFn, allImages.length]);

    // Auto-slide
    const startInterval = useCallback(() => {
        if (allImages.length <= 1) return;
        intervalRef.current = setInterval(() => {
            if (!isHovering.current) {
                setImageOpacity(0);
                setTimeout(() => { setActiveIndex(p => (p + 1) % allImages.length); setImageOpacity(1); }, 350);
            }
        }, AUTO_SLIDE_INTERVAL);
    }, [allImages.length]);

    const stopInterval = useCallback(() => {
        if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    }, []);

    useEffect(() => {
        if (isPlaying) startInterval();
        else stopInterval();
        return stopInterval;
    }, [isPlaying, startInterval, stopInterval]);

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbContainerRef.current) {
            const el = thumbContainerRef.current.children[activeIndex] as HTMLElement;
            el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        if (mobileThumbRef.current) {
            const el = mobileThumbRef.current.children[activeIndex] as HTMLElement;
            el?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [activeIndex]);

    const scrollThumbs = (direction: 'up' | 'down') => {
        thumbContainerRef.current?.scrollBy({ top: direction === 'up' ? -104 : 104, behavior: 'smooth' });
    };

    const handleThumbClick = (idx: number) => {
        setImageOpacity(0);
        setTimeout(() => { setActiveIndex(idx); setImageOpacity(1); }, 350);
    };

    if (!allImages[0]?.sourceUrl) {
        return <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">Không có hình ảnh</div>;
    }

    const activeImage = allImages[activeIndex];

    // Shared main image area
    const MainImageArea = ({ mobile = false }: { mobile?: boolean }) => (
        <div
            className={`relative ${mobile ? "rounded-lg" : "flex-1 rounded-xl"} bg-white flex items-start justify-center overflow-hidden border border-slate-100 group`}
            onMouseEnter={() => { isHovering.current = true; }}
            onMouseLeave={() => { isHovering.current = false; }}
        >
            {/* Discount badge */}
            {discountPercent > 0 && (
                <div className="absolute top-3 left-3 z-10 pointer-events-none">
                    <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow">-{discountPercent}%</span>
                </div>
            )}

            {/* Prev/Next arrows */}
            {allImages.length > 1 && (
                <>
                    <button
                        onClick={() => { goToPrev(); }}
                        className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 ${mobile ? "w-8 h-8" : "w-10 h-10 opacity-0 group-hover:opacity-100"} rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all`}
                    >
                        <ChevronLeft className={mobile ? "w-4 h-4" : "w-5 h-5"} />
                    </button>
                    <button
                        onClick={() => { goToNext(); }}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 ${mobile ? "w-8 h-8" : "w-10 h-10 opacity-0 group-hover:opacity-100"} rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all`}
                    >
                        <ChevronRight className={mobile ? "w-4 h-4" : "w-5 h-5"} />
                    </button>
                </>
            )}

            {/* Main image with crossfade */}
            <div className={`relative w-full ${mobile ? "aspect-square" : "aspect-square"}`}>
                <Image
                    key={activeImage.sourceUrl}
                    src={activeImage.sourceUrl}
                    alt={activeImage.altText || name}
                    fill
                    className={`object-contain ${mobile ? "p-4" : "p-6"} transition-opacity duration-500 hover:scale-[1.02] transition-transform`}
                    style={{ opacity: imageOpacity, transition: 'opacity 350ms ease' }}
                    sizes={mobile ? "100vw" : "50vw"}
                    priority
                />
            </div>

            {/* Counter + Play/Pause */}
            {allImages.length > 1 && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
                    {/* Dot indicators */}
                    <div className="flex gap-1">
                        {allImages.slice(0, 8).map((_, i) => (
                            <button
                                key={i}
                                onClick={() => handleThumbClick(i)}
                                className={`rounded-full transition-all duration-300 ${i === activeIndex ? "w-4 h-1.5 bg-blue-600" : "w-1.5 h-1.5 bg-black/30"}`}
                            />
                        ))}
                        {allImages.length > 8 && <span className="text-[9px] text-black/50 self-center">+{allImages.length - 8}</span>}
                    </div>
                    {/* Play/Pause */}
                    <button
                        onClick={() => setIsPlaying(p => !p)}
                        className="w-5 h-5 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        title={isPlaying ? "Dừng tự động" : "Tự động chuyển"}
                    >
                        {isPlaying ? <Pause className="w-2.5 h-2.5" /> : <Play className="w-2.5 h-2.5" />}
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div>
            {/* Desktop Layout */}
            <div className="hidden md:flex gap-4 lg:gap-5">
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
                                    onClick={() => handleThumbClick(idx)}
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
                <MainImageArea />
            </div>

            {/* Mobile Layout */}
            <div className="md:hidden">
                <MainImageArea mobile />
                {allImages.length > 1 && (
                    <div ref={mobileThumbRef} className="flex gap-2 mt-3 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleThumbClick(idx)}
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
