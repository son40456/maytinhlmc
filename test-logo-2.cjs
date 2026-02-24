const { loadEnvConfig } = require('@next/env');
const fetch = require('node-fetch');

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function testQuery() {
    const query = `
      query GetLogo {
        allSettings {
            generalSettingsTitle
            generalSettingsDescription
        }
      }
    `;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log("allSettings:", JSON.stringify(json, null, 2));

    const query2 = `
      query GetSiteLogo {
        getSettings {
            title
        }
      }
    `;
    const res2 = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query2 })
    });
    const json2 = await res2.json();
    console.log("getSettings:", JSON.stringify(json2, null, 2));
}

testQuery();
