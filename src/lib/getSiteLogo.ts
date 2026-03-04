import { Redis } from '@upstash/redis';
import { unstable_cache } from 'next/cache';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'siteSettings.json');
const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const useKV = !!kvUrl && !!kvToken;
const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

/**
 * Lấy URL logo — được cache bởi Next.js unstable_cache (24 tiếng).
 * Ưu tiên: Admin Settings (Redis/JSON) → WPGraphQL
 *
 * QUAN TRỌNG: Sau khi cập nhật logo trong Admin, cần revalidate cache
 * bằng cách gọi revalidateTag('site-logo') hoặc chờ 24 tiếng.
 */
export const getSiteLogo = unstable_cache(
    async (): Promise<string | null> => {
        // 1. Ưu tiên: logo đã được cấu hình trong Admin Settings
        try {
            let settings: any = null;
            if (useKV && redis) {
                const data = await redis.get('siteSettings');
                settings = data ? (typeof data === 'string' ? JSON.parse(data) : data) : null;
            } else {
                const raw = await fs.readFile(dataFilePath, 'utf-8');
                settings = JSON.parse(raw);
            }
            if (settings?.logoUrl) return settings.logoUrl;
        } catch { /* Chưa có settings */ }

        // 2. Fallback: WPGraphQL
        const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
        if (!apiUrl) return null;

        try {
            const query = `
                query GetSiteLogo {
                    themeGeneralSettings {
                        themeOptions {
                            logo { node { sourceUrl } }
                        }
                    }
                }
            `;
            const res = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query }),
            });
            const json = await res.json();
            return json?.data?.themeGeneralSettings?.themeOptions?.logo?.node?.sourceUrl ?? null;
        } catch { return null; }
    },
    ['site-logo'], // cache key
    {
        revalidate: 86400, // 24 tiếng
        tags: ['site-logo'],
    }
);



