"use server";

import { wpgraphqlFetch } from '@/lib/graphql/fetcher';
import { GET_RELATED_PRODUCTS, GET_RANDOM_PRODUCTS } from '@/lib/graphql/queries';

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
