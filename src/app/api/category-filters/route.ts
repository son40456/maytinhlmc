import { NextRequest, NextResponse } from 'next/server';
import { wpgraphqlFetch } from '@/lib/graphql/fetcher';

/**
 * GET /api/category-filters?slug=ban-phim-co
 *
 * Trả về toàn bộ thuộc tính (attributes) có sẵn cho một danh mục sản phẩm.
 * Query trực tiếp taxonomy thay vì quét 250 sản phẩm → đầy đủ và chính xác hơn.
 */
export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get('slug');
    if (!slug) {
        return NextResponse.json({ error: 'Missing slug' }, { status: 400 });
    }

    const query = `
        query GetCategoryFilters($slugId: ID!, $slugStr: String!) {
            productCategory(id: $slugId, idType: SLUG) {
                id
                databaseId
                name
                slug
            }
            filterDiscovery: products(
                first: 500,
                where: { categoryIn: [$slugStr] }
            ) {
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
                                            ... on PaThuongHieu {
                                                logo {
                                                    logo {
                                                        node {
                                                            sourceUrl
                                                        }
                                                    }
                                                }
                                            }
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
                                            ... on PaThuongHieu {
                                                logo {
                                                    logo {
                                                        node {
                                                            sourceUrl
                                                        }
                                                    }
                                                }
                                            }
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

    try {
        const { data } = await wpgraphqlFetch<any>(query, {
            slugId: slug,
            slugStr: slug,
        });

        const availableFilters: any[] = [];
        const seenAttrs = new Set<string>();

        data?.filterDiscovery?.nodes?.forEach((p: any) => {
            p.attributes?.nodes?.forEach((attr: any) => {
                const key = attr.slug || attr.name;
                if (!key || seenAttrs.has(key)) return;
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

        return NextResponse.json({ filters: availableFilters }, {
            headers: {
                // Cache tại CDN 10 phút, stale-while-revalidate 1 tiếng
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
            },
        });
    } catch (err) {
        console.error('[category-filters] Error:', err);
        return NextResponse.json({ filters: [] }, { status: 500 });
    }
}
