const fetch = require('node-fetch');

const query = `
query GetCategoryFiltersPage {
  filterDiscoveryFresh: products(
    first: 10
    where: {
      categoryIn: ["ram-bo-nho-trong"]
    }
  ) {
    nodes {
      ... on SimpleProduct {
        attributes {
          nodes {
            name
            ... on GlobalProductAttribute {
              slug
              terms {
                nodes {
                  name
                  slug
                  ... on PaThuongHieu {
                    logo {
                      logo {
                        node {
                          sourceUrl
                        }
                      }
                    }
                  }
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

async function run() {
    try {
        let res = await fetch('https://apiserver.maytinhlmc.vn/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch(e) { console.error(e.message); }
}
run();
