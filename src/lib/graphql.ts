import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT || 'https://bootflare.com/graphql';

export const client = new GraphQLClient(endpoint, {
  headers: {
    // Add any necessary headers like authorization if required
  },
});

export async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
    next: { revalidate: 3600 } // Cache for 1 hour
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`GraphQL Fetch Failed: ${res.status} ${res.statusText}`);
    console.error(`Response snippet: ${text.substring(0, 500)}`);
    throw new Error(`Failed to fetch API: ${res.status}`);
  }

  const text = await res.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch (e) {
    console.error(`Status: ${res.status} ${res.statusText}`);
    console.error(`Invalid JSON response: ${text.substring(0, 1000)}`);
    throw new Error('Failed to parse GraphQL response as JSON');
  }

  if (json.errors) {
    console.error('GraphQL Errors:', json.errors);
    throw new Error('Failed to fetch API');
  }
  return json.data;
}
