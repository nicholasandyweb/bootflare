import { fetchGraphQL } from './src/lib/graphql';

async function run() {
    const query = `
    query TestRootLogos {
      logos(where: { offsetPagination: { offset: 0, size: 5 } }) {
        nodes {
          title
        }
      }
    }
  `;
    try {
        const data = await fetchGraphQL(query);
        console.log("ROOT LOGOS QUERY RESULT:");
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

run();
