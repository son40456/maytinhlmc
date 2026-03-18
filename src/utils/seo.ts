export const generateProductSEO = (productName: string, shortDescription?: string) => {
    const currentYear = new Date().getFullYear();
    const brand = "LMC";

    // Tối ưu Title: Không nên dùng substring cắt cứng vì Bot Google sẽ không đọc được đoạn bị cắt.
    // Tốt nhất là nối chuỗi đầy đủ. Nếu quá dài, Google sẽ tự cắt thêm "..." khi hiển thị, 
    // nhưng Bot vẫn đọc được toàn bộ keyword trong source code HTML.
    let title = `${productName} | Chính hãng, Giá Rẻ Nhất ${currentYear} | ${brand}`;

    // Nếu tên SP quá dài (>60 ký tự), ta ưu tiên hiển thị Tên SP + Brand (bỏ bớt chữ rườm rà)
    if (productName.length > 55) {
        title = `${productName} | ${brand}`;
    }

    // Công thức Meta Description cho Sản phẩm: Dưới 160 kí tự, đẩy CTA, icon
    const defaultDesc = `Mua ngay ${productName} chính hãng tại LMC. Ưu đãi trả góp 0%, freeship toàn quốc.`;

    const cleanExcerpt = shortDescription
        ? ' ' + shortDescription.replace(/<[^>]+>/g, '').substring(0, 60).trim() + '...'
        : '';

    // Description cũng vậy, nối chuỗi và dùng substring để đảm bảo không bị quá dài gây loãng
    const description = `${defaultDesc}${cleanExcerpt} ✓ Click xem ngay!`.substring(0, 160);

    return { title, description };
};

export const generateCategorySEO = (categoryName: string) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Công thức Meta Title cho Danh mục
    const title = `Trọn bộ ${categoryName} - Cấu Hình Mạnh, Giá Siêu Rẻ ${currentMonth}/${currentYear} | LMC`;

    // Công thức Meta Description cho Danh mục
    const description = `Khám phá các dòng ${categoryName} đa dạng, cấu hình tối ưu. Xem bảng giá cập nhật mới nhất tại LMC. ✓ Trả góp 0%. ✓ Freeship. ✓ Mua ngay!`.substring(0, 160);

    return { title, description };
};

export const generatePostSEO = (postTitle: string, excerpt?: string) => {
    // Công thức Meta Title cho Bài viết
    const title = `${postTitle} | Blog LMC`;

    // Công thức Meta Description cho Bài viết
    const description = excerpt
        ? excerpt.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
        : `Đọc bài viết ${postTitle} để cập nhật thông tin công nghệ mới nhất từ LMC.`;

    return { title, description };
};

export const generateHomepageSEO = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';
    const currentYear = new Date().getFullYear();

    const title = `Máy Tính LMC – Laptop, PC, Linh Kiện Chính Hãng Giá Tốt ${currentYear}`;
    const description =
        `Mua laptop, PC, linh kiện máy tính chính hãng tại LMC. Giá rẻ nhất, bảo hành chính hãng, ` +
        `trả góp 0%, giao hàng toàn quốc. Xem ngay!`;

    return {
        title,
        description,
        openGraph: {
            type: 'website' as const,
            url: baseUrl,
            title,
            description,
            siteName: 'Máy Tính LMC',
            locale: 'vi_VN',
        },
        twitter: {
            card: 'summary_large_image' as const,
            title,
            description,
        },
        alternates: {
            canonical: baseUrl,
        },
    };
};
