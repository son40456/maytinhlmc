import { MetadataRoute } from 'next';
import { wpgraphqlFetch } from '@/lib/graphql/fetcher';

const SITE_URL = 'https://lmc.vn';

const SITEMAP_PRODUCTS_QUERY = `
  query SitemapProducts($after: String) {
    products(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { slug }
    }
  }
`;

const SITEMAP_CATEGORIES_QUERY = `
  query SitemapCategories {
    productCategories(first: 100, where: { hideEmpty: true }) {
      nodes { slug }
    }
  }
`;

const SITEMAP_POSTS_QUERY = `
  query SitemapPosts($after: String) {
    posts(first: 100, after: $after) {
      pageInfo { hasNextPage endCursor }
      nodes { slug date }
    }
  }
`;

async function getAllProductSlugs(): Promise<string[]> {
    const slugs: string[] = [];
    let after: string | null = null;
    let hasMore = true;
    while (hasMore) {
        const { data }: any = await wpgraphqlFetch(SITEMAP_PRODUCTS_QUERY, { after });
        (data?.products?.nodes || []).forEach((n: any) => slugs.push(n.slug));
        hasMore = data?.products?.pageInfo?.hasNextPage ?? false;
        after = data?.products?.pageInfo?.endCursor ?? null;
    }
    return slugs;
}

async function getAllPostSlugs(): Promise<{ slug: string; date: string }[]> {
    const posts: { slug: string; date: string }[] = [];
    let after: string | null = null;
    let hasMore = true;
    while (hasMore) {
        const { data }: any = await wpgraphqlFetch(SITEMAP_POSTS_QUERY, { after });
        (data?.posts?.nodes || []).forEach((n: any) => posts.push({ slug: n.slug, date: n.date }));
        hasMore = data?.posts?.pageInfo?.hasNextPage ?? false;
        after = data?.posts?.pageInfo?.endCursor ?? null;
    }
    return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const [productSlugs, postsData, { data: catData }] = await Promise.all([
        getAllProductSlugs(),
        getAllPostSlugs(),
        wpgraphqlFetch<any>(SITEMAP_CATEGORIES_QUERY, {}),
    ]);

    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    ];

    const categoryRoutes: MetadataRoute.Sitemap = (catData?.productCategories?.nodes || []).map((c: any) => ({
        url: `${SITE_URL}/${c.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    const productRoutes: MetadataRoute.Sitemap = productSlugs.map((slug) => ({
        url: `${SITE_URL}/${slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const postRoutes: MetadataRoute.Sitemap = postsData.map(({ slug, date }) => ({
        url: `${SITE_URL}/${slug}`,
        lastModified: new Date(date),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }));

    return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
}
