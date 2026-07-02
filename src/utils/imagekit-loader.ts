// utils/imagekit-loader.ts
export default function imageKitLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    const ikEndpoint = 'https://ik.imagekit.io/maytinhlmc';

    // Xây dựng biến đổi ImageKit (tr=...)
    const params = [`w-${width}`, `f-auto`];
    params.push(`q-${quality || 80}`);
    const trString = `?tr=${params.join(',')}`;

    // 1. Nếu URL đã là ImageKit URL (Do WP plugin offload trực tiếp)
    if (src.startsWith(ikEndpoint)) {
        const pathOnly = src.split('?')[0]; // Bỏ query param cũ nếu có
        return `${pathOnly}${trString}`;
    }

    // 2. Nếu URL là domain gốc WordPress
    const wpDomain = 'https://next.maytinhlmc.vn';
    if (src.includes(wpDomain)) {
        const relativePath = src.replace(wpDomain, '');
        return `${ikEndpoint}${relativePath}${trString}`;
    }

    // Ngoại lệ: ảnh của bên thứ 3 (Google Auth, vv)
    return src;
}