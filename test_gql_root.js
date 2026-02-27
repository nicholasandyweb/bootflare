require('dotenv').config({ path: '.env.local' });
const { GraphQLClient } = require('graphql-request');

const endpoint = 'https://bootflare.com/graphql';

const client = new GraphQLClient(endpoint, {
    headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    },
});

async function run() {
    const query = `
    query TestRootLogos {
      logos(where: { offsetPagination: { offset: 0, size: 5 }, taxQuery: { taxArray: [{ taxonomy: LOGOCATEGORY, field: SLUG, terms: ["sport"] }] } }) {
        nodes {
          title
        }
      }
    }
  `;
    try {
        const data = await client.request(query);
        console.log("ROOT LOGOS QUERY RESULT:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error("Error with taxQuery:", e.message);

        // Fallback test
        const query2 = `
      query TestRootLogos2 {
        logos(first: 10, where: { logoCategories: "sport" }) {
          nodes { title }
        }
      }
    `;
        try {
            const data2 = await client.request(query2);
            console.log("ROOT LOGOS QUERY RESULT 2:");
            console.log(JSON.stringify(data2, null, 2));
        } catch (e2) {
            console.error("Error with logoCategories:", e2.message);
        }
    }
}

run();
