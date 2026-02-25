"use server";

import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const GET_ALL_CATEGORIES_FOR_ADMIN = `
  query GetAllCategoriesForAdmin {
    productCategories(first: 100, where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
      }
    }
  }
`;

export async function fetchAdminCategories() {
    try {
        const { data } = await wpgraphqlFetch<any>(GET_ALL_CATEGORIES_FOR_ADMIN);
        return data?.productCategories?.nodes || [];
    } catch (e) {
        console.error("Error fetching admin categories:", e);
        return [];
    }
}
