const fetch = require('node-fetch');

async function testQuery() {
    const res = await fetch('https://maytinhlmc.vn/wp-json/');
    const json = await res.json();
    console.log("Site Logo REST API:", json.site_logo);
    console.log("Site Icon REST API:", json.site_icon_url);
}

testQuery();
