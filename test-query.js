const fetch = require('node-fetch');

const query = `
  query GetRecentPosts {
    posts(first: 3) {
      nodes {
        id
        title
        slug
        date
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

async function main() {
  const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "http://localhost/graphql"; // Will use actual .env if we load it
  const res = await fetch("https://lmc.ngocsondt.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const json = await res.json();
  console.log(JSON.stringify(json.data.posts.nodes, null, 2));
}
main();
