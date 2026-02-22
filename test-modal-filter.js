const query = `
  query GetModalProducts($slugStr: String!) {
    filterDiscovery: products(first: 10, where: { categoryIn: [$slugStr] }) {
      nodes {
        __typename
        ... on SimpleProduct {
          name
          attributes {
            nodes { name label options ... on GlobalProductAttribute { slug } }
          }
        }
        ... on VariableProduct {
          name
          attributes {
            nodes { name label options ... on GlobalProductAttribute { slug } }
          }
        }
      }
    }
  }
`;

async function test() {
    try {
        const res = await fetch('https://maytinhlmc.vn/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query,
                variables: { slugStr: "cpu-bo-vi-xu-ly" }
            })
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
