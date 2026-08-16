"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface ProductGalleryProps {
    mainImage: { sourceUrl: string; altText?: string };
    galleryNodes: Array<{ sourceUrl: string; altText?: string }>;
    name: string;
    salePrice?: string;
    regularPrice?: string;
}

const AUTO_SLIDE_MS = 4000;

// Lightbox Component
function Lightbox({
    images,
    currentIndex,
    onClose,
    onPrev,
    onNext,
    onGoTo,
    name
}: {
    images: Array<{ sourceUrl: string; altText?: string }>;
    currentIndex: number;
    onClose: () => void;
    onPrev: () => void;
    onNext: () => void;
    onGoTo: (idx: number) => void;
    name: string;
}) {
    const [zoom, setZoom] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDragging = useRef(false);
    const lastPos = useRef({ x: 0, y: 0 });

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') onPrev();
        if (e.key === 'ArrowRight') onNext();
    }, [onClose, onPrev, onNext]);

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [handleKeyDown]);

    const resetZoom = () => {
        setZoom(1);
        setPosition({ x: 0, y: 0 });
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        const newZoom = e.deltaY < 0 ? Math.min(zoom * 1.2, 4) : Math.max(zoom / 1.2, 1);
        setZoom(newZoom);
        if (newZoom === 1) setPosition({ x: 0, y: 0 });
    };

    const handleMouseDown = (e: React.MouseEvent) => {
        if (zoom > 1) {
            isDragging.current = true;
            lastPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (isDragging.current && zoom > 1) {
            setPosition(p => ({
                x: p.x + (e.clientX - lastPos.current.x),
                y: p.y + (e.clientY - lastPos.current.y)
            }));
            lastPos.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleMouseUp = () => {
        isDragging.current = false;
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        // Only close if clicking the overlay itself, not children
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 99999,
                backgroundColor: 'rgba(0,0,0,0.92)',
                display: 'flex',
                flexDirection: 'column'
            }}
            onClick={handleOverlayClick}
        >
            {/* Close button — top right */}
            <button
                onClick={onClose}
                style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 100000,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    padding: 0,
                    fontSize: 28,
                    lineHeight: 1,
                    color: 'white',
                    fontWeight: 300
                }}
                aria-label="Đóng"
            >
                ✕
            </button>

            {/* Counter — top left */}
            <div style={{ position: 'absolute', top: 24, left: 24, zIndex: 100000, color: '#fff', fontSize: 15, fontWeight: 500 }}>
                {currentIndex + 1} / {images.length}
            </div>

            {/* Main Image Area */}
            <div
                className="flex-1 flex items-center justify-center overflow-hidden relative"
                onClick={(e) => e.stopPropagation()}
                onWheel={handleWheel}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Left arrow */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onPrev(); }}
                        className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        aria-label="Ảnh trước"
                    >
                        <ChevronLeft className="w-7 h-7" />
                    </button>
                )}

                <div
                    className="relative transition-transform duration-200"
                    style={{
                        transform: `scale(${zoom}) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
                        cursor: zoom > 1 ? 'grab' : 'default'
                    }}
                >
                    <img
                        src={images[currentIndex].sourceUrl}
                        alt={images[currentIndex].altText || name}
                        className="max-h-[75vh] max-w-[85vw] object-contain select-none"
                        draggable={false}
                    />
                </div>

                {/* Right arrow */}
                {images.length > 1 && (
                    <button
                        onClick={(e) => { e.stopPropagation(); onNext(); }}
                        className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center text-white transition-colors"
                        aria-label="Ảnh tiếp"
                    >
                        <ChevronRight className="w-7 h-7" />
                    </button>
                )}
            </div>

            {/* Bottom bar: zoom controls + thumbnails */}
            <div
                className="shrink-0 bg-black/60 px-4 pt-3 pb-4"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Zoom controls */}
                <div className="flex items-center justify-center gap-3 mb-3">
                    <button
                        onClick={() => { setZoom(z => { const nz = Math.max(z / 1.5, 1); if (nz === 1) setPosition({ x: 0, y: 0 }); return nz; }); }}
                        disabled={zoom <= 1}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-colors"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-white/70 text-xs min-w-[44px] text-center">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom(z => Math.min(z * 1.5, 4))}
                        disabled={zoom >= 4}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 flex items-center justify-center text-white transition-colors"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>
                </div>

                {/* Thumbnail strip */}
                {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto justify-center" style={{ scrollbarWidth: 'none' }}>
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => { onGoTo(idx); resetZoom(); }}
                                className={`relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden border-2 transition-all ${
                                    idx === currentIndex ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
                                }`}
                            >
                                <img src={img.sourceUrl} alt="" className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    , document.body);
}

export function ProductGallery({ mainImage, galleryNodes, name, salePrice, regularPrice }: ProductGalleryProps) {
    const allImages = [mainImage, ...galleryNodes].filter(img => img?.sourceUrl);
    const [activeIndex, setActiveIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
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
        // Run in rAF to avoid forced reflow during render/commit
        requestAnimationFrame(() => {
            if (!container) return;
            // Each thumb is 96px + 10px gap (gap-2.5 = 10px)
            const THUMB_SIZE = 106;
            const targetTop = activeIndex * THUMB_SIZE - container.clientHeight / 2 + THUMB_SIZE / 2;
            container.scrollTop = Math.max(0, Math.min(targetTop, container.scrollHeight - container.clientHeight));
        });
    }, [activeIndex]);

    // Scroll horizontal mobile thumbs – use scrollLeft directly
    useEffect(() => {
        const container = mobileThumbRef.current;
        if (!container) return;
        requestAnimationFrame(() => {
            if (!container) return;
            const THUMB_SIZE = 64; // w-14 h-14 = 56px + gap-2 = 8px = 64
            const targetLeft = activeIndex * THUMB_SIZE - container.clientWidth / 2 + THUMB_SIZE / 2;
            container.scrollLeft = Math.max(0, Math.min(targetLeft, container.scrollWidth - container.clientWidth));
        });
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
                onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                className={`absolute left-2 top-1/2 -translate-y-1/2 z-10 ${mobile ? "w-8 h-8" : "w-10 h-10 opacity-0 group-hover:opacity-100"} rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all`}
            ><ChevronLeft className={mobile ? "w-4 h-4" : "w-5 h-5"} /></button>
            <button
                onClick={(e) => { e.stopPropagation(); goToNext(); }}
                className={`absolute right-2 top-1/2 -translate-y-1/2 z-10 ${mobile ? "w-8 h-8" : "w-10 h-10 opacity-0 group-hover:opacity-100"} rounded-full bg-white/90 shadow-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-all`}
            ><ChevronRight className={mobile ? "w-4 h-4" : "w-5 h-5"} /></button>
        </>
    );

    return (
        <>
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
                    className="relative flex-1 rounded-xl bg-white overflow-hidden border border-slate-100 group cursor-pointer"
                    onMouseEnter={() => { isHovering.current = true; }}
                    onMouseLeave={() => { isHovering.current = false; }}
                    onClick={() => setLightboxOpen(true)}
                >
                    {discountPercent > 0 && (
                        <div className="absolute top-4 left-4 z-10 pointer-events-none">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow">-{discountPercent}%</span>
                        </div>
                    )}
                    <Arrows />

                    {/* Slide track: chỉ render ảnh hiện tại, trước và sau để giảm DOM nodes */}
                    <div className="aspect-square overflow-hidden relative">
                        {allImages.map((img, idx) => {
                            const offset = idx - activeIndex;
                            // Chỉ render ảnh gần activeIndex (prev/current/next)
                            const isVisible = Math.abs(offset) <= 1;
                            return (
                                <div
                                    key={idx}
                                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                                    style={{
                                        transform: `translateX(${offset * 100}%)`,
                                        // Ẩn hết những ảnh xa, giúp trình duyệt không cần composite layer
                                        visibility: isVisible ? 'visible' : 'hidden',
                                    }}
                                    aria-hidden={!isVisible}
                                >
                                    {isVisible && (
                                        <Image
                                            src={img.sourceUrl}
                                            alt={img.altText || name}
                                            fill
                                            className="object-contain p-6"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                                            priority={idx === 0}
                                            fetchPriority={idx === 0 ? "high" : "auto"}
                                        />
                                    )}
                                </div>
                            );
                        })}
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

                    {/* Slide track mobile — tương tự: chỉ render prev/current/next */}
                    <div className="aspect-square overflow-hidden relative">
                        {allImages.map((img, idx) => {
                            const offset = idx - activeIndex;
                            const isVisible = Math.abs(offset) <= 1;
                            return (
                                <div
                                    key={idx}
                                    className="absolute inset-0 transition-transform duration-500 ease-in-out"
                                    style={{
                                        transform: `translateX(${offset * 100}%)`,
                                        visibility: isVisible ? 'visible' : 'hidden',
                                    }}
                                    aria-hidden={!isVisible}
                                >
                                    {isVisible && (
                                        <Image
                                            src={img.sourceUrl}
                                            alt={img.altText || name}
                                            fill
                                            className="object-contain p-4"
                                            sizes="(max-width: 768px) 100vw, 50vw"
                                            priority={idx === 0}
                                            fetchPriority={idx === 0 ? "high" : "auto"}
                                        />
                                    )}
                                </div>
                            );
                        })}
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

        {lightboxOpen && (
            <Lightbox
                images={allImages}
                currentIndex={activeIndex}
                onClose={() => setLightboxOpen(false)}
                onPrev={goToPrev}
                onNext={goToNext}
                onGoTo={goTo}
                name={name}
            />
        )}
        </>
    );
}
