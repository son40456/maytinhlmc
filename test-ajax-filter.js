const fetch = require('node-fetch');

const query = `
  query GetProductsByCategory(
    $slugStr: String!,
    $taxFilters: [ProductTaxonomyFilterInput]
  ) {
    products(
      where: { 
        categoryIn: [$slugStr], 
        taxonomyFilter: { filters: $taxFilters }
      }
    ) {
      nodes {
        name
      }
    }
  }
`;

async function test(taxonomy) {
    console.log(`Testing with taxonomy: ${taxonomy}`);
    const res = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query,
            variables: {
                slugStr: "mainboard-bo-mach-chu",
                taxFilters: [
                    {
                        taxonomy: taxonomy,
                        terms: ["asus"],
                        operator: "IN"
                    }
                ]
            }
        })
    });
    const json = await res.json();
    if (json.errors) {
        console.log(`Error for ${taxonomy}:`, json.errors[0].message);
    } else {
        console.log(`Success for ${taxonomy}: Found ${json.data.products.nodes.length} products`);
        if (json.data.products.nodes.length > 0) {
            console.log("Example:", json.data.products.nodes[0].name);
        }
    }
}

async function runTests() {
    await test("PA_THUONG_HIEU");
    await test("PA_BRAND");
}

runTests();
