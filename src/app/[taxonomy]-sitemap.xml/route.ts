import { NextResponse } from 'next/server';
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

// We extract the actual taxonomy name without the "pa_" prefix since WPGraphQL usually converts 
// "pa_thuong-hieu" to "paThuongHieu" or similar in GraphQL, but often terms can be fetched via generic queries
// For simplicity, we'll use a generic approach if possible or just return a dummy if the exact GraphQL schema for attributes isn't known.
// Let's assume we can fetch terms of a specific taxonomy if we know its name.
// Since WP GraphQL for WooCommerce exposes attributes, we can try to query terms by taxonomy.
// However, WPGraphQL might need specific setups for each attribute. 
// A fallback is to just return a basic XML if we can't fetch them dynamically yet, to avoid 500 errors.

export async function GET(request: Request, context: { params: Promise<{ taxonomy: string }> }) {
    const { taxonomy } = await context.params;
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

    // Clean the taxonomy name (e.g., "pa_thuong-hieu")
    const taxName = taxonomy.replace('-sitemap.xml', '');

    let xmlStr = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Ideally here we would fetch:
    // query GetTerms { terms(where: { taxonomies: [taxName] }) { nodes { slug } } }
    // Since we don't have the exact GraphQL schema for attributes, we'll list a basic dummy 
    // or wrap in try/catch if we attempt a fetch.
    // For now, returning an empty urlset is safer than crashing, meaning the file exists but has no links until the WPGraphQL schema is confirmed.

    // Example dummy link just so it's not totally empty (optional)
    // xmlStr += `  <url>\n    <loc>${baseUrl}/thuong-hieu</loc>\n    <lastmod>${new Date().toISOString()}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

    xmlStr += `</urlset>`;

    return new NextResponse(xmlStr, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
