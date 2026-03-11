require('dotenv').config({ path: '.env.local' });
const { MeiliSearch } = require('meilisearch');
const fetch = require('node-fetch');

const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY;
const INDEX_NAME = process.env.MEILISEARCH_INDEX_NAME || 'products';

if (!WORDPRESS_API_URL || !MEILISEARCH_MASTER_KEY) {
  console.error('❌ Missing environment variables. Please check NEXT_PUBLIC_WORDPRESS_API_URL and MEILISEARCH_MASTER_KEY in .env.local');
  process.exit(1);
}

const client = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_MASTER_KEY,
});

const GET_ALL_PRODUCTS = `
  query GetAllProducts($first: Int, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        description
        shortDescription
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          sku
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          sku
          image {
            sourceUrl
            altText
          }
          productCategories {
            nodes {
              name
              slug
            }
          }
        }
      }
    }
  }
`;

async function fetchProducts(after = null) {
  const response = await fetch(WORDPRESS_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: GET_ALL_PRODUCTS,
      variables: { first: 100, after },
    }),
  });

  const json = await response.json();
  if (json.errors) {
    console.error('Core GraphQL Errors:', JSON.stringify(json.errors, null, 2));
    throw new Error('Failed to fetch products from WordPress');
  }
  return json.data.products;
}

const extractPrice = (htmlText) => {
  if (!htmlText) return null;
  // Strip all HTML tags first
  const stripped = htmlText.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, '').trim();
  // Remove currency symbol and whitespace
  const cleaned = stripped.replace(/₫/g, '').replace(/\s/g, '').trim();
  // Vietnamese format: dots as thousands separator (e.g. "2.090.000")
  // Remove all dots, then parse as integer
  const noSeparators = cleaned.replace(/\./g, '').replace(/,/g, '');
  const parsed = parseInt(noSeparators);
  return isNaN(parsed) || parsed <= 0 ? null : parsed;
};

function formatProduct(node) {
  let imageSrc = node.image?.sourceUrl || '';
  if (imageSrc) {
    // Try to get high res image by removing dimensions
    imageSrc = imageSrc.replace(/-\d+x\d+(\.[a-zA-Z]+)$/, '$1');
  }

  return {
    id: node.databaseId.toString(), // Meilisearch ID must be a string and unique
    objectID: node.id,
    name: node.name,
    slug: node.slug,
    description: node.description,
    shortDescription: node.shortDescription,
    price_html: node.price,
    price: extractPrice(node.price),
    regularPrice: extractPrice(node.regularPrice),
    salePrice: extractPrice(node.salePrice),
    sku: node.sku,
    image: imageSrc,
    categories: node.productCategories?.nodes.map(c => c.name) || [],
    categorySlugs: node.productCategories?.nodes.map(c => c.slug) || [],
  };
}

async function main() {
  console.log('🚀 Starting Meilisearch indexing...');
  
  try {
    let allProducts = [];
    let hasNextPage = true;
    let after = null;

    while (hasNextPage) {
      console.log(`📦 Fetching products... ${after ? `(after: ${after})` : '(start)'}`);
      const data = await fetchProducts(after);
      const nodes = data.nodes || [];
      allProducts = allProducts.concat(nodes.map(formatProduct));
      
      hasNextPage = data.pageInfo.hasNextPage;
      after = data.pageInfo.endCursor;
    }

    console.log(`✅ Fetched ${allProducts.length} products total.`);

    const index = client.index(INDEX_NAME);

    console.log('⚙️ Updating index settings...');
    await index.updateSettings({
      searchableAttributes: ['name', 'sku', 'description', 'shortDescription'],
      filterableAttributes: ['price', 'categories', 'categorySlugs'],
      sortableAttributes: ['price'],
    });

    console.log('📤 Uploading documents to Meilisearch...');
    const task = await index.addDocuments(allProducts, { primaryKey: 'id' });
    console.log(`⏳ Task created. Task ID: ${task.taskUid}`);
    
    console.log('🏁 Indexing process initiated. It may take a moment to complete on the server.');
  } catch (error) {
    console.error('❌ Indexing failed:', error);
    process.exit(1);
  }
}

main();
