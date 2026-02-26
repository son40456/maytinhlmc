import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Không tìm thấy file tải lên.' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Replace spaces and special characters from filename
        const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const finalFilename = `${Date.now()}-${safeName}`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads');

        // Cố gắng tạo thư mục nếu chưa tồn tại
        try {
            await fs.access(uploadDir);
        } catch {
            await fs.mkdir(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, finalFilename);
        await fs.writeFile(filepath, buffer);

        // Trả về URL tương đối để hiển thị ở frontend
        return NextResponse.json({ url: `/uploads/${finalFilename}` });
    } catch (error: any) {
        console.error('API /api/admin/upload error:', error);
        return NextResponse.json({
            error: 'Đã xảy ra lỗi khi tải ảnh lên server. Chi tiết: ' + (error?.message || String(error))
        }, { status: 500 });
    }
}
