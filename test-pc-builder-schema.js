const fetch = require('node-fetch');

const query = `
  query GetSchema {
    __type(name: "SimpleProduct") {
      fields {
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
        const fields = json.data.__type.fields.map(f => f.name);
        console.log("thongtinsanpham exists:", fields.includes("thongtinsanpham"));
        console.log("thontinsanpham exists:", fields.includes("thontinsanpham"));
        console.log("thongsokythuatsonbn exists:", fields.includes("thongsokythuatsonbn"));
        
        // Find any fields starting with thong
        console.log("Other fields:", fields.filter(f => f.startsWith('tho')));
    } catch(e) { console.error(e.message); }
}
run();
