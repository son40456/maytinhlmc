/**
 * lib/filterCache.ts
 *
 * P1 Fix: Cache filter discovery results vào Upstash Redis.
 * Thay thế vòng lặp N GraphQL requests/page bằng 1 Redis GET (< 5ms).
 *
 * TTL: 30 phút — đủ để phản ánh sản phẩm mới thêm vào danh mục,
 *       không quá ngắn gây cache miss liên tục.
 *
 * Key format: filter:{categorySlug} → JSON string
 */

import { Redis } from '@upstash/redis';

const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
});

const FILTER_TTL_SECONDS = 30 * 60; // 30 phút

export type FilterOption = {
    slug: string;
    name: string;
    logo: string | null;
};

export type FilterEntry = {
    name: string;
    slug: string;
    rawSlug: string;
    options: FilterOption[];
};

/**
 * Lấy filter từ Redis cache. Trả về null nếu cache miss.
 */
export async function getFilterCache(categorySlug: string): Promise<FilterEntry[] | null> {
    try {
        const cached = await redis.get<FilterEntry[]>(`filter:${categorySlug}`);
        return cached ?? null;
    } catch (err) {
        // Redis lỗi → tiếp tục fetch từ WP như bình thường
        console.error('[FilterCache] Redis GET error:', err);
        return null;
    }
}

/**
 * Lưu filter vào Redis cache với TTL 30 phút.
 */
export async function setFilterCache(categorySlug: string, filters: FilterEntry[]): Promise<void> {
    try {
        await redis.set(`filter:${categorySlug}`, filters, { ex: FILTER_TTL_SECONDS });
    } catch (err) {
        // Redis lỗi → không crash, chỉ log
        console.error('[FilterCache] Redis SET error:', err);
    }
}

/**
 * Invalidate cache cho một danh mục (dùng khi có sản phẩm mới thêm vào).
 * Gọi từ admin webhook nếu cần.
 */
export async function invalidateFilterCache(categorySlug: string): Promise<void> {
    try {
        await redis.del(`filter:${categorySlug}`);
    } catch (err) {
        console.error('[FilterCache] Redis DEL error:', err);
    }
}
