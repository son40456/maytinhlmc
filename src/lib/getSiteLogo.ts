/**
 * Lấy URL logo trang web qua WPGraphQL.
 * Dùng Site Settings (customizer logo) thông qua query generalSettings + mediaItemBy.
 */
export async function getSiteLogo(): Promise<string | null> {
    const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!apiUrl) return null;

    // Query 1: Lấy custom logo từ Site Identity (Customizer)
    const query = `
        query GetSiteLogo {
            generalSettings {
                url
            }
            themeGeneralSettings {
                themeOptions {
                    logo {
                        node {
                            sourceUrl
                            altText
                        }
                    }
                }
            }
        }
    `;

    try {
        const res = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query }),
            next: { revalidate: 3600 },
        });

        const json = await res.json();
        const logoUrl = json?.data?.themeGeneralSettings?.themeOptions?.logo?.node?.sourceUrl;
        if (logoUrl) return logoUrl;

        // Fallback: thử lấy custom_logo từ WordPress options (qua REST API)
        const wpBase = apiUrl.replace(/\/graphql\/?$/, '');
        const settingsRes = await fetch(`${wpBase}/wp-json/wp/v2/settings`, {
            next: { revalidate: 3600 },
        });
        if (settingsRes.ok) {
            const settings = await settingsRes.json();
            if (settings?.site_logo) {
                // settings.site_logo là attachment ID → lấy URL
                const mediaRes = await fetch(`${wpBase}/wp-json/wp/v2/media/${settings.site_logo}`, {
                    next: { revalidate: 3600 },
                });
                if (mediaRes.ok) {
                    const media = await mediaRes.json();
                    return media?.source_url || null;
                }
            }
        }

        return null;
    } catch (error) {
        console.error('Error fetching site logo:', error);
        return null;
    }
}

