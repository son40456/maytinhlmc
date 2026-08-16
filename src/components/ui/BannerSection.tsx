/**
 * BannerSection — Server Component
 *
 * P2 Fix: Không còn "use client" — render HTML hoàn toàn phía server.
 *
 * Chiến lược LCP:
 * 1. Prerender ảnh banner đầu tiên (100vw, priority) thành HTML ngay trong SSR response.
 *    → Googlebot và browser thấy ảnh ngay, không phải chờ JS hydrate.
 * 2. Emit <link rel="preload"> cho ảnh hero thông qua Next.js Image priority prop.
 * 3. BannerSlider (Client Component) chỉ hydrate sau — quản lý autoplay, navigation, dots.
 * 4. Small banners (4 ảnh bên dưới) render server-side hoàn toàn.
 */

import Link from "next/link";
import Image from "next/image";
import { BannerConfig } from "@/app/actions/configActions";
import { BannerSlider } from "./BannerSlider";

export function BannerSection({ config }: { config: BannerConfig }) {
    if (!config?.mainBanners?.length) {
        return null;
    }

    return (
        <div className="w-full flex flex-col items-center">
            {/* Main Slider — Client Component hydrate sau, nhưng HTML frame đã có từ server */}
            <BannerSlider banners={config.mainBanners} />

            {/* 4 Small Banners — Server Component thuần, không JS */}
            {config?.smallBanners?.length > 0 && config.showSmallBanners !== false && (
                <section className="container mx-auto px-4 md:-mt-6 lg:-mt-10 relative z-30 mb-8 hidden md:block">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {config.smallBanners.map((banner, idx) => (
                            <Link href={banner.link || "#"} key={banner.id || idx} className="block group">
                                <div className="relative aspect-[4/3] md:h-[220px] md:aspect-auto rounded-xl md:rounded-2xl overflow-hidden shadow-xl border-2 border-white/20 transform transition-transform duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/30 after:to-transparent after:-translate-x-[150%] group-hover:after:translate-x-[150%] after:transition-transform after:duration-1000 after:ease-in-out">
                                    {/* Dùng next/image thay vì background-image để có lazy loading và LCP hint đúng */}
                                    <Image
                                        src={banner.image}
                                        alt={banner.title || `Small banner ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 1024px) 50vw, 25vw"
                                        quality={80}
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
