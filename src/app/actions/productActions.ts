"use server";

import { wpgraphqlFetch } from '@/lib/graphql/fetcher';
import { GET_RELATED_PRODUCTS, GET_RANDOM_PRODUCTS, GET_PRODUCT_BY_SLUG } from '@/lib/graphql/queries';

export async function fetchRelatedProducts(slug: string) {
    try {
        const result = await wpgraphqlFetch<any>(GET_RANDOM_PRODUCTS, {
            first: 20
        });

        if (result.errors) {
            console.error("fetchRelatedProducts GraphQL Errors:", result.errors);
            return [];
        }

        const allProducts = result.data?.products?.nodes || [];

        // Remove the current product from the list to avoid showing the same product being added
        const filteredProducts = allProducts.filter((p: any) => p.slug !== slug);

        // Shuffle array to randomize products
        const shuffled = [...filteredProducts].sort(() => 0.5 - Math.random());

        return shuffled.slice(0, 4).map((node: any) => ({
            id: node.id,
            databaseId: node.databaseId,
            name: node.name,
            slug: node.slug,
            price: node.price || node.regularPrice || "0",
            image: node.image?.sourceUrl || null,
        }));
    } catch (error) {
        console.error("fetchRelatedProducts Exception:", error);
        return [];
    }
}

export async function fetchProductsForCompare(slugs: string[]) {
    try {
        const results = await Promise.all(
            slugs.map(async (slug) => {
                const { data } = await wpgraphqlFetch<any>(GET_PRODUCT_BY_SLUG, { slug });
                return data?.product || null;
            })
        );
        return results.filter(Boolean).map((p: any) => ({
            id: p.id,
            databaseId: p.databaseId,
            name: p.name,
            slug: p.slug,
            price: (p.price || p.regularPrice || "Liên hệ").replace(/&nbsp;/g, ' '),
            regularPrice: p.regularPrice?.replace(/&nbsp;/g, ' ') || null,
            salePrice: p.salePrice?.replace(/&nbsp;/g, ' ') || null,
            image: p.image?.sourceUrl || null,
            sku: p.sku || p.databaseId?.toString(),
            stockStatus: p.stockStatus || 'IN_STOCK',
            shortDescription: p.shortDescription?.replace(/<[^>]+>/g, '') || '',
            attributes: p.attributes?.nodes?.map((a: any) => ({
                name: a.name,
                options: a.options,
            })) || [],
            categories: p.productCategories?.nodes?.map((c: any) => c.name) || [],
        }));
    } catch (error) {
        console.error("fetchProductsForCompare Exception:", error);
        return [];
    }
}
