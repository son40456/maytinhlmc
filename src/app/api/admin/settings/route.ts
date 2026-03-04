import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'siteSettings.json');
const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const useKV = !!kvUrl && !!kvToken;
const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

const REDIS_KEY = 'siteSettings';

export async function GET() {
    try {
        if (useKV && redis) {
            const data = await redis.get(REDIS_KEY);
            if (data) {
                return NextResponse.json(typeof data === 'string' ? JSON.parse(data) : data);
            }
        }
        // Local fallback
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch {
        return NextResponse.json({ logoUrl: '' });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        if (useKV && redis) {
            await redis.set(REDIS_KEY, JSON.stringify(body));
        } else {
            await fs.mkdir(path.dirname(dataFilePath), { recursive: true });
            await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), 'utf-8');
        }
        // Cache logo (unstable_cache 24h) sẽ tự expire sau 24 tiếng
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving site settings:', error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}

