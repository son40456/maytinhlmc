import { NextResponse } from "next/server";
import { wpgraphqlFetch } from "@/lib/graphql/fetcher";

const FILTER_QUERY = `
    query GetCategoryFiltersPage($slugStr: String!, $after: String) {
        filterDiscoveryFresh: products(
            first: 100,
            after: $after,
            where: { categoryIn: [$slugStr] }
        ) {
            pageInfo { hasNextPage endCursor }
            nodes {
                ... on SimpleProduct {
                    attributes {
                        nodes {
                            name label
                            ... on GlobalProductAttribute {
                                slug
                                terms {
                                    nodes { name slug }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "cpu-bo-vi-xu-ly";
  
  const fd = await wpgraphqlFetch(FILTER_QUERY, {
      slugStr: slug,
      after: null,
  });

  return NextResponse.json(fd);
}
