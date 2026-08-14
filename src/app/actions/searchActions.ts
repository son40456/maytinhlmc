"use server";

import { Client as TypesenseClient } from 'typesense';
import { unstable_cache } from 'next/cache';

const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = process.env.TYPESENSE_PORT || '8108';
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'test';
const COLLECTION_NAME = process.env.TYPESENSE_COLLECTION_NAME || 'products';

// Singleton client - reuse across requests
let _client: TypesenseClient | null = null;
function getClient() {
    if (!_client) {
        _client = new TypesenseClient({
            nodes: [{
                host: TYPESENSE_HOST,
                port: parseInt(TYPESENSE_PORT),
                protocol: TYPESENSE_PROTOCOL,
            }],
            apiKey: TYPESENSE_API_KEY,
            connectionTimeoutSeconds: 2
        });
    }
    return _client;
}

function formatVND(amount: number | null | undefined): string {
    if (!amount || amount <= 0) return 'Liên hệ';
    return amount.toLocaleString('vi-VN') + ' ₫';
}

function mapHit(hit: any) {
    const doc = hit.document;
    const displayPrice = doc.price || doc.regularPrice || doc.salePrice;
    return {
        id: doc.id,
        databaseId: parseInt(doc.id),
        name: doc.name,
        slug: doc.slug,
        price: formatVND(displayPrice),
        sku: doc.sku,
        regularPrice: doc.regularPrice ? formatVND(doc.regularPrice) : undefined,
        salePrice: doc.salePrice ? formatVND(doc.salePrice) : undefined,
        stockStatus: doc.stockStatus || 'IN_STOCK',
        image: {
            sourceUrl: doc.image,
            altText: doc.name || ''
        }
    };
}

/** Live overlay search (top N hits only) - cached 60s */
export const searchProductsLive = unstable_cache(
    async (query: string, hitsPerPage: number = 6) => {
        if (!query || query.trim().length < 2) return [];
        try {
            const searchParameters = {
                q: query,
                query_by: 'name,sku,slug',
                query_by_weights: '3,2,1',
                // infix search: tìm chuỗi con trong token (VD: "AE1000" khớp "GP-AE1000PM")
                infix: 'fallback,always,off',
                num_typos: '2,0,0',
                per_page: hitsPerPage
            };
            const searchResponse = await getClient().collections(COLLECTION_NAME).documents().search(searchParameters);
            return (searchResponse.hits || []).map(mapHit);
        } catch (error) {
            console.error("Error fetching Typesense search results:", error);
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
            const searchParameters = {
                q: query,
                query_by: 'name,sku,slug',
                query_by_weights: '3,2,1',
                // infix search: tìm chuỗi con trong token (VD: "AE1000" khớp "GP-AE1000PM")
                infix: 'fallback,always,off',
                num_typos: '2,0,0',
                page: page,
                per_page: hitsPerPage
            };
            const searchResponse = await getClient().collections(COLLECTION_NAME).documents().search(searchParameters);
            const totalHits = searchResponse.found || 0;
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

