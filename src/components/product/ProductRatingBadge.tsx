"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

interface ProductRatingBadgeProps {
    productId: number;
    sku?: string | null;
}

export function ProductRatingBadge({ productId, sku }: ProductRatingBadgeProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        let cancelled = false;
        fetch(`/api/reviews?productId=${productId}`)
            .then(r => r.json())
            .then(json => {
                if (cancelled || !json.reviews?.length) return;
                const avg = json.reviews.reduce((s: number, r: any) => s + r.rating, 0) / json.reviews.length;
                if (!cancelled) { setRating(avg); setCount(json.reviews.length); }
            })
            .catch(() => { });
        return () => { cancelled = true; };
    }, [productId]);

    return (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500 border-b border-slate-100 pb-3">
            {sku && (
                <>
                    <span>
                        Mã SP: <span className="text-blue-600 font-semibold">{sku}</span>
                    </span>
                    <span className="text-slate-200 hidden sm:inline">|</span>
                </>
            )}
            <a href="#reviews" className="flex items-center gap-1 hover:text-amber-500 transition-colors">
                <span className="text-slate-500">Đánh giá:</span>
                <span className="flex">
                    {[1, 2, 3, 4, 5].map(s => (
                        <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= Math.round(rating ?? 0)
                                ? "fill-amber-400 text-amber-400"
                                : "fill-slate-200 text-slate-200"
                                }`}
                        />
                    ))}
                </span>
                {count > 0 && <span className="text-xs text-blue-600">({count})</span>}
            </a>
        </div>
    );
}
