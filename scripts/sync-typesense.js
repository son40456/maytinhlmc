#!/usr/bin/env node

require("dotenv").config({ path: ".env.local" });

const Typesense = require("typesense");

/**
 * =========================================================
 * ENV
 * =========================================================
 */

const TYPESENSE_HOST =
  process.env.TYPESENSE_HOST || "typesense";

const TYPESENSE_PORT =
  parseInt(process.env.TYPESENSE_PORT || "8108", 10);

const TYPESENSE_PROTOCOL =
  process.env.TYPESENSE_PROTOCOL || "http";

const TYPESENSE_API_KEY =
  process.env.TYPESENSE_API_KEY;

const COLLECTION_NAME =
  process.env.TYPESENSE_COLLECTION_NAME || "products";

const WORDPRESS_API_URL =
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL;


/**
 * =========================================================
 * VALIDATE ENV
 * =========================================================
 */

if (!TYPESENSE_API_KEY) {
  console.error("❌ Missing TYPESENSE_API_KEY");
  process.exit(1);
}

if (!WORDPRESS_API_URL) {
  console.error(
    "❌ Missing NEXT_PUBLIC_WORDPRESS_API_URL"
  );
  process.exit(1);
}


/**
 * =========================================================
 * TYPESENSE CLIENT
 * =========================================================
 */

const client = new Typesense.Client({
  nodes: [
    {
      host: TYPESENSE_HOST,
      port: TYPESENSE_PORT,
      protocol: TYPESENSE_PROTOCOL,
    },
  ],
  apiKey: TYPESENSE_API_KEY,
  connectionTimeoutSeconds: 10,
});


/**
 * =========================================================
 * COLLECTION SCHEMA
 * =========================================================
 *
 * token_separators: tách `-`, `.` thành các token riêng
 *   VD: "GP-AE1000PM" → ["GP", "AE1000PM"]
 *
 * infix: true trên field sku + name → tìm chuỗi con trong token
 *   VD: "AE1000" khớp "AE1000PM"
 */

const COLLECTION_SCHEMA = {
  name: COLLECTION_NAME,
  token_separators: ["-", ".", "_", "/"],
  fields: [
    { name: "id",           type: "string" },
    { name: "name",         type: "string",  infix: true },
    { name: "slug",         type: "string",  optional: true },
    { name: "sku",          type: "string",  optional: true, infix: true },
    { name: "url",          type: "string",  optional: true },
    { name: "image",        type: "string",  optional: true },
    { name: "stock_status", type: "string",  optional: true },
    { name: "categories",   type: "string[]",optional: true },
    { name: "price",        type: "float",   optional: true },
    { name: "regular_price",type: "float",   optional: true },
    { name: "sale_price",   type: "float",   optional: true },
  ],
};


/**
 * =========================================================
 * GRAPHQL QUERY
 * =========================================================
 */

const GET_ALL_PRODUCTS = `
  query GetAllProducts($first: Int!, $after: String) {

    products(
      first: $first
      after: $after
      where: {
        status: "publish"
      }
    ) {

      pageInfo {
        hasNextPage
        endCursor
      }

      nodes {

        id
        databaseId
        name
        slug
        uri

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

        productCategories {
          nodes {
            name
            slug
          }
        }
      }
    }
  }
`;


/**
 * =========================================================
 * FETCH PRODUCTS FROM WORDPRESS
 * =========================================================
 */

async function fetchProductsFromWP() {

  const allProducts = [];

  let hasNextPage = true;
  let after = null;

  console.log("");
  console.log("======================================");
  console.log(" FETCH PRODUCTS FROM WORDPRESS");
  console.log("======================================");
  console.log("");

  while (hasNextPage) {

    console.log(
      `Fetching page... current total: ${allProducts.length}`
    );

    const response = await fetch(
      WORDPRESS_API_URL,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          query: GET_ALL_PRODUCTS,

          variables: {
            first: 100,
            after,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `WordPress HTTP error: ${response.status}`
      );
    }

    const json = await response.json();

    if (json.errors && json.errors.length > 0) {

      console.error(
        "GraphQL errors:",
        JSON.stringify(json.errors, null, 2)
      );

      throw new Error(
        "WordPress GraphQL request failed"
      );
    }

    const products =
      json?.data?.products;

    if (!products) {
      throw new Error(
        "Invalid GraphQL response"
      );
    }

    const nodes =
      products.nodes || [];

    allProducts.push(...nodes);

    hasNextPage =
      products.pageInfo.hasNextPage;

    after =
      products.pageInfo.endCursor;

    console.log(
      `Fetched: ${allProducts.length}`
    );
  }

  console.log("");
  console.log(
    `✅ Total products fetched: ${allProducts.length}`
  );
  console.log("");

  return allProducts;
}


/**
 * =========================================================
 * PRICE PARSER
 * =========================================================
 *
 * Examples:
 *
 * "29.990.000 ₫"
 * "29,990,000 ₫"
 * "29990000"
 *
 * => 29990000
 */

function parsePrice(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return undefined;
  }

  if (typeof value === "number") {
    return value;
  }

  const cleaned =
    String(value)
      .replace(/[^0-9.-]/g, "");

  if (!cleaned) {
    return undefined;
  }

  const number =
    parseFloat(cleaned);

  return Number.isFinite(number)
    ? number
    : undefined;
}


/**
 * =========================================================
 * NORMALIZE URL
 * =========================================================
 */

function normalizeUrl(uri) {

  if (!uri) {
    return "";
  }

  if (uri.startsWith("http://")) {
    return uri;
  }

  if (uri.startsWith("https://")) {
    return uri;
  }

  return `https://maytinhlmc.vn${uri}`;
}


/**
 * =========================================================
 * FORMAT PRODUCT
 * =========================================================
 */

function formatProduct(product) {

  const categories =
    product.productCategories?.nodes
      ?.map(category => category.name)
      .filter(Boolean) || [];


  const document = {

    /**
     * Typesense special ID
     *
     * Use databaseId because it is stable
     * and easy to reference from WooCommerce.
     */
    id: String(product.databaseId),

    name:
      product.name || "",

    slug:
      product.slug || "",

    sku:
      product.sku || "",

    stock_status:
      product.stockStatus || "",

    image:
      product.image?.sourceUrl || "",

    url:
      normalizeUrl(product.uri),

    categories,
  };


  /**
   * IMPORTANT:
   *
   * Do not send undefined values.
   */

  const price =
    parsePrice(product.price);

  const regularPrice =
    parsePrice(product.regularPrice);

  const salePrice =
    parsePrice(product.salePrice);


  if (price !== undefined) {
    document.price = price;
  }

  if (regularPrice !== undefined) {
    document.regular_price =
      regularPrice;
  }

  if (salePrice !== undefined) {
    document.sale_price =
      salePrice;
  }


  return document;
}


/**
 * =========================================================
 * TEST TYPESENSE CONNECTION
 * =========================================================
 */

async function testTypesense() {

  console.log("");
  console.log("======================================");
  console.log(" TEST TYPESENSE");
  console.log("======================================");

  console.log(
    `Server: ${TYPESENSE_PROTOCOL}://${TYPESENSE_HOST}:${TYPESENSE_PORT}`
  );

  const health =
    await client.health.retrieve();

  console.log(
    "Typesense health:",
    health
  );

  console.log("");
}


/**
 * =========================================================
 * RECREATE COLLECTION
 * =========================================================
 *
 * Xóa collection cũ và tạo lại với schema mới.
 * Cần làm vậy để token_separators và infix có hiệu lực.
 */

async function recreateCollection() {

  console.log("");
  console.log("======================================");
  console.log(" RECREATE COLLECTION");
  console.log("======================================");
  console.log("");

  // Xóa collection cũ nếu tồn tại
  try {
    await client.collections(COLLECTION_NAME).delete();
    console.log(`✔️  Deleted old collection: ${COLLECTION_NAME}`);
  } catch (err) {
    console.log(`ℹ️  Collection not found, will create fresh.`);
  }

  // Tạo collection mới với schema mới
  await client.collections().create(COLLECTION_SCHEMA);

  console.log(`✅ Created collection: ${COLLECTION_NAME}`);
  console.log(`   token_separators: ["-", ".", "_", "/"]`);
  console.log(`   infix fields: name, sku`);
  console.log("");
}


/**
 * =========================================================
 * IMPORT PRODUCTS
 * =========================================================
 */

async function importProducts(products) {

  console.log("");
  console.log("======================================");
  console.log(" IMPORT PRODUCTS INTO TYPESENSE");
  console.log("======================================");
  console.log("");

  if (!products.length) {

    console.log(
      "⚠️ No products to import."
    );

    return;
  }


  const documents =
    products.map(formatProduct);


  console.log(
    `Importing ${documents.length} products...`
  );


  /**
   * upsert:
   *
   * - New product -> create
   * - Existing product -> update
   *
   * This means running the script multiple times
   * is safe.
   */

  const results =
    await client
      .collections(COLLECTION_NAME)
      .documents()
      .import(
        documents,
        {
          action: "upsert",
        }
      );


  const failed =
    results.filter(
      result => result.success !== true
    );


  const success =
    results.length - failed.length;


  console.log("");
  console.log(
    `✅ Successful: ${success}`
  );

  console.log(
    `❌ Failed: ${failed.length}`
  );


  if (failed.length > 0) {

    console.log("");
    console.log("First failed document:");

    console.log(
      JSON.stringify(
        failed[0],
        null,
        2
      )
    );

    console.log("");
  }
}


/**
 * =========================================================
 * MAIN
 * =========================================================
 */

async function main() {

  try {

    console.log("");
    console.log("======================================");
    console.log(" LMC TYPESENSE SYNC");
    console.log("======================================");
    console.log("");


    // 1. Test Typesense connection

    await testTypesense();


    // 2. Recreate collection với schema mới
    //    (cần thiết để token_separators + infix có hiệu lực)

    await recreateCollection();


    // 3. Get products from WordPress

    const products =
      await fetchProductsFromWP();


    // 4. Import products

    await importProducts(
      products
    );


    // 4. Verify collection

    const collection =
      await client
        .collections(COLLECTION_NAME)
        .retrieve();


    console.log("");
    console.log("======================================");
    console.log(" SYNC COMPLETE");
    console.log("======================================");

    console.log(
      `Typesense documents: ${collection.num_documents}`
    );

    console.log("");


  } catch (error) {

    console.error("");
    console.error("======================================");
    console.error(" ❌ SYNC ERROR");
    console.error("======================================");

    console.error(
      error?.message || error
    );

    // Show root cause (e.g. ECONNREFUSED, ENOTFOUND, SSL error...)
    if (error?.cause) {
      console.error("Cause:", error.cause);
    }

    if (error?.response) {
      console.error(
        error.response
      );
    }

    console.error("");

    process.exit(1);
  }
}


main();
