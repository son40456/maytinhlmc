"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BannerItem {
    id: string;
    image: string;
    link: string;
    title?: string;
}

interface CategoryBannersProps {
    banners: BannerItem[];
}

const TRANSITION_MS = 380;
const AUTOPLAY_MS = 3000;
// Số clone mỗi đầu — phải >= 2 để không bao giờ thấy khoảng trống
const CLONE = 2;

/**
 * Carousel 2-up, slide từng ảnh một, vòng lặp vô tận.
 * Mũi tên overlay bên trong banner, full width.
 *
 * Kỹ thuật:
 *  - Prepend CLONE ảnh cuối, append CLONE ảnh đầu.
 *  - Track width = nItems × 50% (mỗi item = 50% container).
 *  - Animate translateX, khi reach vùng clone → snap không animation.
 */
export function CategoryBanners({ banners }: CategoryBannersProps) {
    const N = banners.length;

    // ── 0 ảnh ──────────────────────────────────────────────────────────────
    if (!banners || N === 0) return null;

    // ── 1 ảnh → full width, không nav ──────────────────────────────────────
    if (N === 1) {
        return (
            <div className="mb-4 rounded-xl overflow-hidden shadow-sm">
                <BannerImg banner={banners[0]} />
            </div>
        );
    }

    // ── Build track với clones ──────────────────────────────────────────────
    const prepended = banners.slice(-CLONE);          // CLONE ảnh cuối
    const appended  = banners.slice(0, CLONE);         // CLONE ảnh đầu
    const items     = [...prepended, ...banners, ...appended];
    const nItems    = items.length;

    // idx = vị trí slide hiện tại trong `items` (bắt đầu ở CLONE = ảnh đầu tiên thật)
    const [idx, setIdx]         = useState(CLONE);
    const [animate, setAnimate] = useState(true);
    const busy = useRef(false);
    const isPaused = useRef(false); // pause khi hover

    // translateX tính theo % của track (track = nItems × 50% container)
    // mỗi item = 1/nItems track → dịch idx item = -(idx/nItems)*100%
    const tx = -(idx / nItems) * 100;

    // Sau mỗi lần đổi idx, kiểm tra có cần snap không
    useEffect(() => {
        const id = setTimeout(() => {
            if (idx >= CLONE + N) {
                // Đang ở vùng clone đầu → nhảy về ảnh thật tương ứng
                setAnimate(false);
                setIdx(idx - N);
            } else if (idx < CLONE) {
                // Đang ở vùng clone cuối → nhảy về ảnh thật tương ứng
                setAnimate(false);
                setIdx(idx + N);
            }
            busy.current = false;
        }, TRANSITION_MS);
        return () => clearTimeout(id);
    }, [idx, N]);

    // Khôi phục transition sau khi snap (cần 1 frame)
    useEffect(() => {
        if (!animate) {
            const id = requestAnimationFrame(() => setAnimate(true));
            return () => cancelAnimationFrame(id);
        }
    }, [animate]);

    // Auto-play mỗi AUTOPLAY_MS
    useEffect(() => {
        if (N <= 1) return;
        const id = setInterval(() => {
            if (!isPaused.current && !busy.current) {
                busy.current = true;
                setAnimate(true);
                setIdx(i => i + 1);
            }
        }, AUTOPLAY_MS);
        return () => clearInterval(id);
    }, [N]);

    const go = (dir: 1 | -1) => {
        if (busy.current) return;
        busy.current = true;
        setAnimate(true);
        setIdx(i => i + dir);
    };

    // Dots: vị trí thật trong mảng banners gốc
    const realIdx = ((idx - CLONE) % N + N) % N;

    return (
        <div
            className="relative mb-4 md:mb-5"
            onMouseEnter={() => { isPaused.current = true; }}
            onMouseLeave={() => { isPaused.current = false; }}
        >
            {/* ── Track container (overflow hidden = clip) ── */}
            <div className="overflow-hidden rounded-xl">
                <div
                    className="flex will-change-transform"
                    style={{
                        width: `${nItems * 50}%`,
                        transform: `translateX(${tx}%)`,
                        transition: animate
                            ? `transform ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`
                            : "none",
                    }}
                >
                    {items.map((banner, i) => (
                        <div
                            key={i}
                            style={{ width: `${100 / nItems}%` }}
                            className="flex-shrink-0 px-[3px] first:pl-0 last:pr-0 rounded-xl overflow-hidden"
                        >
                            <BannerImg banner={banner} />
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Mũi tên trái — overlay trong banner trái ── */}
            <button
                onClick={() => go(-1)}
                className="
                    absolute left-2 top-1/2 -translate-y-1/2 z-10
                    w-8 h-8 md:w-9 md:h-9
                    flex items-center justify-center
                    bg-black/35 hover:bg-black/60 backdrop-blur-sm
                    rounded-full text-white
                    transition-colors duration-150 select-none
                "
                aria-label="Ảnh trước"
            >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </button>

            {/* ── Mũi tên phải — overlay trong banner phải ── */}
            <button
                onClick={() => go(1)}
                className="
                    absolute right-2 top-1/2 -translate-y-1/2 z-10
                    w-8 h-8 md:w-9 md:h-9
                    flex items-center justify-center
                    bg-black/35 hover:bg-black/60 backdrop-blur-sm
                    rounded-full text-white
                    transition-colors duration-150 select-none
                "
                aria-label="Ảnh tiếp"
            >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
            </button>


        </div>
    );
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function BannerImg({ banner }: { banner: BannerItem }) {
    const img = (
        <div
            className="relative w-full overflow-hidden"
            style={{ aspectRatio: "790/260" }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                src={banner.image}
                alt={banner.title || "Category Banner"}
                className="w-full h-full object-cover"
                loading="lazy"
                draggable={false}
            />
        </div>
    );

    return banner.link
        ? <Link href={banner.link} className="block">{img}</Link>
        : <div>{img}</div>;
}
