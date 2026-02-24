const { loadEnvConfig } = require('@next/env');
const fetch = require('node-fetch');

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function testQuery() {
    const query = `
      query GetLogo {
        __type(name: "RootQueryToThemeSettingsConnectionEdge") {
            fields {
                name
            }
        }
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
    console.log(JSON.stringify(json, null, 2));
}

testQuery();
