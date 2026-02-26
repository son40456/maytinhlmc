import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';

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

        // Upload to Vercel Blob
        const blob = await put(finalFilename, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
        });

        // Trả về URL từ Vercel Blob để hiển thị ở frontend
        return NextResponse.json({ url: blob.url });
    } catch (error: any) {
        console.error('API /api/admin/upload error:', error);
        return NextResponse.json({
            error: 'Đã xảy ra lỗi khi tải ảnh lên server. Chi tiết: ' + (error?.message || String(error))
        }, { status: 500 });
    }
}
