
const fetch = require('node-fetch');

const query = `
  query GetNodeBySlug(
    $slugId: ID!, 
    $slugStr: String!,
    $first: Int = 12, 
    $after: String = "",
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }],
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    productCategory(id: $slugId, idType: SLUG) {
      name
    }
    categoryProducts: products(
      first: $first, 
      after: $after, 
      where: { 
        categoryIn: [$slugStr], 
        minPrice: $minPrice, 
        maxPrice: $maxPrice, 
        orderby: $orderBy,
        taxonomyFilter: { filters: $taxFilters }
      }
    ) {
      nodes {
        name
        slug
      }
    }
  }
`;

async function testDynamicFilter(slug, attr, value) {
  console.log(`Testing slug: ${slug} with ${attr}: ${value}`);

  // Map 'thuong-hieu' -> 'PA_THUONG_HIEU'
  const taxonomy = 'PA_' + attr.toUpperCase().replace(/-/g, '_');

  const taxFilters = [
    {
      taxonomy: taxonomy,
      terms: [value],
      operator: 'IN'
    }
  ];

  const res = await fetch('https://maytinhlmc.vn/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: {
        slugId: slug,
        slugStr: slug,
        first: 5,
        taxFilters
      }
    })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

testDynamicFilter('mainboard-bo-mach-chu', 'thuong-hieu', 'gigabyte');
testDynamicFilter('mainboard-bo-mach-chu', 'chipset', 'b850');
