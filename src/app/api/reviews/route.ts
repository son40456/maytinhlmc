import { NextRequest, NextResponse } from 'next/server';

const WP_BASE = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://next.maytinhlmc.vn';
const WC_KEY = process.env.WC_CONSUMER_KEY || '';
const WC_SECRET = process.env.WC_CONSUMER_SECRET || '';

const wcAuth = () => 'Basic ' + Buffer.from(`${WC_KEY}:${WC_SECRET}`).toString('base64');

/** GET /api/reviews?productId=123 */
export async function GET(req: NextRequest) {
    const productId = req.nextUrl.searchParams.get('productId');
    if (!productId) return NextResponse.json({ reviews: [] });

    try {
        const url = `${WP_BASE}/wp-json/wc/v3/products/${productId}/reviews?per_page=50&status=approved`;
        const res = await fetch(url, {
            headers: { Authorization: wcAuth() },
            next: { revalidate: 60 }, // cache 60s
        });
        if (!res.ok) return NextResponse.json({ reviews: [] });
        const data = await res.json();

        const reviews = (data || []).map((r: any) => ({
            id: r.id,
            reviewer: r.reviewer,
            reviewerEmail: r.reviewer_email,
            review: r.review?.replace(/<[^>]*>/g, '').trim(),
            rating: r.rating,
            date: r.date_created,
            verified: r.verified,
        }));

        return NextResponse.json({ reviews });
    } catch {
        return NextResponse.json({ reviews: [] });
    }
}

/** POST /api/reviews  body: { productId, reviewer, reviewerEmail, review, rating } */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId, reviewer, reviewerEmail, review, rating } = body;

        if (!productId || !reviewer || !review || !rating) {
            return NextResponse.json({ error: 'Thiếu thông tin bắt buộc' }, { status: 400 });
        }

        const url = `${WP_BASE}/wp-json/wc/v3/products/${productId}/reviews`;
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                Authorization: wcAuth(),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                product_id: productId,
                reviewer,
                reviewer_email: reviewerEmail || `${reviewer.toLowerCase().replace(/\s+/g, '')}@guest.local`,
                review,
                rating: Number(rating),
                status: 'approved',
            }),
        });

        if (!res.ok) {
            const err = await res.json();
            return NextResponse.json({ error: err.message || 'Gửi thất bại' }, { status: 400 });
        }

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[reviews POST]', err);
        return NextResponse.json({ error: 'Lỗi server' }, { status: 500 });
    }
}
