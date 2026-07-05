const fetch = require('node-fetch');

async function run() {
    try {
        let res = await fetch('https://apiserver.maytinhlmc.vn/wp-json/jwt-auth/v1/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'password' })
        });
        const text = await res.text();
        console.log("Status:", res.status);
        console.log("Body:", text);
    } catch(e) { console.error(e.message); }
}
run();
