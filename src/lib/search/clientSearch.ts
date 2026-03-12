/**
 * Client-side search utility wrapping the Server Action.
 *
 * NOTE: We cannot call Meilisearch directly from the browser because:
 * - Meilisearch runs on HTTP (http://160.30.113.39:7700)
 * - The production site runs on HTTPS
 * - Browsers block mixed content (HTTPS page → HTTP request)
 *
 * The Server Action runs on the server where HTTP is fine.
 * We use a request ID counter to discard stale results.
 */

import { searchProductsLive } from '@/app/actions/searchActions';

export interface SearchHit {
    id: string;
    name: string;
    slug: string;
    price: string;
    image?: { sourceUrl: string; altText: string };
}

// Track the latest request ID to discard stale results
let latestRequestId = 0;

/**
 * Search products via Server Action with stale-result discarding.
 * Debounce should be applied by the caller.
 */
export async function clientSearchProducts(query: string, limit = 6): Promise<SearchHit[]> {
    if (!query || query.trim().length < 2) return [];

    const requestId = ++latestRequestId;

    try {
        const hits = await searchProductsLive(query, limit);

        // If a newer request was made, discard this stale result
        if (requestId !== latestRequestId) return [];

        return (hits as any[]).map((h: any) => ({
            id: h.id || h.objectID || '',
            name: h.name,
            slug: h.slug,
            price: h.price,
            image: h.image,
        }));
    } catch {
        return [];
    }
}
