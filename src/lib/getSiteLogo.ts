export async function getSiteLogo(): Promise<string | null> {
    // Priority 1: custom logo from env (e.g. /logo.png or https://...)
    const customLogo = process.env.NEXT_PUBLIC_SITE_LOGO;
    if (customLogo) return customLogo;

    // Priority 2: fallback - scrape from WordPress site
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';
    const baseUrl = apiUrl.replace(/\/graphql\/?$/, '');

    if (!baseUrl) return null;

    try {
        const res = await fetch(baseUrl, {
            next: { revalidate: 3600 },
        });

        if (!res.ok) return null;

        const html = await res.text();
        const match = html.match(/<img[^>]+class="[^"]*header-logo-dark[^"]*"[^>]+src="([^"]+)"/i) ||
            html.match(/<a[^>]+class="[^"]*logo[^"]*"[^>]*>\s*<img[^>]+src="([^"]+)"/i) ||
            html.match(/<img[^>]+src="([^"]+logo[^"]*)"/i);

        return match?.[1] ?? null;
    } catch (error) {
        console.error('Error fetching site logo:', error);
        return null;
    }
}
