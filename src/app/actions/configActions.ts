"use server";

import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

export async function getHomepageConfig() {
    const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
    const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

    const useKV = !!kvUrl && !!kvToken;
    const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

    try {
        if (useKV && redis) {
            const data = await redis.get('homepageConfig');
            if (data) {
                return typeof data === 'string' ? JSON.parse(data) : data;
            }
        }

        // Local Fallback 
        const dataFilePath = path.join(process.cwd(), 'src', 'data', 'homepageConfig.json');
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading homepage config:', error);
        return [];
    }
}
