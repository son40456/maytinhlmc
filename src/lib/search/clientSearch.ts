/**
 * Client-side search wrapper for searchProductsLive Server Action.
 *
 * NOTE: We use the Server Action (not direct fetch) because:
 * - Meilisearch runs on HTTP, production site is HTTPS
 * - Browsers block mixed content requests
 */

import { searchProductsLive } from '@/app/actions/searchActions';

export interface SearchHit {
    id: string;
    name: string;
    slug: string;
    price: string;
    image?: { sourceUrl: string; altText: string };
}

export async function clientSearchProducts(query: string, limit = 6): Promise<SearchHit[]> {
    if (!query || query.trim().length < 2) return [];
    const hits = await searchProductsLive(query, limit);
    return (hits as any[]).map((h: any) => ({
        id: h.id || h.objectID || '',
        name: h.name,
        slug: h.slug,
        price: h.price,
        image: h.image,
    }));
}
