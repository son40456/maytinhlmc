const query = `
mutation AddToCart {
  addToCart(input: {
    productId: 192089,
    quantity: 1
  }) {
    cartItem {
      key
      quantity
      product {
        node {
          name
        }
      }
    }
  }
}`;

fetch('https://maytinhlmc.vn/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
})
    .then(r => r.json())
    .then(data => console.log(JSON.stringify(data, null, 2)))
    .catch(console.error);
