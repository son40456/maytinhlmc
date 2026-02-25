import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Redis } from '@upstash/redis';
import { getPcBuilderConfig } from '@/app/actions/configActions';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'pcBuilderConfig.json');

// Lấy môi trường từ Vercel Upstash Integration hoặc Vercel KV cũ
const kvUrl = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL || '';
const kvToken = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN || '';

const useKV = !!kvUrl && !!kvToken;
const redis = useKV ? new Redis({ url: kvUrl, token: kvToken }) : null;

export async function GET() {
    try {
        const data = await getPcBuilderConfig();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading pc builder config:', error);
        return NextResponse.json({});
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (useKV && redis) {
            await redis.set('pcBuilderConfig', JSON.stringify(body));
        } else {
            // Local fallback
            await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), 'utf-8');
        }

        return NextResponse.json({ success: true, message: 'Cập nhật cấu hình Build PC thành công' });
    } catch (error) {
        console.error('Error writing pc builder config:', error);
        return NextResponse.json({ success: false, message: 'Lỗi cập nhật cấu hình Build PC' }, { status: 500 });
    }
}
