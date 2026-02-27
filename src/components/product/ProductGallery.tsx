"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";

interface ProductGalleryProps {
    mainImage: {
        sourceUrl: string;
        altText?: string;
    };
    galleryNodes: Array<{
        sourceUrl: string;
        altText?: string;
    }>;
    name: string;
    salePrice?: string;
    regularPrice?: string;
}

export function ProductGallery({ mainImage, galleryNodes, name, salePrice, regularPrice }: ProductGalleryProps) {
    const allImages = [mainImage, ...galleryNodes].filter(img => img?.sourceUrl);
    const [activeIndex, setActiveIndex] = useState(0);
    const activeImage = allImages[activeIndex];
    const thumbContainerRef = useRef<HTMLDivElement>(null);

    // Calculate Discount Percent
    const numericRegular = regularPrice ? parseInt(regularPrice.replace(/\D/g, ''), 10) : 0;
    const numericSale = salePrice ? parseInt(salePrice.replace(/\D/g, ''), 10) : 0;
    const discountPercent = numericRegular > numericSale && numericSale > 0
        ? Math.round(((numericRegular - numericSale) / numericRegular) * 100)
        : 0;

    // Scroll active thumbnail into view
    useEffect(() => {
        if (thumbContainerRef.current) {
            const activeThumb = thumbContainerRef.current.children[activeIndex] as HTMLElement;
            if (activeThumb) {
                activeThumb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [activeIndex]);

    const scrollThumbs = (direction: 'up' | 'down') => {
        if (thumbContainerRef.current) {
            const scrollAmount = 88; // thumb height + gap
            thumbContainerRef.current.scrollBy({
                top: direction === 'up' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (!activeImage?.sourceUrl) {
        return (
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-200 shadow-inner">
                Không có hình ảnh
            </div>
        );
    }

    return (
        <div className="flex gap-4 lg:gap-6">
            {/* Vertical Thumbnails (Left Side) */}
            {allImages.length > 1 && (
                <div className="flex flex-col items-center gap-2 shrink-0">
                    {/* Scroll Up Button */}
                    {allImages.length > 5 && (
                        <button
                            onClick={() => scrollThumbs('up')}
                            className="w-[72px] h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-slate-50"
                        >
                            <ChevronUp className="w-4 h-4" />
                        </button>
                    )}

                    {/* Thumbnail List */}
                    <div
                        ref={thumbContainerRef}
                        className="flex flex-col gap-3 max-h-[480px] overflow-y-auto scrollbar-hide"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {allImages.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveIndex(idx)}
                                className={`relative w-[72px] h-[72px] rounded-lg overflow-hidden border-2 transition-all duration-200 bg-white shrink-0 ${activeIndex === idx
                                    ? "border-blue-600 shadow-md"
                                    : "border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                                    }`}
                            >
                                <Image
                                    src={img.sourceUrl}
                                    alt={img.altText || `${name} thumbnail ${idx}`}
                                    fill
                                    className="object-cover p-1"
                                    sizes="72px"
                                />
                            </button>
                        ))}
                    </div>

                    {/* Scroll Down Button */}
                    {allImages.length > 5 && (
                        <button
                            onClick={() => scrollThumbs('down')}
                            className="w-[72px] h-6 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors rounded hover:bg-slate-50"
                        >
                            <ChevronDown className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}

            {/* Main Image */}
            <div className="relative flex-1 rounded-xl bg-white flex items-center justify-center overflow-hidden border border-slate-100">
                {discountPercent > 0 && (
                    <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-sm shadow">
                            -{discountPercent}%
                        </span>
                    </div>
                )}

                <div className="relative w-full aspect-square">
                    <Image
                        src={activeImage.sourceUrl}
                        alt={activeImage.altText || name}
                        fill
                        className="object-contain p-6 transition-transform duration-500 hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 50vw"
                        priority
                    />
                </div>
            </div>
        </div>
    );
}
