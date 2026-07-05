const fetch = require('node-fetch');

const query = `
  mutation Login {
    login(input: {
      username: "test",
      password: "password"
    }) {
      authToken
      user {
        id
        name
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
