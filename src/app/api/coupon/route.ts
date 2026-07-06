import { NextResponse } from 'next/server';

const COUPON_QUERY = `
  query GetCoupon($id: ID!) {
    coupon(id: $id, idType: CODE) {
      code
      amount
      discountType
      description
    }
  }
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code } = body;

        if (!code) {
            return NextResponse.json({ errors: [{ message: "Vui lòng nhập mã giảm giá" }] }, { status: 400 });
        }

        const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string;
        // API_URL is something like https://apiserver.maytinhlmc.vn/graphql
        // We need the base URL for REST API
        const baseUrl = API_URL.replace('/graphql', '');
        const consumerKey = process.env.WC_CONSUMER_KEY;
        const consumerSecret = process.env.WC_CONSUMER_SECRET;
        
        if (!consumerKey || !consumerSecret) {
             return NextResponse.json({ errors: [{ message: "Chưa cấu hình WooCommerce API Key" }] }, { status: 500 });
        }

        const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

        const res = await fetch(`${baseUrl}/wp-json/wc/v3/coupons?code=${encodeURIComponent(code.toLowerCase())}`, {
            method: 'GET',
            headers: { 
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await res.json();
        
        if (!res.ok) {
            return NextResponse.json({ errors: [{ message: data.message || "Không thể kiểm tra mã giảm giá" }] }, { status: 400 });
        }

        if (!Array.isArray(data) || data.length === 0) {
            return NextResponse.json({ errors: [{ message: "Mã giảm giá không tồn tại hoặc đã hết hạn" }] }, { status: 404 });
        }
        
        const coupon = data[0];

        // Format to match GraphQL structure that frontend expects
        const formattedCoupon = {
            code: coupon.code,
            amount: parseFloat(coupon.amount),
            discountType: coupon.discount_type,
            description: coupon.description
        };

        return NextResponse.json({ coupon: formattedCoupon });

    } catch (error: any) {
        return NextResponse.json({ errors: [{ message: error.message || "Lỗi máy chủ nội bộ" }] }, { status: 500 });
    }
}
