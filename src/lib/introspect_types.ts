import { fetchGraphQL } from './graphql';
import * as fs from 'fs';

async function introspect() {
    const query = `
    query GetAllTypes {
      __schema {
        types {
          name
          kind
        }
      }
    }
  `;
    try {
        const data: any = await fetchGraphQL(query);
        const types = data.__schema.types.map((t: any) => t.name).sort();

        const relevantTypes = types.filter((n: string) => /logo|music|playlist|track|sr_/i.test(n));
        console.log("Relevant Types found in schema:", relevantTypes);
        fs.writeFileSync('relevant_types.json', JSON.stringify(relevantTypes, null, 2));

    } catch (error: any) {
        console.error('Introspection failed.');
    }
}

introspect();
