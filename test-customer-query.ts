import { loadEnvConfig } from '@next/env';
import fetch from 'node-fetch';

loadEnvConfig(process.cwd());

const url = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

async function testQuery() {
    const query = `
      query GetCust {
        customer(customerId: 1) {
            billing {
                address1
                city
                state
                phone
                email
            }
            orders(first: 1) {
                nodes {
                    lineItems {
                        nodes {
                            product {
                                node {
                                    name
                                    image { sourceUrl }
                                }
                            }
                            quantity
                            total
                        }
                    }
                }
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
    console.log(JSON.stringify(json, null, 2));
}
testQuery();
