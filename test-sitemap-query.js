const fetch = require('node-fetch');
const endpoint = "https://next.maytinhlmc.vn/graphql";

const GET_ALL_URLS = `
  query GetAllUrls($first: Int!, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        slug
      }
    }
    productCategories(first: $first) {
      nodes {
        slug
      }
    }
    posts(first: $first) {
      nodes {
        slug
      }
    }
  }
`;

async function testQuery() {
    try {
        const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                query: GET_ALL_URLS,
                variables: { first: 5, after: null }
            })
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (err) {
        console.error("Fetch error:", err);
    }
}

testQuery();
