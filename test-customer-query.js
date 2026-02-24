const url = "https://maytinhlmc.vn/graphql";

async function testQuery() {
    const query = `
      query GetCust {
        customer(customerId: 1) {
            billing {
                address1
                city
                state
                phone
                email
            }
            orders(first: 1) {
                nodes {
                    lineItems {
                        nodes {
                            product {
                                node {
                                    name
                                    slug
                                }
                            }
                            quantity
                            total
                        }
                    }
                }
            }
        }
      }
    `;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
testQuery();
