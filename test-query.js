const query = `
query GetProducts($categoryName: String) {
  products(where: { category: $categoryName, orderby: [{ field: PRICE, order: DESC }] }, first: 2) {
    nodes {
      name
      databaseId
      ... on SimpleProduct { price }
    }
  }
}`;

fetch('https://maytinhlmc.vn/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        query,
        variables: {
            categoryName: 'laptop'
        }
    })
}).then(r => r.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(console.error);
