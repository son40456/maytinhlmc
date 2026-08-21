// utils/imagekit-loader.ts
export default function imageKitLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    return getImageKitUrl(src, width, quality);
}

// Endpoint ImageKit đang hoạt động chính (có thể đổi hoặc thêm khi cần)
const ACTIVE_IK_ENDPOINT = 'https://ik.imagekit.io/lmccwxvridde';

// Danh sách các endpoint cũ / khác để tự động chuyển hướng sang endpoint đang hoạt động
const EXHAUSTED_ENDPOINTS = [
    'https://ik.imagekit.io/maytinhlmc',
];

/**
 * Helper để tạo ImageKit URL tối ưu.
 * Dùng cho <Image loader> hoặc trực tiếp trong component khi cần URL string.
 */
export function getImageKitUrl(src: string, width?: number, quality?: number): string {
    if (!src) return '';

    // Xây dựng biến đổi ImageKit (tr=...)
    const params: string[] = [];
    if (width) params.push(`w-${width}`);
    params.push(`f-auto`);
    params.push(`q-${quality || 80}`);
    const trString = params.length ? `?tr=${params.join(',')}` : '';

    // 1. Nếu URL đã là endpoint đang hoạt động
    if (src.startsWith(ACTIVE_IK_ENDPOINT)) {
        const pathOnly = src.split('?')[0];
        return `${pathOnly}${trString}`;
    }

    // 2. Nếu URL thuộc tài khoản cũ đã hết băng thông -> Tự động chuyển đường dẫn sang tài khoản mới
    for (const oldEndpoint of EXHAUSTED_ENDPOINTS) {
        if (src.startsWith(oldEndpoint)) {
            const relativePath = src.replace(oldEndpoint, '').split('?')[0];
            return `${ACTIVE_IK_ENDPOINT}${relativePath}${trString}`;
        }
    }

    // 3. Nếu URL là domain gốc WordPress
    const wpDomain = 'https://apiserver.maytinhlmc.vn';
    if (src.includes(wpDomain)) {
        const relativePath = src.replace(wpDomain, '');
        return `${ACTIVE_IK_ENDPOINT}${relativePath}${trString}`;
    }

    // 4. Nếu là đường dẫn tương đối từ WordPress (ví dụ /wp-content/uploads/...)
    if (src.startsWith('/wp-content/')) {
        return `${ACTIVE_IK_ENDPOINT}${src}${trString}`;
    }

    // Ngoại lệ: ảnh của bên thứ 3 — trả về nguyên gốc
    return src;
}