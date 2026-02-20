const query = `
mutation Checkout {
  checkout(input: {
    clientMutationId: "test-123",
    billing: {
      firstName: "Test",
      lastName: "User",
      address1: "123 Test St",
      city: "Hanoi",
      country: "VN",
      email: "test@example.com",
      phone: "0123456789"
    },
    shipping: {
      firstName: "Test",
      lastName: "User",
      address1: "123 Test St",
      city: "Hanoi",
      country: "VN"
    },
    paymentMethod: "cod",
    isPaid: false,
    lineItems: [
      { productId: 192089, quantity: 1 }
    ]
  }) {
    clientMutationId
    order {
      id
      databaseId
      orderKey
      total
    }
    result
    redirect
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
