const fetch = require('node-fetch');
async function run() {
  const query = `
    query GetAllCoupons {
      coupons {
        nodes {
          code
          amount
          discountType
        }
      }
    }
  `;
  const fs = require('fs');
  const envFile = fs.readFileSync('.env.local', 'utf8');
  const apiUrl = envFile.split('\n').find(l => l.startsWith('NEXT_PUBLIC_WORDPRESS_API_URL')).split('=')[1].replace(/"/g, '');
  
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}
run();
