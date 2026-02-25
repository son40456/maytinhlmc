const { algoliasearch } = require("algoliasearch");
const client = algoliasearch("1NV11FV7U1", "9ebfe59601da78e60a029a899c3b6aaa");
async function run() {
    try {
        const { results } = await client.search([
            { indexName: "wp_searchable_posts", query: "pc" }
        ]);
        console.log("Index wp_searchable_posts hits:", results[0].hits.length);
        if (results[0].hits.length > 0) {
           console.log(results[0].hits[0].post_title, results[0].hits[0].permalink);
        }
    } catch (e) { console.log("wp_searchable_posts:", e.message); }
    
    try {
        const { results } = await client.search([
            { indexName: "wp_posts_product", query: "pc" }
        ]);
        console.log("Index wp_posts_product hits:", results[0].hits.length);
        if (results[0].hits.length > 0) {
           console.log(results[0].hits[0].post_title, results[0].hits[0].permalink);
        }
    } catch (e) { console.log("wp_posts_product:", e.message); }
}
run();
