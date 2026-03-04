// utils/imagekit-loader.ts
export default function imageKitLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    const wpDomain = 'https://next.maytinhlmc.vn';
    const ikEndpoint = 'https://ik.imagekit.io/maytinhlmc';

    // Nếu không phải ảnh từ WordPress → trả về nguyên src
    if (!src.startsWith(wpDomain)) {
        return src;
    }

    const relativePath = src.replace(wpDomain, '');
    const params = [`w-${width}`, `q-${quality ?? 80}`, 'f-auto'];

    return `${ikEndpoint}${relativePath}?tr=${params.join(',')}`;
}