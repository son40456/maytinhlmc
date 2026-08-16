import { NextResponse } from 'next/server';

const WP_API = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;

async function searchCategories(search: string, limit: number) {
    // WPGraphQL: where.search tìm trong name, slug, description
    const query = `
        query {
            productCategories(
                first: ${limit},
                where: {
                    ${search ? `search: ${JSON.stringify(search)},` : ''}
                    hideEmpty: false,
                    orderby: NAME
                }
            ) {
                nodes {
                    id
                    name
                    slug
                    count
                    parent {
                        node {
                            name
                            slug
                        }
                    }
                }
            }
        }
    `;

    const res = await fetch(WP_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
        // Không cache — cần fresh data mỗi lần tìm kiếm
        cache: 'no-store',
    });

    const json = await res.json();
    return json?.data?.productCategories?.nodes ?? [];
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get('search') || '').trim();
    const limit = Math.min(Number(searchParams.get('limit') || '20'), 50);

    try {
        const nodes = await searchCategories(search, limit);

        // Lọc local nếu WPGraphQL search không nhạy cảm với tiếng Việt
        let categories = nodes
            .filter((cat: any) => cat.slug && cat.name)
            .map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                count: cat.count || 0,
                parentName: cat.parent?.node?.name || null,
            }));

        // Fallback: nếu WPGraphQL trả về đủ và không lọc → lọc lại client-side
        if (search && categories.length > 0) {
            const lowerSearch = search.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
            const filtered = categories.filter((cat: any) => {
                const norm = (cat.name + ' ' + cat.slug)
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '');
                return norm.includes(lowerSearch);
            });
            // Dùng kết quả filtered nếu có, ngược lại giữ nguyên
            if (filtered.length > 0) categories = filtered;
        }

        return NextResponse.json({ categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ categories: [] }, { status: 500 });
    }
}
