export const generateProductSEO = (productName: string, shortDescription?: string) => {
    const currentYear = new Date().getFullYear();
    // Công thức Meta Title cho Sản phẩm
    const title = `${productName} chính hãng, giá cực sốc | LMC`;

    // Công thức Meta Description cho Sản phẩm
    const defaultDesc = `Mua ngay ${productName} tại LMC. Trả góp 0%, freeship toàn quốc, bảo hành chính hãng.`;

    // Rút gọn mô tả ngắn nếu có (khoảng 150 ký tự chuẩn SEO)
    const cleanExcerpt = shortDescription
        ? shortDescription.replace(/<[^>]+>/g, '').substring(0, 100) + '...'
        : '';

    const description = `${defaultDesc} ${cleanExcerpt}`.trim();

    return { title, description };
};

export const generateCategorySEO = (categoryName: string) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Công thức Meta Title cho Danh mục
    const title = `Trọn bộ ${categoryName} tháng ${currentMonth}/${currentYear} giá rẻ nhất | LMC`;

    // Công thức Meta Description cho Danh mục
    const description = `Khám phá các dòng ${categoryName} đa dạng, cấu hình cực mạnh, build PC tối ưu. Xem ngay bảng giá mới nhất tại LMC.`;

    return { title, description };
};

export const generatePostSEO = (postTitle: string, excerpt?: string) => {
    // Công thức Meta Title cho Bài viết
    const title = `${postTitle} | Blog LMC`;

    // Công thức Meta Description cho Bài viết
    const description = excerpt
        ? excerpt.replace(/<[^>]+>/g, '').substring(0, 150) + '...'
        : `Đọc bài viết ${postTitle} để cập nhật những thông tin công nghệ mới nhất từ LMC.`;

    return { title, description };
};
