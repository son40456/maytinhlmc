const { loadEnvConfig } = require('@next/env');
const fetch = require('node-fetch');

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function testQuery() {
    const query = `
      query GetSiteSettings {
        allSettings {
            generalSettingsTitle
            generalSettingsDescription
        }
        themeSettings: getOption(name: "theme_mods_flatsome") {
            value
        }
      }
    `;
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    const json = await res.json();
    console.log("Settings:", JSON.stringify(json, null, 2));
}

testQuery();
