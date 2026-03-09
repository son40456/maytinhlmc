import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lmc.vn';

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/cart', '/checkout', '/account', '/api/'],
        },
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
