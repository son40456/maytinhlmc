import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';

const getLogoFromRedis = unstable_cache(
    async (): Promise<string | null> => {
        const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
        const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

        if (!kvUrl || !kvToken) return null;

        const redis = new Redis({ url: kvUrl, token: kvToken });
        const data = await redis.get<{ logo?: string }>('siteSettings');
        return data?.logo ?? null;
    },
    ['site-logo'],
    { revalidate: 3600 }
);

export async function getSiteLogo(): Promise<string | null> {
    // Priority 1: logo saved in admin settings (Redis)
    try {
        const logo = await getLogoFromRedis();
        if (logo) return logo;
    } catch { /* ignore */ }

    // Priority 2: custom logo from env (e.g. /logo.png or https://...)
    const customLogo = process.env.NEXT_PUBLIC_SITE_LOGO;
    if (customLogo) return customLogo;

    // Priority 3: fallback - scrape from WordPress site
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';
    const baseUrl = apiUrl.replace(/\/graphql\/?$/, '');

    if (!baseUrl) return null;

    try {
        const res = await fetch(baseUrl, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) return null;

        const html = await res.text();
        const match = html.match(/<img[^>]+class="[^"]*header-logo-dark[^"]*"[^>]+src="([^"]+)"/i) ||
            html.match(/<a[^>]+class="[^"]*logo[^"]*"[^>]*>\s*<img[^>]+src="([^"]+)"/i) ||
            html.match(/<img[^>]+src="([^"]+logo[^"]*)"/i);

        return match?.[1] ?? null;
    } catch (error) {
        console.error('Error fetching site logo:', error);
        return null;
    }
}
