import { NextResponse } from 'next/server';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const GET_CATEGORIES = `
  query GetCategories {
    productCategories(first: 100) {
      nodes {
        slug
      }
    }
  }
`;

export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';
    let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    try {
        const { data }: any = await wpgraphqlFetch(GET_CATEGORIES, {});
        const categories = data?.productCategories?.nodes || [];

        categories.forEach((cat: any) => {
            if (cat.slug) {
                xmlStr += `  <url>\n    <loc>${baseUrl}/${cat.slug}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;
            }
        });
    } catch (e) {
        console.error("Sitemap Categories error:", e);
    }

    xmlStr += `</urlset>`;

    return new NextResponse(xmlStr, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
