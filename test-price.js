const query = `query GetProducts($minPrice: Float, $maxPrice: Float) {
  products(where: { minPrice: $minPrice, maxPrice: $maxPrice }, first: 2) {
    nodes {
      name
      ... on SimpleProduct { price }
    }
  }
}`;

fetch('https://maytinhlmc.vn/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query,
        variables: { minPrice: 1000000, maxPrice: 5000000 }
    })
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(console.error);
