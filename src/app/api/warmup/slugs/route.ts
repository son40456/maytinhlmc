import { NextRequest, NextResponse } from 'next/server';
import { wpgraphqlFetch } from '@/lib/graphql/fetcher';

/**
 * GET /api/warmup/slugs
 *
 * Trả về toàn bộ slug của sản phẩm và danh mục để warm-up script sử dụng.
 * Dùng một secret key để bảo vệ endpoint này khỏi bị gọi tùy tiện.
 */
export async function GET(req: NextRequest) {
    // Bảo vệ bằng secret key
    const secret = req.nextUrl.searchParams.get('secret');
    if (!secret || secret !== process.env.WARMUP_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const slugs: string[] = [];

        // --- Lấy tất cả product slugs ---
        const PRODUCT_QUERY = `
            query GetAllProductSlugs($after: String) {
                products(first: 100, after: $after) {
                    pageInfo { hasNextPage endCursor }
                    nodes { slug }
                }
            }
        `;

        let hasNextPage = true;
        let afterCursor: string | null = null;

        while (hasNextPage) {
            const res: any = await wpgraphqlFetch<any>(PRODUCT_QUERY, { after: afterCursor });
            res?.data?.products?.nodes?.forEach((p: any) => { if (p.slug) slugs.push(p.slug); });
            hasNextPage = res?.data?.products?.pageInfo?.hasNextPage ?? false;
            afterCursor = res?.data?.products?.pageInfo?.endCursor ?? null;
        }

        // --- Lấy tất cả category slugs ---
        const catRes: any = await wpgraphqlFetch<any>(`
            query GetAllCategorySlugs {
                productCategories(first: 200) { nodes { slug } }
            }
        `);
        catRes?.data?.productCategories?.nodes?.forEach((c: any) => { if (c.slug) slugs.push(c.slug); });

        return NextResponse.json({ slugs, total: slugs.length });
    } catch (err) {
        console.error('[warmup/slugs] Error:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
