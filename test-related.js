const fetch = require('node-fetch');

const query = `
  query GetRelatedProducts {
    product(id: "mainboard-asus-rog-strix-x670e-a-gaming-wifi", idType: SLUG) {
      name
      related {
        nodes {
          id
          databaseId
          name
          slug
          image {
            sourceUrl
          }
          ... on SimpleProduct {
            price
            regularPrice
          }
        }
      }
    }
  }
`;

async function test() {
    const res = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}

test();
