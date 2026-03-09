export const generateProductSEO = (productName: string, shortDescription?: string) => {
    const currentYear = new Date().getFullYear();
    // Công thức Meta Title cho Sản phẩm: Tối ưu cảm xúc và giới hạn kí tự (~60 chars)
    const title = `${productName} | Chính hãng, Giá Rẻ Nhất ${currentYear}`.substring(0, 60);

    // Công thức Meta Description cho Sản phẩm: Dưới 160 kí tự, đẩy CTA, icon
    const defaultDesc = `Mua ngay ${productName} chính hãng tại LMC. Ưu đãi trả góp 0%, freeship toàn quốc.`;

    const cleanExcerpt = shortDescription
        ? ' ' + shortDescription.replace(/<[^>]+>/g, '').substring(0, 60).trim() + '...'
        : '';

    const description = `${defaultDesc}${cleanExcerpt} ✓ Click xem ngay!`.substring(0, 160);

    return { title, description };
};

export const generateCategorySEO = (categoryName: string) => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    // Công thức Meta Title cho Danh mục
    const title = `Trọn bộ ${categoryName} - Cấu Hình Mạnh, Giá Siêu Rẻ ${currentMonth}/${currentYear}`.substring(0, 60);

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
