const fetch = require('node-fetch');

async function testCheckoutFlow() {
    console.log('1. Add to Cart');
    let sessionToken = '';

    const addToCartQuery = `mutation AddToCart {
    addToCart(input: { productId: 192089, quantity: 1 }) {
      cartItem { key }
    }
  }`;

    const res1 = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: addToCartQuery })
    });

    // Extract woocommerce-session from headers
    sessionToken = res1.headers.get('woocommerce-session');
    console.log('Session Token:', sessionToken);

    console.log('2. Checkout');
    const checkoutQuery = `mutation Checkout {
    checkout(input: {
      clientMutationId: "test-123",
      billing: {
        firstName: "Test",
        lastName: "User",
        address1: "123 Test St",
        city: "Hanoi",
        country: VN,
        email: "test@example.com",
        phone: "0123456789"
      },
      paymentMethod: "cod",
      isPaid: false
    }) {
      order { orderKey id total }
      result
    }
  }`;

    const res2 = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'woocommerce-session': sessionToken ? `Session ${sessionToken}` : ''
        },
        body: JSON.stringify({ query: checkoutQuery })
    });

    const data2 = await res2.json();
    console.log(JSON.stringify(data2, null, 2));
}

testCheckoutFlow().catch(console.error);
