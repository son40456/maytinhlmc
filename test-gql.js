const query = `
  query GetPostsPage($first: Int!, $after: String, $categoryName: String) {
    posts(first: $first, after: $after, where: { categoryName: $categoryName }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        title
        slug
        date
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
        categories {
          nodes {
            name
            slug
          }
        }
      }
    }
    categories(where: { hideEmpty: true }) {
      nodes {
        id
        name
        slug
        count
      }
    }
  }
`;

async function test() {
  const res = await fetch('https://apiserver.maytinhlmc.vn/graphql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      query,
      variables: { first: 5, after: "", categoryName: "" }
    })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

test();
