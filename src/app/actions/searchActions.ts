"use server";

import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const SEARCH_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || '';
const INDEX_NAME = process.env.MEILISEARCH_INDEX_NAME || 'products';

const client = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: SEARCH_KEY,
});

function formatVND(amount: number | null | undefined): string {
    if (!amount || amount <= 0) return 'Liên hệ';
    return amount.toLocaleString('vi-VN') + ' ₫';
}

function mapHit(hit: any) {
    const displayPrice = hit.price || hit.regularPrice || hit.salePrice;
    return {
        id: hit.objectID || hit.id,
        databaseId: parseInt(hit.id),
        name: hit.name,
        slug: hit.slug,
        price: formatVND(displayPrice),
        image: {
            sourceUrl: hit.image,
            altText: hit.name || ''
        }
    };
}

/** Live overlay search (top N hits only) */
export async function searchProductsLive(query: string, hitsPerPage: number = 6) {
    if (!query || query.trim().length < 2) return [];
    try {
        const index = client.index(INDEX_NAME);
        const searchResponse = await index.search(query, { limit: hitsPerPage });
        return (searchResponse.hits || []).map(mapHit);
    } catch (error) {
        console.error("Error fetching Meilisearch search results:", error);
        return [];
    }
}

/** Full paginated search for the /search results page */
export async function searchProductsPaginated(
    query: string,
    page: number = 1,
    hitsPerPage: number = 24
): Promise<{ products: ReturnType<typeof mapHit>[]; totalHits: number; totalPages: number }> {
    if (!query || query.trim().length < 2) return { products: [], totalHits: 0, totalPages: 0 };
    try {
        const index = client.index(INDEX_NAME);
        const offset = (page - 1) * hitsPerPage;
        const searchResponse = await index.search(query, {
            limit: hitsPerPage,
            offset,
        });
        const totalHits = searchResponse.estimatedTotalHits ?? searchResponse.hits.length;
        const totalPages = Math.ceil(totalHits / hitsPerPage);
        return {
            products: (searchResponse.hits || []).map(mapHit),
            totalHits,
            totalPages,
        };
    } catch (error) {
        console.error("Error fetching paginated search results:", error);
        return { products: [], totalHits: 0, totalPages: 0 };
    }
}
