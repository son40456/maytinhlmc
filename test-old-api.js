const fetch = require('node-fetch');

const query = `
query GetOldLogos {
  terms(where: {taxonomies: PA_THUONGHIEU}, first: 10) {
    nodes {
      slug
      name
    }
  }
}
`;

async function run() {
    try {
        console.log("Testing next.maytinhlmc.vn...");
        let res = await fetch('https://next.maytinhlmc.vn/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        console.log(await res.text());
    } catch(e) { console.error(e.message); }

    try {
        console.log("Testing maytinhlmc.vn...");
        let res = await fetch('https://maytinhlmc.vn/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: query })
        });
        console.log(await res.text());
    } catch(e) { console.error(e.message); }
}
run();
