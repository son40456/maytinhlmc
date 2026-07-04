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
        next: { revalidate: 3600, tags: ['wordpress'] }, // Default ISR cache for 1 hour, tag for manual revalidation
        ...options,
    });

    const json = await res.json();
    // Không log lỗi GraphQL tự động - caller tự quyết định xử lý.
    // Một số lỗi là bình thường (VD: lookup product/category cùng lúc, slug thuộc loại kia).
    return json;
}

// Use React cache to deduplicate requests in the same render pass (Shared between Metadata and Page)
export const wpgraphqlFetch = cache(wpgraphqlFetchRaw);

