import { GraphQLClient } from 'graphql-request';

const WP_GRAPHQL_URL = 'https://bootflare.com/graphql';
const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT || WP_GRAPHQL_URL;

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
});

export async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>, retries = 2): Promise<T> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 3600 }, // Cache on edge for 1 hour
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.status === 429 || res.status === 503 || res.status === 502 || res.status === 504 || res.status === 500) {
        // Rate limited or server error, wait and retry
        const waitTime = Math.min(Math.pow(2, i) * 3000, 60000); // Max 60s
        console.warn(`Retry ${i + 1}/${retries} for GraphQL after ${waitTime}ms (Status: ${res.status})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!res.ok) {
        const text = await res.text();
        console.error(`GraphQL Fetch Failed: ${res.status} ${res.statusText}`);
        console.error(`Response snippet: ${text.substring(0, 500)}`);
        if (i === retries - 1) throw new Error(`Failed to fetch API: ${res.status}`);
        continue;
      }

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.error(`Status: ${res.status} ${res.statusText}`);
        console.error(`Invalid JSON response (first 100 chars): ${text.substring(0, 100)}`);
        if (i === retries - 1) throw new Error('Failed to parse GraphQL response as JSON');
        continue;
      }

      if (json.errors) {
        console.error('GraphQL Errors:', json.errors);
        throw new Error('Failed to fetch API due to GraphQL Errors');
      }
      return json.data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (i === retries - 1) {
        console.error(`Error fetching from GraphQL API after ${retries} attempts:`, error);
        throw error;
      }
      const waitTime = Math.pow(2, i) * 2000;
      console.warn(`Retry ${i + 1}/${retries} for GraphQL after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  throw new Error('Failed to fetch GraphQL API after max retries');
}
