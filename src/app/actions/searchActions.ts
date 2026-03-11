"use server";

import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const SEARCH_KEY = process.env.NEXT_PUBLIC_MEILISEARCH_SEARCH_KEY || ''; // Can be search key or master key
const INDEX_NAME = process.env.MEILISEARCH_INDEX_NAME || 'products';

const client = new MeiliSearch({
    host: MEILISEARCH_HOST,
    apiKey: SEARCH_KEY,
});

export async function searchProductsLive(query: string, hitsPerPage: number = 6) {
    if (!query || query.trim().length < 2) return [];

    try {
        const index = client.index(INDEX_NAME);
        const searchResponse = await index.search(query, {
            limit: hitsPerPage,
        });

        const hits = searchResponse.hits || [];

        return hits.map((hit: any) => {
            return {
                id: hit.objectID, // Maintain original GraphQL ID for React keys if possible
                databaseId: parseInt(hit.id),
                name: hit.name,
                slug: hit.slug,
                price: hit.price ? `${hit.price.toLocaleString('vi-VN')} ₫` : 'Liên hệ',
                image: {
                    sourceUrl: hit.image,
                    altText: hit.name || ''
                }
            };
        });
    } catch (error) {
        console.error("Error fetching Meilisearch search results:", error);
        return [];
    }
}
