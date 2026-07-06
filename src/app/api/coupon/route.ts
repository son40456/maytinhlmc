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

        const res = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: COUPON_QUERY,
                variables: { id: code }
            })
        });

        const data = await res.json();
        
        if (data.errors) {
             return NextResponse.json({ errors: data.errors }, { status: 400 });
        }

        if (!data.data.coupon) {
            return NextResponse.json({ errors: [{ message: "Mã giảm giá không tồn tại hoặc đã hết hạn" }] }, { status: 404 });
        }

        return NextResponse.json({ coupon: data.data.coupon });

    } catch (error: any) {
        return NextResponse.json({ errors: [{ message: error.message || "Lỗi máy chủ nội bộ" }] }, { status: 500 });
    }
}
