"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Cpu, Sparkles, MonitorPlay } from "lucide-react";

// Mock data cho banner
const BANNERS = [
    {
        id: 1,
        title: "Nâng Tầm Trải Nghiệm Công Nghệ",
        subtitle: "Săn deal công nghệ siêu hot mỗi ngày. Tận hưởng trải nghiệm mua sắm nhanh chóng, tiện lợi qua hệ thống Next.js siêu tốc.",
        image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?q=80&w=2000&auto=format&fit=crop", // Hi-tech gaming setup
        primaryCTA: { label: "Khám phá ngay", link: "/category/all" },
        secondaryCTA: { label: "Sản phẩm Sale", link: "/sale" },
        icon: <Cpu className="w-12 h-12 text-blue-400 mb-4" />,
        gradient: "from-blue-900/90 via-slate-900/80 to-transparent",
    },
    {
        id: 2,
        title: "Tự Do Build PC Theo Cách Của Bạn",
        subtitle: "Hàng ngàn linh kiện chính hãng, tương thích 100%. Công cụ xây dựng cấu hình chuyên nghiệp, dễ sử dụng nhất.",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2000&auto=format&fit=crop", // PC Hardware
        primaryCTA: { label: "Xây dựng ngay", link: "/pc-builder" },
        secondaryCTA: { label: "Xem cấu hình mẫu", link: "/category/pc-lap-rap" },
        icon: <MonitorPlay className="w-12 h-12 text-purple-400 mb-4" />,
        gradient: "from-purple-900/90 via-slate-900/80 to-transparent",
    },
    {
        id: 3,
        title: "Bảo Hành Tốc Độ - Hỗ Trợ Tận Tâm",
        subtitle: "Cam kết bảo hành chính hãng, hỗ trợ kỹ thuật 24/7. Trải nghiệm dịch vụ hậu mãi đẳng cấp.",
        image: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop", // Tech support / Circuit
        primaryCTA: { label: "Tra cứu bảo hành", link: "http://baohanh.maytinhlmc.vn" },
        secondaryCTA: { label: "Liên hệ ngay", link: "/lien-he" },
        icon: <Sparkles className="w-12 h-12 text-yellow-400 mb-4" />,
        gradient: "from-indigo-900/90 via-slate-900/80 to-transparent",
    }
];

export function BannerSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % BANNERS.length);
    }, []);

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + BANNERS.length) % BANNERS.length);
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
        <section 
            className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden group rounded-none md:rounded-2xl"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Slider Track */}
            <div 
                className="w-full h-full flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {BANNERS.map((banner, idx) => (
                    <div key={banner.id} className="w-full h-full flex-shrink-0 relative">
                        {/* Background Image */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${banner.image})` }}
                        >
                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-r ${banner.gradient}`}></div>
                        </div>

                        {/* Content */}
                        <div className="absolute inset-0 flex items-center justify-start">
                            <div className="container mx-auto px-6 sm:px-10 lg:px-16 w-full">
                                <div className="max-w-2xl transform transition-all duration-700 delay-100 opacity-0 translate-y-8" 
                                     style={currentIndex === idx ? { opacity: 1, transform: 'translateY(0)' } : {}}>
                                    
                                    {banner.icon}
                                    
                                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-4 tracking-tight drop-shadow-md">
                                        {banner.title}
                                    </h1>
                                    
                                    <p className="text-sm md:text-lg lg:text-xl text-gray-200 mb-8 max-w-xl font-medium drop-shadow leading-relaxed">
                                        {banner.subtitle}
                                    </p>
                                    
                                    <div className="flex flex-wrap gap-4">
                                        <Link href={banner.primaryCTA.link}>
                                            <button className="px-6 py-3 md:px-8 md:py-4 bg-white text-slate-900 font-bold rounded-xl hover:bg-yellow-400 hover:text-blue-900 hover:shadow-[0_0_20px_rgba(250,204,21,0.5)] transition-all duration-300">
                                                {banner.primaryCTA.label}
                                            </button>
                                        </Link>
                                        {banner.secondaryCTA && (
                                            <Link href={banner.secondaryCTA.link}>
                                                <button className="px-6 py-3 md:px-8 md:py-4 bg-white/10 backdrop-blur-md text-white border border-white/30 font-bold rounded-xl hover:bg-white/20 transition-all duration-300">
                                                    {banner.secondaryCTA.label}
                                                </button>
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40 hover:scale-110"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-black/40 hover:scale-110"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Pagination Dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {BANNERS.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`transition-all duration-300 rounded-full ${
                            currentIndex === idx 
                                ? "w-8 h-2 bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]" 
                                : "w-2 h-2 bg-white/50 hover:bg-white/80"
                        }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </section>
    );
}
