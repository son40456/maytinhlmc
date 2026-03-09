import { NextResponse } from 'next/server';

const TAXONOMIES = [
    'pa_bo-nho-dem-cache',
    'pa_bus-ram',
    'pa_chipset',
    'pa_chuan-nguon',
    'pa_cong-suat-nguon',
    'pa_do-phan-giai-man-hinh',
    'pa_dong-cpu',
    'pa_dung-luong',
    'pa_dung-luong-ram',
    'pa_form-factor',
    'pa_khoang-gia-mainboard',
    'pa_kich-thuoc-man-hinh',
    'pa_loai-ram',
    'pa_socket',
    'pa_tam-nen-man-hinh',
    'pa_tan-so-quet',
    'pa_the-he-cpu',
    'pa_thuong-hieu',
    'pa_toc-do-vong-quay'
];

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Thêm các sitemap cố định
    ['pages', 'products', 'categories', 'posts'].forEach(type => {
        xml += `  <sitemap>\n    <loc>${baseUrl}/sitemap-${type}.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n`;
    });

    // Thêm các sitemap động cho Taxonomy (Attributes)
    TAXONOMIES.forEach(tax => {
        xml += `  <sitemap>\n    <loc>${baseUrl}/${tax}-sitemap.xml</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n  </sitemap>\n`;
    });

    xml += `</sitemapindex>`;

    return new NextResponse(xml, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
