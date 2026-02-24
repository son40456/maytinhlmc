const { loadEnvConfig } = require('@next/env');
const fetch = require('node-fetch');

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function testQuery() {
    const query = `
      query GetLogoCandidate {
        allSettings {
            generalSettingsTitle
            generalSettingsDescription
        }
        mediaItems(where: { search: "logo" }, first: 5) {
            nodes {
                id
                sourceUrl
                altText
                title
            }
        }
      }
    `;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log("Response:", JSON.stringify(json, null, 2));
}

testQuery();
