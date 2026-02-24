const fetch = require('node-fetch');

async function testQuery() {
    const res = await fetch('https://maytinhlmc.vn/wp-json/wp/v2/settings');
    const json = await res.json();
    console.log("Settings:", json);

    // Also check theme mods?
}

testQuery();
