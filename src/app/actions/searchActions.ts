"use server";

import { algoliasearch } from 'algoliasearch';

const APP_ID = process.env.NEXT_PUBLIC_ALGOLIA_APP_ID || '1NV11FV7U1';
const SEARCH_KEY = process.env.NEXT_PUBLIC_ALGOLIA_SEARCH_KEY || '9ebfe59601da78e60a029a899c3b6aaa';
const INDEX_NAME = 'wp_posts_product';

// For algoliasearch >= 5.x
const client = algoliasearch(APP_ID, SEARCH_KEY);

const extractPrice = (htmlText: string) => {
    if (!htmlText) return '';
    const insMatch = htmlText.match(/<ins[^>]*>.*?<bdi>([^<]+)/);
    if (insMatch && insMatch[1]) return insMatch[1].replace(/&nbsp;/g, ' ').trim();

    const bdiMatch = htmlText.match(/<bdi>([^<]+)/);
    if (bdiMatch && bdiMatch[1]) return bdiMatch[1].replace(/&nbsp;/g, ' ').trim();

    return '';
};

export async function searchProductsLive(query: string, hitsPerPage: number = 6) {
    if (!query || query.trim().length < 2) return [];

    try {
        // v5.x client structure
        const response: any = await client.search({
            requests: [
                {
                    indexName: INDEX_NAME,
                    query: query,
                    hitsPerPage: hitsPerPage,
                }
            ]
        });

        const hits = response.results[0]?.hits || [];

        return hits.map((hit: any) => {
            let imageSrcStr = '';
            if (hit.images && typeof hit.images === 'object' && !Array.isArray(hit.images)) {
                imageSrcStr = hit.images?.thumbnail?.url || hit.images?.medium?.url || hit.images?.full?.url || hit.images?.shop_thumbnail?.url || '';
            }

            let permalinkStr = hit.permalink ? hit.permalink.replace(/https?:\/\/[^\/]+/, '') : '';
            if (permalinkStr.startsWith('/')) {
                permalinkStr = permalinkStr.substring(1);
            }

            const priceClean = extractPrice(hit.price_html);

            let highResImage = imageSrcStr;
            if (highResImage) {
                highResImage = highResImage.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
            }

            return {
                id: hit.objectID,
                databaseId: hit.post_id,
                name: hit.post_title,
                slug: permalinkStr,
                price: priceClean ? `${priceClean} ₫` : 'Liên hệ',
                image: {
                    sourceUrl: highResImage,
                    altText: hit.post_title || ''
                }
            };
        });
    } catch (error) {
        console.error("Error fetching Algolia search results:", error);
        return [];
    }
}
