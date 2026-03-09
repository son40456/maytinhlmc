const q = `
  query GetNodeBySlug(
    $slugId: ID!, 
    $slugStr: String!,
    $first: Int = 24, 
    $after: String = "",
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }],
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    product(id: $slugId, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
        stockStatus
      }
      attributes {
        nodes {
          name
          label
        }
      }
    }
  }
`;

fetch("https://next.maytinhlmc.vn/graphql", {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    query: q,
    variables: {
      slugId: "vga-leadtek-winfast-rtx-3070-ti-hurricane-8gb-gddr6x",
      slugStr: "vga-leadtek-winfast-rtx-3070-ti-hurricane-8gb-gddr6x"
    }
  })
})
.then(res => res.text())
.then(console.log)
.catch(console.error);
