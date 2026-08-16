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
 *
 * QUAN TRỌNG: Redis client được khởi tạo lazy (không phải module-level)
 * → Nếu KV_REST_API_URL chưa được set trên server, hàm trả về null thay vì crash.
 */

import { Redis } from '@upstash/redis';

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

// Lazy singleton — chỉ tạo client khi thực sự cần, và chỉ tạo 1 lần
let _redis: Redis | null = null;

function getRedisClient(): Redis | null {
    // Guard: không có env vars → không dùng Redis (graceful degradation)
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
        return null;
    }
    // Singleton: tránh tạo nhiều connections
    if (!_redis) {
        try {
            _redis = new Redis({
                url: process.env.KV_REST_API_URL,
                token: process.env.KV_REST_API_TOKEN,
                // Fix DYNAMIC_SERVER_USAGE: Upstash mặc định dùng cache: 'no-store'.
                // Khai báo rõ cache: 'default' (hoặc 'force-cache') để Next.js không
                // bail out khỏi quá trình SSG/ISR.
                cache: 'default',
            });
        } catch (err) {
            console.error('[FilterCache] Failed to create Redis client:', err);
            return null;
        }
    }
    return _redis;
}

/**
 * Lấy filter từ Redis cache. Trả về null nếu cache miss HOẶC Redis không khả dụng.
 */
export async function getFilterCache(categorySlug: string): Promise<FilterEntry[] | null> {
    const redis = getRedisClient();
    if (!redis) return null; // Redis không có → cache miss, fallback to GraphQL

    try {
        const cached = await redis.get<FilterEntry[]>(`filter:${categorySlug}`);
        return cached ?? null;
    } catch (err) {
        console.error('[FilterCache] Redis GET error:', err);
        return null;
    }
}

/**
 * Lưu filter vào Redis cache với TTL 30 phút.
 */
export async function setFilterCache(categorySlug: string, filters: FilterEntry[]): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return; // Redis không có → bỏ qua, không crash

    try {
        await redis.set(`filter:${categorySlug}`, filters, { ex: FILTER_TTL_SECONDS });
    } catch (err) {
        console.error('[FilterCache] Redis SET error:', err);
    }
}

/**
 * Invalidate cache cho một danh mục (dùng khi có sản phẩm mới thêm vào).
 * Gọi từ admin webhook nếu cần.
 */
export async function invalidateFilterCache(categorySlug: string): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
        await redis.del(`filter:${categorySlug}`);
    } catch (err) {
        console.error('[FilterCache] Redis DEL error:', err);
    }
}
