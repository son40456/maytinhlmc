
const fetch = require('node-fetch');

async function checkProductAttributes(slug) {
    const productQuery = `
    query GetProductAttrs($id: ID!) {
      product(id: $id, idType: SLUG) {
        name
        attributes {
          nodes {
            name
            label
            options
            ... on GlobalProductAttribute {
              slug
            }
          }
        }
      }
    }
  `;
    const res = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            query: productQuery,
            variables: { id: slug }
        })
    });
    const json = await res.json();
    console.log(`Attributes for ${slug}:`);
    if (json.data && json.data.product) {
        console.log(JSON.stringify(json.data.product.attributes.nodes, null, 2));
    } else {
        console.log('Product not found or error:', JSON.stringify(json, null, 2));
    }
}

checkProductAttributes('mainboard-gigabyte-b850m-aorus-pro-wifi-7-hang-nk');
