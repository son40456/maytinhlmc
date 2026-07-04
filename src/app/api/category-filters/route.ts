import { NextRequest, NextResponse } from 'next/server';
import { wpgraphqlFetch } from '@/lib/graphql/fetcher';

const FILTER_QUERY = `
    query GetCategoryFilters($slugId: ID!, $slugStr: String!, $after: String) {
        filterDiscovery: products(
            first: 100,
            after: $after,
            where: { categoryIn: [$slugStr] }
        ) {
            pageInfo {
                hasNextPage
                endCursor
            }
            nodes {
                ... on SimpleProduct {
                    attributes {
                        nodes {
                            name
                            label
                            ... on GlobalProductAttribute {
                                slug
                                terms {
                                    nodes {
                                        name
                                        slug
                                    }
                                }
                            }
                        }
                    }
                }
                ... on VariableProduct {
                    attributes {
                        nodes {
                            name
                            label
                            ... on GlobalProductAttribute {
                                slug
                                terms {
                                    nodes {
                                        name
                                        slug
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

/**
 * GET /api/category-filters?slug=ban-phim-co
 *
 * Paginate qua TẤT CẢ sản phẩm trong danh mục (100 mỗi trang) để đảm bảo
 * không bỏ sót bất kỳ thuộc tính nào, bất kể giới hạn của WPGraphQL.
 */
export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    try {
        const seenAttrs = new Set<string>();
        const availableFilters: any[] = [];

        let hasNextPage = true;
        let afterCursor: string | null = null;
        let pageCount = 0;
        const MAX_PAGES = 20; // Tối đa 20 trang × 100 SP = 2000 sản phẩm

        while (hasNextPage && pageCount < MAX_PAGES) {
            const { data }: any = await wpgraphqlFetch<any>(FILTER_QUERY, {
                slugId: slug,
                slugStr: slug,
                after: afterCursor,
            });

            const nodes = data?.filterDiscovery?.nodes || [];
            hasNextPage = data?.filterDiscovery?.pageInfo?.hasNextPage ?? false;
            afterCursor = data?.filterDiscovery?.pageInfo?.endCursor ?? null;
            pageCount++;

            // Tích lũy tất cả attributes từ tất cả sản phẩm trên trang này
            nodes.forEach((product: any) => {
                product.attributes?.nodes?.forEach((attr: any) => {
                    const key = attr.slug || attr.name;
                    if (!key || seenAttrs.has(key)) return;

                    // Chỉ quan tâm đến GlobalProductAttribute (có slug → dùng được trong filter query)
                    if (!attr.slug) return;

                    seenAttrs.add(key);
                    availableFilters.push({
                        name: attr.label || attr.name,
                        slug: key.startsWith('pa_') ? key.slice(3) : key,
                        rawSlug: key,
                        options: attr.terms?.nodes?.map((t: any) => ({
                            slug: t.slug,
                            name: t.name,
                            logo: t.logo?.logo?.node?.sourceUrl ?? null,
                        })) || [],
                    });
                });
            });

            // Nếu đã thấy đủ attributes (tất cả sản phẩm trong category này dùng cùng attrs),
            // có thể dừng sớm sau khi không có attr mới trong 2 trang liên tiếp.
            // (Optimisation giữ nguyên cho đơn giản với MAX_PAGES guard ở trên)
        }

        return NextResponse.json({ filters: availableFilters }, {
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
            },
        });
    } catch (err) {
        console.error('[category-filters] Error:', err);
        return NextResponse.json({ filters: [] }, { status: 500 });
    }
}
