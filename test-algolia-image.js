const { algoliasearch } = require("algoliasearch");
const client = algoliasearch("1NV11FV7U1", "9ebfe59601da78e60a029a899c3b6aaa");

async function run() {
    try {
        const { results } = await client.search([
            { indexName: "wp_posts_product", query: "Bàn phím" }
        ]);
        if (results[0].hits.length > 0) {
           const hit = results[0].hits.find(h => h.images && !Array.isArray(h.images));
           console.log(JSON.stringify(hit ? hit.images : results[0].hits[0], null, 2));
           console.log("Permalink:", hit ? hit.permalink : results[0].hits[0].permalink);
        }
    } catch (e) {
        console.error(e.message);
    }
}
run();
