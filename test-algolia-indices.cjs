const { algoliasearch } = require("algoliasearch");
const client = algoliasearch("1NV11FV7U1", "9ebfe59601da78e60a029a899c3b6aaa");

async function run() {
    try {
        const indices = await client.listIndices();
        console.log("Indices:", indices.items.map(i => i.name));
    } catch (e) {
        console.error(e.message);
    }
}
run();
