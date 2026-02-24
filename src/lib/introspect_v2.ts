/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchGraphQL } from './graphql';
import * as fs from 'fs';

async function introspect() {
  const query = `
    query GetAllRootFields {
      __type(name: "RootQuery") {
        fields {
          name
        }
      }
    }
  `;
  try {
    console.log("Fetching all fields from RootQuery...");
    const data: any = await fetchGraphQL(query);
    if (!data || !data.__type || !data.__type.fields) {
      console.error("Introspection returned unexpected structure:", JSON.stringify(data, null, 2));
      return;
    }
    const fields = data.__type.fields.map((f: any) => f.name).sort();
    console.log(`Found ${fields.length} fields.`);
    fs.writeFileSync('all_root_fields.json', JSON.stringify(fields, null, 2));

    const logoFields = fields.filter((n: string) => n.toLowerCase().includes('logo'));
    console.log("Fields containing 'logo':", logoFields);

    const musicFields = fields.filter((n: string) => n.toLowerCase().includes('music') || n.toLowerCase().includes('playlist') || n.toLowerCase().includes('sr_'));
    console.log("Fields containing 'music/playlist':", musicFields);

  } catch (error: any) {
    console.error('Introspection failed.');
    if (error.response) {
      console.error('Response Errors:', JSON.stringify(error.response.errors, null, 2));
    } else {
      console.error(error);
    }
  }
}

introspect();
