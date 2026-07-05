"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Cpu, Sparkles, MonitorPlay, Mouse, Keyboard, Headphones, Monitor } from "lucide-react";
import Image from "next/image";

// Mock data cho banner chính (Chỉ cần ảnh)
const MAIN_BANNERS = [
    {
        id: 1,
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=2000&auto=format&fit=crop", // Hi-tech gaming setup
        link: "/category/all",
    },
    {
        id: 2,
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2000&auto=format&fit=crop", // PC Hardware
        link: "/pc-builder",
    },
    {
        id: 3,
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop", // Tech support
        link: "http://baohanh.maytinhlmc.vn",
    }
];

// Mock data cho 4 banner nhỏ phía dưới
const SMALL_BANNERS = [
    {
        id: 1,
        title: "MÀN HÌNH",
        subtitle: "GAMING - ĐỒ HỌA",
        price: "1.550K",
        link: "/category/man-hinh",
        image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop", // Monitor
        bgClass: "bg-blue-600",
        icon: <Monitor className="w-6 h-6 mb-1" />
    },
    {
        id: 2,
        title: "PHỤ KIỆN GAMING",
        subtitle: "ĐỒ XỊN GIÁ MÁT",
        price: "75K",
        link: "/category/phu-kien",
        image: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?q=80&w=600&auto=format&fit=crop", // Keyboard/Mouse
        bgClass: "bg-teal-500",
        icon: <Headphones className="w-6 h-6 mb-1" />
    },
    {
        id: 3,
        title: "BỘ PC",
        subtitle: "PC NGON GIÁ MÁT",
        price: "6 TRIỆU",
        link: "/category/pc-lap-rap",
        image: "https://images.unsplash.com/photo-1587202372585-b892a013d395?q=80&w=600&auto=format&fit=crop", // PC case
        bgClass: "bg-sky-500",
        icon: <Cpu className="w-6 h-6 mb-1" />
    },
    {
        id: 4,
        title: "CÁCH BUILD PC",
        subtitle: "TỐI ƯU MÙA HÈ",
        price: "XEM NGAY",
        link: "/pc-builder",
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=600&auto=format&fit=crop", // Parts
        bgClass: "bg-yellow-500",
        icon: <Sparkles className="w-6 h-6 mb-1" />
    }
];

export function BannerSection() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % MAIN_BANNERS.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + MAIN_BANNERS.length) % MAIN_BANNERS.length);
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
                className="relative w-full max-w-[1920px] mx-auto aspect-[16/7] md:aspect-[21/7] lg:h-[500px] overflow-hidden group"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Slider Track */}
                <div 
                    className="w-full h-full flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {MAIN_BANNERS.map((banner, idx) => (
                        <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
                            <Link href={banner.link} className="block w-full h-full">
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
                    {MAIN_BANNERS.map((_, idx) => (
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
            <section className="w-full max-w-[1920px] mx-auto px-2 sm:px-4 lg:px-8 md:-mt-6 lg:-mt-10 relative z-30 mb-8 hidden md:block">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                    {SMALL_BANNERS.map((banner) => (
                        <Link href={banner.link} key={banner.id} className="block group">
                            <div className={`relative h-[120px] md:h-[160px] rounded-xl md:rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl ${banner.bgClass}`}>
                                {/* Background Image */}
                                <div className="absolute inset-0 mix-blend-overlay opacity-60 group-hover:scale-110 transition-transform duration-500">
                                    <div 
                                        className="w-full h-full bg-cover bg-center"
                                        style={{ backgroundImage: `url(${banner.image})` }}
                                    ></div>
                                </div>
                                
                                {/* Gradient Overlay for text readability */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

                                {/* Content */}
                                <div className="absolute inset-0 p-3 md:p-4 flex flex-col justify-end text-white">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-[10px] md:text-xs font-bold text-yellow-300 tracking-wider uppercase mb-0.5 md:mb-1">
                                                {banner.subtitle}
                                            </div>
                                            <h3 className="text-sm md:text-lg font-black leading-tight mb-1">
                                                {banner.title}
                                            </h3>
                                            <div className="inline-block bg-yellow-400 text-red-700 font-extrabold text-xs md:text-sm px-2 py-0.5 md:px-3 md:py-1 rounded-full whitespace-nowrap">
                                                {banner.price}
                                            </div>
                                        </div>
                                        <div className="hidden sm:block opacity-50 group-hover:opacity-100 group-hover:scale-125 transition-all duration-300 transform origin-bottom-right">
                                            {banner.icon}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
