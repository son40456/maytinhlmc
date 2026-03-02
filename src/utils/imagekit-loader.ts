// utils/imagekit-loader.ts
export default function imageKitLoader({ src, width, quality }: { src: string, width: number, quality?: number }) {
    // 1. Domain gốc của WordPress
    const wpDomain = 'https://next.maytinhlmc.vn';

    // 2. URL Endpoint bạn vừa lấy ở Bước 1
    const ikEndpoint = 'https://ik.imagekit.io/maytinhlmc/';

    // Nếu ảnh không bắt đầu từ WP (ví dụ ảnh Google hoặc Vercel Blob)
    // thì trả về src gốc để Next.js xử lý bình thường hoặc bỏ qua
    if (!src.includes(wpDomain)) {
        return src;
    }

    // Chuyển đổi link: Thay domain WP bằng domain ImageKit
    const relativePath = src.replace(wpDomain, '');

    // Tạo các tham số tối ưu (w: chiều rộng, q: chất lượng, f: tự động chọn định dạng webp/avif)
    const params = [`w-${width}`];
    if (quality) {
        params.push(`q-${quality}`);
    } else {
        params.push(`q-80`); // Mặc định chất lượng 80 cho nhẹ
    }

    return `${ikEndpoint}${relativePath}?tr=${params.join(',')}`;
}