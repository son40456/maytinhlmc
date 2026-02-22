
const fetch = require('node-fetch');

const query = `
  query IntrospectTaxonomies {
    __type(name: "ProductTaxonomyEnum") {
      enumValues {
        name
        description
      }
    }
  }
`;

async function introspect() {
    const res = await fetch('https://maytinhlmc.vn/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await res.json();
    if (json.errors) {
        console.error('Errors:', JSON.stringify(json.errors, null, 2));
    }
    if (json.data && json.data.__type) {
        console.log(JSON.stringify(json.data.__type.enumValues, null, 2));
    } else {
        console.log('No data found for ProductTaxonomyEnum');
        console.log('JSON structure:', JSON.stringify(json, null, 2));
    }
}

introspect();
