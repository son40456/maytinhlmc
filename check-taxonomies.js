const fetch = require('node-fetch');

const query = `
  query GetTaxonomies {
    __type(name: "TaxonomyEnum") {
      enumValues {
        name
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
