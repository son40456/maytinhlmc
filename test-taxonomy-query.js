const { wpgraphqlFetch } = require('./src/lib/graphql/fetcher');

const query = `
  query GetCategorizedBrands {
    productCategory(id: "man-hinh-may-tinh", idType: SLUG) {
      name
      products(first: 100) {
        nodes {
          ... on SimpleProduct {
            paThuongHieus {
              nodes {
                name
                slug
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
`;

async function run() {
  const data = await wpgraphqlFetch(query);
  console.log(JSON.stringify(data, null, 2));
}

run();
