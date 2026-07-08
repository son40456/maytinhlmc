const fetch = require('node-fetch');

const query = `
  query GetProductsByIds($in: [Int]!) {
    products(first: 100, where: { include: $in }) {
      nodes {
        databaseId
        name
      }
    }
  }
`;

fetch('https://apiserver.maytinhlmc.vn/graphql', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query,
    variables: { in: [34558, 31318, 34655, 34524, 34387, 34146] }
  })
}).then(res => res.json()).then(data => console.log(JSON.stringify(data, null, 2))).catch(console.error);
