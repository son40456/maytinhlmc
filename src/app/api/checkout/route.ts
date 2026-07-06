import { NextResponse } from 'next/server';

const ADD_TO_CART = `
  mutation AddToCart($productId: Int!, $quantity: Int!) {
    addToCart(input: {
      productId: $productId,
      quantity: $quantity
    }) {
      cartItem {
        key
      }
    }
  }
`;

const CHECKOUT_MUTATION = `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      clientMutationId
      order {
        id
        orderKey
        orderNumber
        status
        total
      }
      result
      redirect
    }
  }
`;

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { items, checkoutInput, token } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ errors: [{ message: "Giỏ hàng trống" }] }, { status: 400 });
        }

        const API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL as string;

        // Bước 1: Thêm sản phẩm đầu tiên để lấy session
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const res1 = await fetch(API_URL, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                query: ADD_TO_CART,
                variables: {
                    productId: items[0].databaseId,
                    quantity: items[0].quantity
                }
            })
        });

        const res1Data = await res1.json();
        if (res1Data.errors) {
            return NextResponse.json({ errors: res1Data.errors }, { status: 400 });
        }

        const sessionToken = res1.headers.get('woocommerce-session');
        if (!sessionToken) {
             return NextResponse.json({ errors: [{ message: "Không lấy được woocommerce-session từ máy chủ. (CORS hoặc cấu hình GraphQL)" }] }, { status: 500 });
        }

        // Bước 2: Thêm các sản phẩm còn lại
        if (items.length > 1) {
            const addPromises = items.slice(1).map((item: any) =>
                fetch(API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'woocommerce-session': `Session ${sessionToken}`,
                        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                    },
                    body: JSON.stringify({
                        query: ADD_TO_CART,
                        variables: {
                            productId: item.databaseId,
                            quantity: item.quantity
                        }
                    })
                })
            );
            await Promise.all(addPromises);
        }

        // Bước 3: Gửi mutation Checkout
        const checkoutRes = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'woocommerce-session': `Session ${sessionToken}`,
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            },
            body: JSON.stringify({
                query: CHECKOUT_MUTATION,
                variables: { input: checkoutInput }
            })
        });

        const checkoutData = await checkoutRes.json();
        
        return NextResponse.json(checkoutData);

    } catch (error: any) {
        return NextResponse.json({ errors: [{ message: error.message || "Lỗi máy chủ nội bộ" }] }, { status: 500 });
    }
}
