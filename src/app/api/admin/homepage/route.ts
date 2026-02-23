import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'homepageConfig.json');

export async function GET() {
    try {
        const data = await fs.readFile(dataFilePath, 'utf-8');
        return NextResponse.json(JSON.parse(data));
    } catch (error) {
        console.error('Error reading homepage config:', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        await fs.writeFile(dataFilePath, JSON.stringify(body, null, 2), 'utf-8');
        return NextResponse.json({ success: true, message: 'Cập nhật cấu hình thành công' });
    } catch (error) {
        console.error('Error writing homepage config:', error);
        return NextResponse.json({ success: false, message: 'Lỗi cập nhật cấu hình' }, { status: 500 });
    }
}
