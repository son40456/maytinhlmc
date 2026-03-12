/**
 * Client-side direct Meilisearch search.
 * Bypasses the Next.js Server Action to call Meilisearch directly from the browser.
 * This eliminates the server round-trip, making instant search truly instant.
 *
 * ⚠️ Security: Only use with a search-only API key (not master key).
 * The key is exposed in the browser. Make sure NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY
 * is a restricted search-only key from Meilisearch.
 */

const HOST = process.env.NEXT_PUBLIC_MEILISEARCH_HOST || 'http://localhost:7700';
const SEARCH_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || '';
const INDEX = 'products';

export interface SearchHit {
    id: string;
    name: string;
    slug: string;
    price: string;
    image?: { sourceUrl: string; altText: string };
}

function formatVND(amount: number | null | undefined): string {
    if (!amount || amount <= 0) return 'Liên hệ';
    return amount.toLocaleString('vi-VN') + ' ₫';
}

let abortController: AbortController | null = null;

/**
 * Instant client-side search - calls Meilisearch REST API directly.
 * Cancels any in-flight request before making a new one.
 */
export async function clientSearchProducts(query: string, limit = 6): Promise<SearchHit[]> {
    if (!query || query.trim().length < 2) return [];

    // Cancel previous request
    if (abortController) {
        abortController.abort();
    }
    abortController = new AbortController();

    try {
        const res = await fetch(`${HOST}/indexes/${INDEX}/search`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SEARCH_KEY}`,
            },
            body: JSON.stringify({
                q: query,
                limit,
                attributesToRetrieve: ['id', 'objectID', 'name', 'slug', 'price', 'regularPrice', 'salePrice', 'image'],
            }),
            signal: abortController.signal,
        });

        if (!res.ok) throw new Error(`Meilisearch error: ${res.status}`);

        const data = await res.json();
        const hits = data.hits || [];

        return hits.map((hit: any) => {
            const displayPrice = hit.price || hit.regularPrice || hit.salePrice;
            return {
                id: hit.objectID || hit.id,
                name: hit.name,
                slug: hit.slug,
                price: formatVND(displayPrice),
                image: hit.image ? { sourceUrl: hit.image, altText: hit.name || '' } : undefined,
            };
        });
    } catch (err: any) {
        if (err.name === 'AbortError') return []; // Cancelled - ignore
        console.error('Search error:', err);
        return [];
    }
}
