import { NextResponse } from 'next/server';

// H5: Complete list of static pages with appropriate priority/changefreq
// Excluded: /admin, /checkout, /thank-you, /api/* (not user-facing or should not be indexed)
const STATIC_PAGES = [
    { path: '',               changefreq: 'daily',   priority: '1.0' }, // homepage
    { path: '/pc-builder',    changefreq: 'weekly',  priority: '0.8' },
    { path: '/so-sanh',       changefreq: 'monthly', priority: '0.6' },
    { path: '/cart',          changefreq: 'monthly', priority: '0.3' },
    { path: '/search',        changefreq: 'monthly', priority: '0.3' },
    { path: '/tin-tuc',       changefreq: 'daily',   priority: '0.8' },
    { path: '/login',         changefreq: 'yearly',  priority: '0.2' },
    { path: '/register',      changefreq: 'yearly',  priority: '0.2' },
    { path: '/my-account',    changefreq: 'monthly', priority: '0.2' },
];

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';
    const now = new Date().toISOString();

    const urls = STATIC_PAGES.map(({ path, changefreq, priority }) => `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

    return new NextResponse(xml, {
        headers: { 'Content-Type': 'application/xml' },
    });
}

