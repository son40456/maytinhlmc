const fetch = require('node-fetch');

const query = `
  query GetAllCategoryProducts($slugStr: String!, $first: Int = 100, $after: String) {
    products(first: $first, after: $after, where: { categoryIn: [$slugStr], orderby: [{ field: DATE, order: DESC }] }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          sku
          price
          attributes {
            nodes { 
              name label 
              ... on GlobalProductAttribute { 
                slug 
                terms { nodes { name slug } }
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
            body: JSON.stringify({ query: query, variables: { slugStr: "ram-bo-nho-trong", first: 10 } })
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch(e) { console.error(e.message); }
}
run();
