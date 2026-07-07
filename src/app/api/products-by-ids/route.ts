import { NextRequest, NextResponse } from 'next/server';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;

import { GET_PRODUCTS_BY_IDS } from '@/lib/graphql/queries';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('ids');

    if (!idsParam) {
        return NextResponse.json({ error: 'Missing ids param' }, { status: 400 });
    }

    const ids = idsParam.split(',').map(Number).filter(n => !isNaN(n) && n > 0);

    if (ids.length === 0) {
        return NextResponse.json({ error: 'No valid ids' }, { status: 400 });
    }

    try {
        const res = await fetch(GRAPHQL_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: GET_PRODUCTS_BY_IDS,
                variables: { in: ids },
            }),
            cache: 'no-store'
        });

        const json = await res.json();
        const products = json?.data?.products?.nodes || [];
        return NextResponse.json({ products });
    } catch (error) {
        console.error('products-by-ids API error:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
