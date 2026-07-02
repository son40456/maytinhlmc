import { NextRequest, NextResponse } from 'next/server';

const GET_PRODUCTS_FILTERED = `
  query GetProductsFiltered(
    $slugStr: String!,
    $first: Int = 24,
    $after: String,
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }],
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    products(
      first: $first,
      after: $after,
      where: {
        categoryIn: [$slugStr],
        minPrice: $minPrice,
        maxPrice: $maxPrice,
        orderby: $orderBy,
        taxonomyFilter: { filters: $taxFilters }
      }
    ) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          sku
          regularPrice
          salePrice
          image { sourceUrl altText }
        }
        ... on VariableProduct {
          price
          sku
          regularPrice
          salePrice
          image { sourceUrl altText }
        }
      }
    }
  }
`;

export async function GET(req: NextRequest) {
    const { searchParams } = req.nextUrl;

    const category = searchParams.get('category');
    if (!category) {
        return NextResponse.json({ error: 'Missing category' }, { status: 400 });
    }

    const after = searchParams.get('after') || null;
    const minPrice = searchParams.get('min_price') ? parseFloat(searchParams.get('min_price')!) : null;
    const maxPrice = searchParams.get('max_price') ? parseFloat(searchParams.get('max_price')!) : null;
    const sort = searchParams.get('sort') || 'DATE_DESC';
    const first = parseInt(searchParams.get('first') || '24', 10);

    // Parse attribute filters: pa_thuong-hieu=asus,gigabyte&pa_socket=am5
    const taxFilters: { taxonomy: string; terms: string[]; operator: string }[] = [];
    searchParams.forEach((value, key) => {
        if (key.startsWith('pa_')) {
            const attrSlug = key.slice(3);
            const terms = value.split(',').filter(Boolean);
            if (terms.length > 0) {
                const taxonomy = `PA_${attrSlug.toUpperCase().replace(/-/g, '_')}`;
                taxFilters.push({ taxonomy, terms, operator: 'IN' });
            }
        }
    });

    let orderBy: { field: string; order: string }[] = [{ field: 'DATE', order: 'DESC' }];
    if (sort === 'PRICE_ASC') orderBy = [{ field: 'PRICE', order: 'ASC' }];
    if (sort === 'PRICE_DESC') orderBy = [{ field: 'PRICE', order: 'DESC' }];
    if (sort === 'TITLE_ASC') orderBy = [{ field: 'TITLE', order: 'ASC' }];

    const wpUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!wpUrl) {
        return NextResponse.json({ error: 'WP API URL not configured' }, { status: 500 });
    }

    try {
        const wpRes = await fetch(wpUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: GET_PRODUCTS_FILTERED,
                variables: {
                    slugStr: category,
                    first,
                    after,
                    minPrice,
                    maxPrice,
                    orderBy,
                    taxFilters: taxFilters.length > 0 ? taxFilters : null,
                },
            }),
            next: { revalidate: 60 },
        });

        const json: any = await wpRes.json();
        const products = json.data?.products?.nodes || [];
        const pageInfo = json.data?.products?.pageInfo || { hasNextPage: false, endCursor: null };

        return NextResponse.json(
            { products, pageInfo },
            {
                headers: {
                    // Vercel Edge Cache: serve stale immediately, revalidate in background
                    'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
                },
            }
        );
    } catch (err) {
        console.error('[api/products] Error:', err);
        return NextResponse.json({ products: [], pageInfo: { hasNextPage: false } }, { status: 500 });
    }
}
