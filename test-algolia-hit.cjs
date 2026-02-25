const { algoliasearch } = require("algoliasearch");
const client = algoliasearch("1NV11FV7U1", "9ebfe59601da78e60a029a899c3b6aaa");

async function run() {
    try {
        const { results } = await client.search([
            { indexName: "wp_posts_product", query: "pc" }
        ]);
        if (results[0].hits.length > 0) {
            console.log(JSON.stringify(results[0].hits[0], null, 2));
        }
    } catch (e) {
        console.error(e.message);
    }
}
run();
