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

const GET_POPULAR_BRANDS = `
  query GetPopularBrands($categorySlug: String!) {
    products(first: 250, where: { categoryIn: [$categorySlug] }) {
      nodes {
        ... on SimpleProduct {
          attributes {
            nodes {
              name
              ... on GlobalProductAttribute {
                slug
                terms {
                  nodes {
                    name
                    slug
                  }
                }
              }
            }
          }
        }
        ... on VariableProduct {
          attributes {
            nodes {
              name
              ... on GlobalProductAttribute {
                slug
                terms {
                  nodes {
                    name
                    slug
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function fetchPopularBrandsByCategory(categorySlug: string) {
  if (!categorySlug) return [];
  try {
    const { data } = await wpgraphqlFetch<any>(GET_POPULAR_BRANDS, { categorySlug });
    const products = data?.products?.nodes || [];

    const brandCounts: Record<string, { name: string, count: number }> = {};

    products.forEach((product: any) => {
      const attributes = product?.attributes?.nodes || [];
      const brandAttr = attributes.find((attr: any) => attr.slug === 'pa_thuong-hieu' || attr.name?.toLowerCase().includes('thương hiệu'));

      if (brandAttr && brandAttr.terms?.nodes) {
        brandAttr.terms.nodes.forEach((term: any) => {
          if (term.slug) {
            if (!brandCounts[term.slug]) {
              brandCounts[term.slug] = { name: term.name, count: 0 };
            }
            brandCounts[term.slug].count += 1;
          }
        });
      }
    });

    // Tự động sắp xếp mức độ phổ biến (count giảm dần)
    const sortedBrands = Object.entries(brandCounts)
      .sort(([, a], [, b]) => b.count - a.count)
      .map(([slug, { name }]) => ({ name, slug }))
      .slice(0, 5); // Lấy top 5 thương hiệu

    return sortedBrands;

  } catch (e) {
    console.error("Error fetching popular brands:", e);
    return [];
  }
}
