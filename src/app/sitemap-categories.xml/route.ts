import { NextResponse } from 'next/server';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const GET_CATEGORIES = `
  query GetCategories {
    productCategories(first: 200) {
      nodes {
        slug
        count
      }
    }
  }
`;

// H7: Exclude WordPress utility/uncategorized slugs with no meaningful content
// These would be thin content and waste crawl budget
const BLOCKED_SLUGS = new Set([
    'chua-phan-loai',    // WordPress "Uncategorized" default
    'uncategorized',
    'khong-phan-loai',
]);

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';
    let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    try {
        const { data }: any = await wpgraphqlFetch(GET_CATEGORIES, {});
        const categories = data?.productCategories?.nodes || [];

        categories.forEach((cat: any) => {
            // Skip blocked slugs (thin/uncategorized content)
            if (!cat.slug || BLOCKED_SLUGS.has(cat.slug)) return;
            // Also skip empty categories with 0 products to avoid thin content
            if (cat.count === 0) return;

            xmlStr += `  <url>\n    <loc>${baseUrl}/${cat.slug}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
        });
    } catch (e) {
        console.error("Sitemap Categories error:", e);
    }

    xmlStr += `</urlset>`;

    return new NextResponse(xmlStr, {
        headers: { 'Content-Type': 'application/xml' },
    });
}

