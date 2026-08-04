import { NextRequest, NextResponse } from 'next/server';

const SEARCH_PRODUCTS_QUERY = `
  query SearchProducts($search: String!, $first: Int = 12) {
    products(first: $first, where: { search: $search }) {
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          regularPrice
          sku
          image { sourceUrl altText }
        }
        ... on VariableProduct {
          price
          regularPrice
          sku
          image { sourceUrl altText }
        }
      }
    }
  }
`;

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;
    const search = searchParams.get('search') || '';
    const perPage = parseInt(searchParams.get('per_page') || '10', 10);

    if (!search.trim()) {
        return NextResponse.json({ products: [] });
    }

    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!wpUrl) {
        return NextResponse.json({ error: 'WP API URL not configured' }, { status: 500 });
    }

    try {
        const res = await fetch(wpUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: SEARCH_PRODUCTS_QUERY,
                variables: { search, first: perPage },
            }),
            next: { revalidate: 0 },
        });

        const json: any = await res.json();
        const products = json.data?.products?.nodes || [];

        return NextResponse.json({ products });
    } catch (err) {
        console.error('[api/admin/search-products] Error:', err);
        return NextResponse.json({ products: [] }, { status: 500 });
    }
}
