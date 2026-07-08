async function run() {
    const query = `
  query GetProductsByIds($in: [Int]!) {
    products(first: 100, where: { include: $in }) {
      nodes {
        id
        databaseId
        name
        slug
      }
    }
  }
`;
    const res = await fetch("https://apiserver.maytinhlmc.vn/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables: { in: [34558, 31318, 34655, 34524, 34387, 34146] } })
    });
    const json = await res.json();
    console.log(JSON.stringify(json, null, 2));
}
run();
