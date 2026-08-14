#!/usr/bin/env node

require('dotenv').config({ path: '.env.local' });
const Typesense = require('typesense');

const TYPESENSE_HOST = process.env.TYPESENSE_HOST || 'localhost';
const TYPESENSE_PORT = process.env.TYPESENSE_PORT || '8108';
const TYPESENSE_PROTOCOL = process.env.TYPESENSE_PROTOCOL || 'http';
const TYPESENSE_API_KEY = process.env.TYPESENSE_API_KEY || 'test';
const COLLECTION_NAME = process.env.TYPESENSE_COLLECTION_NAME || 'products';
const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;

if (!WORDPRESS_API_URL) {
    console.error("Missing NEXT_PUBLIC_WORDPRESS_API_URL environment variable.");
    process.exit(1);
}

const client = new Typesense.Client({
    nodes: [{
        host: TYPESENSE_HOST,
        port: parseInt(TYPESENSE_PORT),
        protocol: TYPESENSE_PROTOCOL,
    }],
    apiKey: TYPESENSE_API_KEY,
    connectionTimeoutSeconds: 5
});

const schema = {
    name: COLLECTION_NAME,
    // Split on `-` and `.` so "GP-AE1000PM" → tokens ["GP", "AE1000PM"]
    token_separators: ['-', '.', '_', '/'],
    fields: [
        { name: 'id', type: 'string' },
        { name: 'databaseId', type: 'int32' },
        // infix: 'always' enables substring search inside tokens
        { name: 'name', type: 'string', infix: true },
        { name: 'slug', type: 'string', optional: true },
        { name: 'price', type: 'float', optional: true },
        { name: 'regularPrice', type: 'float', optional: true },
        { name: 'salePrice', type: 'float', optional: true },
        { name: 'sku', type: 'string', optional: true, infix: true },
        { name: 'stockStatus', type: 'string', optional: true },
        { name: 'image', type: 'string', optional: true }
    ],
    default_sorting_field: 'databaseId'
};

const GET_ALL_PRODUCTS = `
  query GetAllProducts($first: Int!, $after: String) {
    products(first: $first, after: $after, where: { status: "publish" }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        ... on SimpleProduct {
          price
          sku
          regularPrice
          salePrice
          stockStatus
          image {
            sourceUrl
          }
        }
        ... on VariableProduct {
          price
          sku
          regularPrice
          salePrice
          stockStatus
          image {
            sourceUrl
          }
        }
      }
    }
  }
`;

async function fetchProductsFromWP() {
    let allProducts = [];
    let hasNextPage = true;
    let after = null;

    console.log("Fetching products from WooCommerce...");

    while (hasNextPage) {
        const response = await fetch(WORDPRESS_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: GET_ALL_PRODUCTS,
                variables: { first: 100, after }
            })
        });

        const json = await response.json();
        
        if (json.errors) {
            console.error("GraphQL Error:", json.errors);
            break;
        }

        const nodes = json.data.products.nodes;
        allProducts = allProducts.concat(nodes);

        hasNextPage = json.data.products.pageInfo.hasNextPage;
        after = json.data.products.pageInfo.endCursor;
        
        console.log(`Fetched ${allProducts.length} products so far...`);
    }

    return allProducts;
}

function parsePrice(priceStr) {
    if (!priceStr) return null;
    // Remove "₫", spaces, dots, commas
    const cleaned = priceStr.replace(/[^0-9]/g, '');
    return cleaned ? parseFloat(cleaned) : null;
}

async function main() {
    try {
        console.log("Starting Typesense indexing process...");

        // 1. Fetch products
        const products = await fetchProductsFromWP();
        console.log(`Total products to index: ${products.length}`);

        // 2. Format products
        const formattedProducts = products.map(product => {
            return {
                id: product.id,
                databaseId: product.databaseId,
                name: product.name || '',
                slug: product.slug || '',
                price: parsePrice(product.price),
                regularPrice: parsePrice(product.regularPrice),
                salePrice: parsePrice(product.salePrice),
                sku: product.sku || '',
                stockStatus: product.stockStatus || 'IN_STOCK',
                image: product.image?.sourceUrl || ''
            };
        });

        // 3. Recreate Typesense collection
        try {
            await client.collections(COLLECTION_NAME).delete();
            console.log(`Deleted existing collection: ${COLLECTION_NAME}`);
        } catch (err) {
            // Collection might not exist, which is fine
        }

        await client.collections().create(schema);
        console.log(`Created new collection: ${COLLECTION_NAME}`);

        // 4. Import documents
        if (formattedProducts.length > 0) {
            console.log(`Importing ${formattedProducts.length} documents...`);
            const importResults = await client.collections(COLLECTION_NAME).documents().import(formattedProducts, { action: 'create' });
            
            const failedItems = importResults.filter(item => item.success === false);
            if (failedItems.length > 0) {
                console.error(`Failed to import ${failedItems.length} documents.`);
                console.error(failedItems[0]);
            } else {
                console.log("All documents imported successfully!");
            }
        } else {
            console.log("No products found to import.");
        }

    } catch (error) {
        console.error("Error during indexing:", error);
    }
}

main();
