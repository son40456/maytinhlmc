import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'bannerConfig.json');
const REDIS_KEY = 'bannerConfig';

const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';
const useKV = !!kvUrl && !!kvToken;
const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

export async function GET() {
    try {
        if (useKV && redis) {
            const data = await redis.get(REDIS_KEY);
            if (data) {
                return NextResponse.json(typeof data === 'string' ? JSON.parse(data) : data);
            }
        }
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch {
        return NextResponse.json({ mainBanners: [], smallBanners: [] });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();

        if (useKV && redis) {
            await redis.set(REDIS_KEY, JSON.stringify(body));
        }

        // Also persist to file as a fallback
        try {
            await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), 'utf-8');
        } catch {
            // In production (Vercel), filesystem is read-only — Redis is the source of truth
        }

        return NextResponse.json({ success: true });
    } catch (e) {
        console.error('Error saving banner config:', e);
        return NextResponse.json({ success: false, error: 'Failed to save' }, { status: 500 });
    }
}
