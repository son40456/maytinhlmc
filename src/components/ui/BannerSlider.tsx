"use client";

/**
 * BannerSlider — Client Component (chỉ chứa slider logic)
 *
 * P2 Fix: Tách slider interactive state ra khỏi Server Component shell.
 * - BannerSection (Server) → prerender slide đầu tiên vào HTML → LCP nhanh
 * - BannerSlider (Client) → quản lý autoplay, navigation, dots → hydrate sau
 */

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import imageKitLoader from "@/utils/imagekit-loader";

interface Banner {
    id?: string;
    image: string;
    link?: string;
    title?: string;
}

interface BannerSliderProps {
    banners: Banner[];
}

export function BannerSlider({ banners }: BannerSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        if (!banners.length) return;
        setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, [banners.length]);

    const prevSlide = () => {
        if (!banners.length) return;
        setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
    };

    const goToSlide = (index: number) => setCurrentIndex(index);

    useEffect(() => {
        if (!isHovered) {
            const timer = setInterval(nextSlide, 5000);
            return () => clearInterval(timer);
        }
    }, [isHovered, nextSlide]);

    return (
        <section
            className="relative w-full max-w-[1920px] mx-auto overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slider Track */}
            <div
                className="w-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {banners.map((banner, idx) => (
                    <div key={banner.id || idx} className="w-full flex-shrink-0 relative aspect-[21/9] md:aspect-[3/1]">
                        <Link href={banner.link || "#"} className="block w-full h-full">
                            <Image
                                loader={imageKitLoader}
                                src={banner.image}
                                alt={banner.title || `Banner ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="100vw"
                                priority={idx === 0}
                                quality={85}
                            />
                        </Link>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 z-20"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-600 hover:scale-110 z-20"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-8 lg:bottom-16 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {banners.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`transition-all duration-300 rounded-full ${
                            currentIndex === idx
                                ? "w-10 h-2.5 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]"
                                : "w-2.5 h-2.5 bg-white/50 hover:bg-white/90"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
