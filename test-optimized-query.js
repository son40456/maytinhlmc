
const fetch = require('node-fetch');

const query = `
  query GetNodeBySlug(
    $slug: String!, 
    $first: Int = 12, 
    $after: String = "",
    $minPrice: Float,
    $maxPrice: Float,
    $orderBy: [ProductsOrderbyInput] = [{ field: DATE, order: DESC }]
  ) {
    product(id: $slug, idType: SLUG) {
      id
      name
    }
    productCategory(id: $slug, idType: SLUG) {
      id
      name
      products(first: 5) {
        nodes {
          name
        }
      }
    }
    categoryProducts: products(
      first: $first, 
      after: $after, 
      where: { categoryIn: [$slug], minPrice: $minPrice, maxPrice: $maxPrice, orderby: $orderBy }
    ) {
      nodes {
        name
      }
    }
  }
`;

async function testSlug(slug) {
    console.log(`Testing slug: ${slug}`);
    const res = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            variables: {
                slug,
                first: 12,
                after: "",
                orderBy: [{ field: "DATE", order: "DESC" }]
            }
        })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}

testSlug('mainboard-bo-mach-chu'); // Category
testSlug('mainboard-asus-rog-strix-z790-a-gaming-wifi-ii'); // Probable product slug
