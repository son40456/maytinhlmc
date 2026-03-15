import { NextResponse } from 'next/server';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const GET_PRODUCTS = `
  query GetProducts($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
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
        let hasNextPage = true;
        let afterCursor = null;
        let maxPages = 50;

        while (hasNextPage && maxPages > 0) {
            const { data }: any = await wpgraphqlFetch(GET_PRODUCTS, {
                first: 100,
                after: afterCursor,
            });

            const products = data?.products?.nodes || [];
            products.forEach((product: any) => {
                if (product.slug) {
                    xmlStr += `  <url>\n    <loc>${baseUrl}/${product.slug}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
                }
            });

            hasNextPage = data?.products?.pageInfo?.hasNextPage;
            afterCursor = data?.products?.pageInfo?.endCursor;
            maxPages--;
        }
    } catch (error) {
        console.error("Sitemap Products error:", error);
    }

    xmlStr += `</urlset>`;

    return new NextResponse(xmlStr, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
