const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
        await page.goto('https://uiverse.io/satyamchaudharydev/afraid-horse-51', { waitUntil: 'networkidle2' });
        
        // Wait a bit just in case
        await new Promise(r => setTimeout(r, 3000));
        
        const html = await page.content();
        console.log(html.substring(0, 500));
        
        const fs = require('fs');
        fs.writeFileSync('uiverse-page.html', html);
        
        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
