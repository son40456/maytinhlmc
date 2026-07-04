import { wpgraphqlFetch } from "@/lib/graphql/fetcher";
import { GET_NODE_BY_SLUG } from "@/lib/graphql/queries";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug") || "cpu-bo-vi-xu-ly";
  
  const res = await wpgraphqlFetch(GET_NODE_BY_SLUG, {
    slugId: slug,
    slugStr: slug,
    first: 24,
    after: "",
    minPrice: null,
    maxPrice: null,
    orderBy: [{ field: "DATE", order: "DESC" }],
    taxFilters: null
  });
  
  return NextResponse.json(res);
}
