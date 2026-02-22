const query = `
  query GetModalProducts($slugStr: String!) {
    filterDiscovery: products(first: 5, where: { categoryIn: [$slugStr] }) {
      nodes {
        name
        ... on SimpleProduct {
          attributes {
            nodes {
              name
              label
              ... on GlobalProductAttribute {
                slug
                terms {
                  nodes {
                    name
                    slug
                  }
                }
              }
            }
          }
        }
        ... on VariableProduct {
          attributes {
            nodes {
              name
              label
              ... on GlobalProductAttribute {
                slug
                terms {
                  nodes {
                    name
                    slug
                  }
                }
              }
            }
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
