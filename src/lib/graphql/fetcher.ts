import { cache } from 'react';

async function wpgraphqlFetchRaw<T>(
    query: string,
    variables: Record<string, any> = {},
    options: RequestInit = {}
): Promise<{ data?: T; errors?: any[] }> {
    const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
    if (!url) {
        console.error("Missing NEXT_PUBLIC_WORDPRESS_API_URL environment variable.");
        return { data: undefined };
    }

    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        body: JSON.stringify({
            query,
            variables,
        }),
        next: { revalidate: 3600 }, // Default ISR cache for 1 hour
        ...options,
    });

    const text = await res.text();
    try {
        const json = JSON.parse(text);
        return json;
    } catch (err) {
        console.error("WpGraphQL Parse Error. URL:", url);
        console.error("Raw response snippet:", text.slice(0, 500));
        throw err;
    }
}

// Use React cache to deduplicate requests in the same render pass (Shared between Metadata and Page)
export const wpgraphqlFetch = cache(wpgraphqlFetchRaw);

