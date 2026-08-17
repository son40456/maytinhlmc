import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://maytinhlmc.vn';

    return {
        rules: [
            // GEO: Explicitly allow AI Search crawlers for citation/index visibility
            { userAgent: 'GPTBot', allow: '/' },          // ChatGPT web search
            { userAgent: 'OAI-SearchBot', allow: '/' },   // OpenAI search features
            { userAgent: 'ClaudeBot', allow: '/' },       // Claude web features
            { userAgent: 'PerplexityBot', allow: '/' },   // Perplexity AI search
            // Block training-only crawlers (no search benefit)
            { userAgent: 'CCBot', disallow: '/' },        // Common Crawl training data
            // All other crawlers
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/cart', '/checkout', '/account', '/api/', '/admin'],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
