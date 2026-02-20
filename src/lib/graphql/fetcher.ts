export async function wpgraphqlFetch<T>(
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
        ...options,
    });

    const json = await res.json();
    if (json.errors) {
        console.error('WPGraphQL Errors:', json.errors);
    }
    return json;
}
