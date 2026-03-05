"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Star, ThumbsUp, SendHorizontal, ChevronDown, ChevronUp } from "lucide-react";

interface Review {
    id: number;
    reviewer: string;
    review: string;
    rating: number;
    date: string;
    verified: boolean;
}

interface ProductReviewsProps {
    productId: number;
    productName?: string;
}

function StarRating({ value, onChange, readonly = false, size = "md" }: {
    value: number;
    onChange?: (v: number) => void;
    readonly?: boolean;
    size?: "sm" | "md" | "lg";
}) {
    const [hovered, setHovered] = useState(0);
    const sizes = { sm: "w-3.5 h-3.5", md: "w-5 h-5", lg: "w-7 h-7" };

    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    disabled={readonly}
                    onClick={() => onChange?.(star)}
                    onMouseEnter={() => !readonly && setHovered(star)}
                    onMouseLeave={() => !readonly && setHovered(0)}
                    className={`${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
                >
                    <Star
                        className={`${sizes[size]} transition-colors ${star <= (hovered || value)
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                            }`}
                    />
                </button>
            ))}
        </div>
    );
}

function ReviewAvatar({ name }: { name: string }) {
    const initials = name.trim().split(" ").slice(-2).map(w => w[0]?.toUpperCase()).join("");
    const colors = [
        "from-blue-500 to-indigo-600",
        "from-red-500 to-pink-600",
        "from-green-500 to-emerald-600",
        "from-amber-500 to-orange-600",
        "from-purple-500 to-violet-600",
        "from-teal-500 to-cyan-600",
    ];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
            {initials || "?"}
        </div>
    );
}

function RatingBar({ stars, count, total }: { stars: number; count: number; total: number }) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600 w-4 text-right font-medium">{stars}</span>
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 flex-shrink-0" />
            <div className="flex-1 bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                    className="h-2 bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-700"
                    style={{ width: `${pct}%` }}
                />
            </div>
            <span className="text-slate-400 w-6 text-right text-xs">{count}</span>
        </div>
    );
}

const REVIEW_LABELS: Record<number, string> = {
    1: "Tệ", 2: "Không tốt", 3: "Bình thường", 4: "Tốt", 5: "Xuất sắc"
};

export function ProductReviews({ productId, productName }: ProductReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [showAll, setShowAll] = useState(false);

    // Form state
    const [formRating, setFormRating] = useState(5);
    const [formName, setFormName] = useState("");
    const [formEmail, setFormEmail] = useState("");
    const [formReview, setFormReview] = useState("");
    const [formError, setFormError] = useState("");

    const fetchReviews = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/reviews?productId=${productId}`);
            const json = await res.json();
            setReviews(json.reviews || []);
        } catch {
            setReviews([]);
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => { fetchReviews(); }, [fetchReviews]);

    // Stats
    const total = reviews.length;
    const avgRating = total > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / total : 0;
    const breakdown = [5, 4, 3, 2, 1].map(s => ({ stars: s, count: reviews.filter(r => r.rating === s).length }));
    const displayedReviews = showAll ? reviews : reviews.slice(0, 4);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError("");
        if (!formName.trim()) { setFormError("Vui lòng nhập tên của bạn."); return; }
        if (!formReview.trim() || formReview.length < 10) { setFormError("Nhận xét phải có ít nhất 10 ký tự."); return; }

        setSubmitting(true);
        try {
            const res = await fetch("/api/reviews", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    reviewer: formName.trim(),
                    reviewerEmail: formEmail.trim(),
                    review: formReview.trim(),
                    rating: formRating,
                }),
            });
            const json = await res.json();
            if (!res.ok) { setFormError(json.error || "Gửi thất bại, thử lại."); return; }
            setSubmitted(true);
            setShowForm(false);
            fetchReviews();
        } catch {
            setFormError("Lỗi kết nối, vui lòng thử lại.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-amber-400 rounded-full inline-block" />
                    Đánh giá sản phẩm
                    {total > 0 && <span className="text-slate-400 text-sm font-normal">({total} đánh giá)</span>}
                </h2>
                {!showForm && !submitted && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="text-sm font-semibold text-white bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5"
                    >
                        <Star className="w-3.5 h-3.5" />
                        Viết đánh giá
                    </button>
                )}
            </div>

            {/* Rating Overview */}
            {!loading && total > 0 && (
                <div className="flex gap-6 md:gap-10 mb-8 p-5 bg-amber-50 border border-amber-100 rounded-2xl">
                    {/* Avg */}
                    <div className="flex flex-col items-center justify-center text-center flex-shrink-0">
                        <span className="text-5xl font-black text-amber-500 leading-none">{avgRating.toFixed(1)}</span>
                        <StarRating value={Math.round(avgRating)} readonly size="sm" />
                        <span className="text-xs text-slate-400 mt-1">{total} đánh giá</span>
                    </div>
                    {/* Bars */}
                    <div className="flex-1 space-y-1.5">
                        {breakdown.map(({ stars, count }) => (
                            <RatingBar key={stars} stars={stars} count={count} total={total} />
                        ))}
                    </div>
                </div>
            )}

            {/* Write Review Form */}
            {showForm && (
                <div className="mb-8 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        Chia sẻ trải nghiệm của bạn
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Star picker */}
                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Đánh giá của bạn</label>
                            <div className="flex items-center gap-3">
                                <StarRating value={formRating} onChange={setFormRating} size="lg" />
                                {formRating > 0 && (
                                    <span className="text-sm font-semibold text-amber-600">{REVIEW_LABELS[formRating]}</span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Họ tên *</label>
                                <input
                                    type="text"
                                    value={formName}
                                    onChange={e => setFormName(e.target.value)}
                                    placeholder="Nguyễn Văn A"
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Email <span className="text-slate-300">(không bắt buộc)</span></label>
                                <input
                                    type="email"
                                    value={formEmail}
                                    onChange={e => setFormEmail(e.target.value)}
                                    placeholder="email@example.com"
                                    className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5 block">Nhận xét *</label>
                            <textarea
                                value={formReview}
                                onChange={e => setFormReview(e.target.value)}
                                rows={4}
                                placeholder="Chia sẻ cảm nhận của bạn về sản phẩm này..."
                                className="w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-none"
                            />
                            <div className="text-right text-xs text-slate-300 mt-1">{formReview.length} ký tự</div>
                        </div>

                        {formError && (
                            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
                                {formError}
                            </div>
                        )}

                        <div className="flex gap-2 pt-1">
                            <button type="submit" disabled={submitting}
                                className="flex items-center gap-2 bg-amber-400 hover:bg-amber-500 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors disabled:opacity-60">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <SendHorizontal className="w-4 h-4" />}
                                {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)}
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                Hủy
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Success message */}
            {submitted && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-medium flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 flex-shrink-0" />
                    Cảm ơn bạn đã đánh giá! Đánh giá của bạn sẽ được hiển thị sau khi được duyệt.
                </div>
            )}

            {/* Reviews List */}
            {loading ? (
                <div className="flex items-center justify-center py-12 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm">Đang tải đánh giá...</span>
                </div>
            ) : total === 0 ? (
                <div className="text-center py-12">
                    <div className="text-4xl mb-3">⭐</div>
                    <p className="text-slate-500 font-medium">Chưa có đánh giá nào</p>
                    <p className="text-slate-400 text-sm mt-1">Hãy là người đầu tiên đánh giá sản phẩm này!</p>
                    {!showForm && (
                        <button onClick={() => setShowForm(true)}
                            className="mt-4 text-sm font-semibold text-amber-600 hover:underline">
                            Viết đánh giá ngay →
                        </button>
                    )}
                </div>
            ) : (
                <div className="space-y-5">
                    {displayedReviews.map((review, idx) => (
                        <div key={review.id} className={`flex gap-4 pb-5 ${idx < displayedReviews.length - 1 ? "border-b border-slate-100" : ""}`}>
                            <ReviewAvatar name={review.reviewer} />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1.5">
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold text-slate-800 text-sm">{review.reviewer}</span>
                                            {review.verified && (
                                                <span className="text-[10px] text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">
                                                    ✓ Đã mua hàng
                                                </span>
                                            )}
                                        </div>
                                        <StarRating value={review.rating} readonly size="sm" />
                                    </div>
                                    <time className="text-xs text-slate-400 flex-shrink-0">
                                        {new Date(review.date).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}
                                    </time>
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed">{review.review}</p>
                            </div>
                        </div>
                    ))}

                    {total > 4 && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full py-2.5 text-sm font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                        >
                            {showAll ? (<><ChevronUp className="w-4 h-4" /> Thu gọn</>) : (<><ChevronDown className="w-4 h-4" /> Xem tất cả {total} đánh giá</>)}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
