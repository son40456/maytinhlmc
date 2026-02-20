const query = `query GetProductsByCategory($slug: String!) {
  products(first: 5, where: { categoryIn: [$slug], minPrice: 1000000 }) {
    nodes { name }
  }
}`;
fetch('https://maytinhlmc.vn/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ query, variables: { slug: 'cpu-bo-vi-xu-ly' } })
})
  .then(r => r.json())
  .then(data => console.log(JSON.stringify(data, null, 2)))
  .catch(console.error);
