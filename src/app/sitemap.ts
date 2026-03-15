import { MetadataRoute } from 'next';

const SITE_URL = 'https://lmc.vn';

async function wpFetch(query: string) {
    const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!url) return null;
    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            cache: 'no-store',
        });
        return res.json();
    } catch {
        return null;
    }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticRoutes: MetadataRoute.Sitemap = [
        { url: SITE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${SITE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.5 },
    ];

    try {
        const [productsRes, categoriesRes, postsRes] = await Promise.all([
            wpFetch(`query { products(first: 100) { nodes { slug } } }`),
            wpFetch(`query { productCategories(first: 50, where: { hideEmpty: true }) { nodes { slug } } }`),
            wpFetch(`query { posts(first: 50) { nodes { slug date } } }`),
        ]);

        const categoryRoutes: MetadataRoute.Sitemap = (categoriesRes?.data?.productCategories?.nodes || []).map((c: any) => ({
            url: `${SITE_URL}/${c.slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));

        const productRoutes: MetadataRoute.Sitemap = (productsRes?.data?.products?.nodes || []).map((n: any) => ({
            url: `${SITE_URL}/${n.slug}`,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        const postRoutes: MetadataRoute.Sitemap = (postsRes?.data?.posts?.nodes || []).map((n: any) => ({
            url: `${SITE_URL}/${n.slug}`,
            lastModified: new Date(n.date),
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticRoutes, ...categoryRoutes, ...productRoutes, ...postRoutes];
    } catch {
        return staticRoutes;
    }
}
