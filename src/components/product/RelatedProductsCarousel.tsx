"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";

interface RelatedProduct {
    id: string;
    slug: string;
    name: string;
    price?: string;
    regularPrice?: string;
    salePrice?: string;
    sku?: string;
    image?: { sourceUrl: string; altText?: string };
}

interface RelatedProductsCarouselProps {
    products: RelatedProduct[];
}

function parseVND(s: string) {
    return parseInt(s?.replace(/[^\d]/g, "") || "0") || 0;
}

function cleanPrice(s: string) {
    return s?.replace(/&nbsp;/g, " ").trim() || "";
}

export function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const CARD_WIDTH = 240;
    const isHoveringCarousel = useRef(false);

    const updateScrollState = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    const scroll = (dir: "left" | "right") => {
        const el = trackRef.current;
        if (!el) return;
        const amount = CARD_WIDTH * 3;
        el.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
        setTimeout(updateScrollState, 350);
    };

    // Auto-scroll every 3.5s, wraps back to start
    useEffect(() => {
        if (products.length <= 3) return;
        const iv = setInterval(() => {
            if (isHoveringCarousel.current) return;
            const el = trackRef.current;
            if (!el) return;
            const atEnd = el.scrollLeft >= el.scrollWidth - el.clientWidth - 4;
            if (atEnd) {
                el.scrollTo({ left: 0, behavior: "smooth" });
            } else {
                el.scrollBy({ left: CARD_WIDTH, behavior: "smooth" });
            }
            setTimeout(updateScrollState, 400);
        }, 3500);
        return () => clearInterval(iv);
    }, [products.length, updateScrollState]);

    if (!products.length) return null;

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-red-500 rounded-full inline-block" />
                    Sản phẩm liên quan
                </h2>
                {/* Nav buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={() => scroll("left")}
                        disabled={!canScrollLeft}
                        aria-label="Trước"
                        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => scroll("right")}
                        disabled={!canScrollRight}
                        aria-label="Tiếp"
                        className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Slider track */}
            <div className="relative">
                {/* Left fade */}
                {canScrollLeft && (
                    <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none rounded-l-xl" />
                )}
                {/* Right fade */}
                {canScrollRight && (
                    <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none rounded-r-xl" />
                )}

                <div
                    ref={trackRef}
                    onScroll={updateScrollState}
                    onMouseEnter={() => { isHoveringCarousel.current = true; }}
                    onMouseLeave={() => { isHoveringCarousel.current = false; }}
                    className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {products.map((rp) => {
                        const rpSale = cleanPrice(rp.salePrice || "");
                        const rpRegular = cleanPrice(rp.regularPrice || "");
                        const rpDisplay = rpSale || cleanPrice(rp.price || "") || "Liên hệ";
                        const rpSaleNum = parseVND(rpSale);
                        const rpRegularNum = parseVND(rpRegular);
                        const hasDiscount = rpSaleNum > 0 && rpRegularNum > 0 && rpSaleNum < rpRegularNum;
                        const discountPct = hasDiscount ? Math.round((1 - rpSaleNum / rpRegularNum) * 100) : 0;

                        return (
                            <Link
                                key={rp.id}
                                href={`/${rp.slug}`}
                                className="group flex-shrink-0 w-56 flex flex-col rounded-xl border border-slate-100 bg-white hover:border-blue-200 hover:shadow-xl transition-all duration-300 overflow-hidden"
                                style={{ minWidth: "14rem" }}
                            >
                                {/* Image */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-slate-50">
                                    {rp.image?.sourceUrl ? (
                                        <Image
                                            src={rp.image.sourceUrl}
                                            alt={rp.name}
                                            fill
                                            className="object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                                            sizes="224px"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-200 text-5xl">📦</div>
                                    )}
                                    {/* Badge */}
                                    {hasDiscount && (
                                        <span className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-1">
                                            HOT
                                        </span>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-3 flex flex-col gap-1.5 flex-1">
                                    <p className="text-[13px] font-semibold text-slate-800 line-clamp-2 leading-snug group-hover:text-blue-700 transition-colors">
                                        {rp.name}
                                    </p>

                                    {/* Price */}
                                    <div className="mt-auto">
                                        <div className="flex items-baseline gap-1.5 flex-wrap">
                                            <span className="text-base font-black text-red-600 leading-none">{rpDisplay}</span>
                                            {hasDiscount && (
                                                <span className="text-[11px] text-slate-400 line-through leading-none">{rpRegular}</span>
                                            )}
                                        </div>
                                        {hasDiscount && (
                                            <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 bg-green-50 border border-green-200 rounded-full px-1.5 py-0.5 mt-1 font-semibold">
                                                <Tag className="w-2.5 h-2.5" />
                                                -{discountPct}%
                                            </span>
                                        )}
                                    </div>

                                    {/* View button */}
                                    <div className="mt-2 pt-2 border-t border-slate-100">
                                        <span className="block text-center text-xs font-semibold text-blue-600 group-hover:text-white group-hover:bg-blue-600 transition-all rounded-lg py-1.5 border border-blue-200 group-hover:border-blue-600">
                                            Xem chi tiết
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
