// utils/imagekit-loader.ts
export default function imageKitLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    return getImageKitUrl(src, width, quality);
}

/**
 * Helper để tạo ImageKit URL tối ưu.
 * Dùng cho <Image loader> hoặc trực tiếp trong component khi cần URL string.
 */
export function getImageKitUrl(src: string, width?: number, quality?: number): string {
    const ikEndpoint = 'https://ik.imagekit.io/maytinhlmc';

    // Xây dựng biến đổi ImageKit (tr=...)
    const params: string[] = [];
    if (width) params.push(`w-${width}`);
    params.push(`f-auto`);
    params.push(`q-${quality || 80}`);
    const trString = params.length ? `?tr=${params.join(',')}` : '';

    // 1. Nếu URL đã là ImageKit URL
    if (src.startsWith(ikEndpoint)) {
        const pathOnly = src.split('?')[0];
        return `${pathOnly}${trString}`;
    }

    // 2. Nếu URL là domain gốc WordPress
    const wpDomain = 'https://apiserver.maytinhlmc.vn';
    if (src.includes(wpDomain)) {
        const relativePath = src.replace(wpDomain, '');
        return `${ikEndpoint}${relativePath}${trString}`;
    }

    // Ngoại lệ: ảnh của bên thứ 3 — trả về nguyên gốc
    return src;
}