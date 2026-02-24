const query = `
query GetLogoCategoriesPage {
  page(id: "/logo-categories/", idType: URI) {
    title
    excerpt
  }
  taxonomy(id: "logos", idType: NAME) {
    description
  }
}
`;

async function test() {
    try {
        const res = await fetch('https://bootflare.com/graphql', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query })
        });
        const json = await res.json();
        console.log(JSON.stringify(json, null, 2));
    } catch (e) {
        console.error(e);
    }
}

test();
