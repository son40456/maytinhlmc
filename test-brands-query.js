const { wpgraphqlFetch } = require('./src/lib/graphql/fetcher');

const query = `
  query GetBrands {
    paThuongHieus(first: 100) {
      nodes {
        name
        slug
        count
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
`;

async function run() {
  const data = await wpgraphqlFetch(query);
  console.log(JSON.stringify(data, null, 2));
}

run();
