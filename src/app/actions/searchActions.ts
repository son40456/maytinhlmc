"use server";

import { MeiliSearch } from 'meilisearch';
import { unstable_cache } from 'next/cache';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const SEARCH_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || '';
const INDEX_NAME = process.env.MEILISEARCH_INDEX_NAME || 'products';

// Singleton client - reuse across requests
let _client: MeiliSearch | null = null;
function getClient() {
    if (!_client) {
        _client = new MeiliSearch({ host: MEILISEARCH_HOST, apiKey: SEARCH_KEY });
    }
    return _client;
}

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

/** Live overlay search (top N hits only) - cached 60s */
export const searchProductsLive = unstable_cache(
    async (query: string, hitsPerPage: number = 6) => {
        if (!query || query.trim().length < 2) return [];
        try {
            const index = getClient().index(INDEX_NAME);
            const searchResponse = await index.search(query, { limit: hitsPerPage });
            return (searchResponse.hits || []).map(mapHit);
        } catch (error) {
            console.error("Error fetching Meilisearch search results:", error);
            return [];
        }
    },
    ['search-live'],
    { revalidate: 60 }
);

/** Full paginated search for the /search results page - cached 60s */
export const searchProductsPaginated = unstable_cache(
    async (
        query: string,
        page: number = 1,
        hitsPerPage: number = 24
    ): Promise<{ products: ReturnType<typeof mapHit>[]; totalHits: number; totalPages: number }> => {
        if (!query || query.trim().length < 2) return { products: [], totalHits: 0, totalPages: 0 };
        try {
            const index = getClient().index(INDEX_NAME);
            const offset = (page - 1) * hitsPerPage;
            const searchResponse = await index.search(query, { limit: hitsPerPage, offset });
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
    },
    ['search-paginated'],
    { revalidate: 60 }
);
