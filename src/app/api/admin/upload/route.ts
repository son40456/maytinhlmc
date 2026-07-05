import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Không tìm thấy file tải lên.' }, { status: 400 });
        }

        // Replace spaces and special characters from filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const finalFilename = `${Date.now()}-${safeName}`;

        const blobToken = process.env.BLOB_READ_WRITE_TOKEN;

        if (blobToken) {
            // Upload to Vercel Blob
            const blob = await put(finalFilename, file, {
                access: 'public',
                token: blobToken,
            });
            return NextResponse.json({ url: blob.url });
        } else {
            // Local fallback: save to public/uploads
            const buffer = Buffer.from(await file.arrayBuffer());
            const uploadDir = path.join(process.cwd(), 'public', 'uploads');
            
            try {
                await fs.access(uploadDir);
            } catch {
                await fs.mkdir(uploadDir, { recursive: true });
            }
            
            const filePath = path.join(uploadDir, finalFilename);
            await fs.writeFile(filePath, buffer);
            
            return NextResponse.json({ url: `/uploads/${finalFilename}` });
        }
    } catch (error: any) {
        console.error('API /api/admin/upload error:', error);
        return NextResponse.json({
            error: 'Đã xảy ra lỗi khi tải ảnh lên server. Chi tiết: ' + (error?.message || String(error))
        }, { status: 500 });
    }
}
