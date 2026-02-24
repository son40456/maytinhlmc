const fetch = require('node-fetch');

async function testFetchLogo() {
    try {
        const res = await fetch('https://maytinhlmc.vn');
        const html = await res.text();
        const match = html.match(/<img[^>]+class="[^"]*header-logo-dark[^"]*"[^>]+src="([^"]+)"/i) ||
            html.match(/<a[^>]+class="[^"]*logo[^"]*"[^>]*>\s*<img[^>]+src="([^"]+)"/i) ||
            html.match(/<img[^>]+src="([^"]+logo[^"]*)"/i);
        if (match) {
            console.log("Regex Logo:", match[1]);
        } else {
            console.log("Regex Logo not found");
        }
    } catch (e) {
        console.error(e);
    }
}
testFetchLogo();
