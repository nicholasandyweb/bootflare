import { fetchGraphQL } from './graphql';
import * as fs from 'fs';

async function introspect() {
    const query = `
    query GetSchemaInfo {
      __schema {
        queryType {
          fields {
            name
          }
        }
        types {
          name
        }
      }
    }
  `;
    try {
        const data: any = await fetchGraphQL(query);
        const fields = data.__schema.queryType.fields.map((f: any) => f.name);
        const types = data.__schema.types.map((t: any) => t.name);

        const results = {
            relevantFields: fields.filter((n: string) => /logo|music|track|playlist|sound|sr_/i.test(n)),
            relevantTypes: types.filter((n: string) => /logo|music|track|playlist|sound|sr_/i.test(n))
        };

        fs.writeFileSync('schema_final_audit.json', JSON.stringify(results, null, 2));
        console.log("Final Schema Audit successful.");
        console.log(JSON.stringify(results, null, 2));
    } catch (error) {
        console.error('Introspection failed:', error);
    }
}

introspect();
