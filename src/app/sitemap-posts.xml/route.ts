import { NextResponse } from 'next/server';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const GET_POSTS = `
  query GetPosts {
    posts(first: 100) {
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
        const { data }: any = await wpgraphqlFetch(GET_POSTS, {});
        const posts = data?.posts?.nodes || [];

        posts.forEach((post: any) => {
            if (post.slug) {
                xmlStr += `  <url>\n    <loc>${baseUrl}/tin-tuc/${post.slug}</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
            }
        });
    } catch (e) {
        console.error("Sitemap Posts error:", e);
    }

    xmlStr += `</urlset>`;

    return new NextResponse(xmlStr, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
