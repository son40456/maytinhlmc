const fetch = require('node-fetch');
const cheerio = require('cheerio'); // Using regex if cheerio not available

async function testFetchLogo() {
    try {
        const res = await fetch('https://maytinhlmc.vn');
        const html = await res.text();
        const startIdx = html.indexOf('class="header-logo-dark"');
        if (startIdx !== -1) {
            const imgTagStart = html.indexOf('<img', startIdx);
            const imgTagEnd = html.indexOf('>', imgTagStart);
            const imgTag = html.substring(imgTagStart, imgTagEnd);
            const srcMatch = imgTag.match(/src="([^"]+)"/);
            if (srcMatch && srcMatch[1]) {
                console.log("Scraped Logo:", srcMatch[1]);
            }
        } else {
            const match = html.match(/<a[^>]+class="[^"]*logo[^"]*"[^>]*>\s*<img[^>]+src="([^"]+)"/i) ||
                html.match(/<img[^>]+class="[^"]*logo[^"]*"[^>]+src="([^"]+)"/i);
            if (match) {
                console.log("Regex Logo:", match[1]);
            }
        }
    } catch (e) {
        console.error(e);
    }
}
testFetchLogo();
