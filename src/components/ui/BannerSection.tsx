"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Cpu, Sparkles, MonitorPlay, Mouse, Keyboard, Headphones, Monitor } from "lucide-react";
import Image from "next/image";

import { BannerConfig } from "@/app/actions/configActions";

export function BannerSection({ config }: { config: BannerConfig }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        if (!config?.mainBanners?.length) return;
        setCurrentIndex((prev) => (prev + 1) % config.mainBanners.length);
    }, [config?.mainBanners?.length]);

    const prevSlide = () => {
        if (!config?.mainBanners?.length) return;
        setCurrentIndex((prev) => (prev - 1 + config.mainBanners.length) % config.mainBanners.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    useEffect(() => {
        if (!isHovered) {
            const timer = setInterval(nextSlide, 5000);
            return () => clearInterval(timer);
        }
    }, [isHovered, nextSlide]);

    return (
        <div className="w-full flex flex-col items-center">
            {/* Main Slider Banner (Full Width effect) */}
            <section 
                className="relative w-full max-w-[1920px] mx-auto aspect-[16/7] md:aspect-[21/7] lg:h-[590px] overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Slider Track */}
                <div 
                    className="w-full h-full flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {config?.mainBanners?.map((banner, idx) => (
                        <div key={banner.id || idx} className="w-full h-full flex-shrink-0 relative">
                            <Link href={banner.link || "#"} className="block w-full h-full">
                                {/* Background Image */}
                                <div 
                                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                                    style={{ backgroundImage: `url(${banner.image})` }}
                                >
                                </div>
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
                    {config?.mainBanners?.map((_, idx) => (
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

            {/* 4 Small Banners below - Ẩn trên mobile */}
            {config?.smallBanners?.length > 0 && config.showSmallBanners !== false && (
                <section className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 md:-mt-6 lg:-mt-10 relative z-30 mb-8 hidden md:block">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {config.smallBanners.map((banner, idx) => (
                            <Link href={banner.link || "#"} key={banner.id || idx} className="block group">
                                <div className="relative aspect-[4/3] md:h-[220px] md:aspect-auto rounded-xl md:rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:-translate-x-[150%] group-hover:after:translate-x-[150%] after:transition-transform after:duration-1000 after:ease-in-out">
                                    <div 
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${banner.image})` }}
                                    ></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
