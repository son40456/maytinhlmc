export async function getSiteLogo(): Promise<string | null> {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '';
    // Assuming API URL is like https://maytinhlmc.vn/graphql
    const baseUrl = apiUrl.replace(/\/graphql\/?$/, '');

    if (!baseUrl) return null;

    try {
        const res = await fetch(baseUrl, {
            next: { revalidate: 3600 }, // Cache for 1 hour
        });

        if (!res.ok) return null;

        const html = await res.text();
        const match = html.match(/<img[^>]+class="[^"]*header-logo-dark[^"]*"[^>]+src="([^"]+)"/i) ||
            html.match(/<a[^>]+class="[^"]*logo[^"]*"[^>]*>\s*<img[^>]+src="([^"]+)"/i) ||
            html.match(/<img[^>]+src="([^"]+logo[^"]*)"/i);

        if (match && match[1]) {
            return match[1];
        }

        return null;
    } catch (error) {
        console.error('Error fetching site logo:', error);
        return null;
    }
}
