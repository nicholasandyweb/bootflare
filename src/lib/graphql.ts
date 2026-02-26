import { GraphQLClient } from 'graphql-request';

const WP_GRAPHQL_URL = 'https://origin-wp.bootflare.com/graphql';
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
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({ query, variables }),
        next: { revalidate: 3600 },
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
        console.error(`GraphQL Fetch Failed: ${res.status} ${res.statusText} at ${endpoint}`);
        console.error(`Response snippet: ${text.substring(0, 1000)}`); // Increased snippet length
        if (i === retries - 1) throw new Error(`Failed to fetch API: ${res.status}`);
        continue;
      }

      const text = await res.text();
      let json;
      try {
        json = JSON.parse(text);
      } catch (e) {
        console.warn(`Status: ${res.status} ${res.statusText}`);
        console.warn(`Invalid JSON response (first 100 chars): ${text.substring(0, 100)}`);

        // Detect Imunify360 or Cloudflare bot challenges which return HTML
        if (text.includes('Imunify360') || text.toLowerCase().includes('bot-protection') || text.includes('Challenge Validation')) {
          console.warn('Bot protection detected, returning null to allow graceful fallback.');
          return null as any as T;
        }

        if (i === retries - 1) return null as any as T;
        continue;
      }

      if (json.errors) {
        console.warn('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
        return null as any as T;
      }
      if (!json.data) {
        // Handle cases where Imunify returns JSON with a message instead of actual GraphQL data
        if (json.message && json.message.includes('Imunify360')) {
          console.warn('Imunify360 bot-protection JSON detected, returning null.');
          return null as any as T;
        }
        console.warn('GraphQL Response missing "data" field:', JSON.stringify(json, null, 2));
        return null as any as T;
      }

      return json.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (i === retries - 1) {
        console.error(`Error fetching from GraphQL API (Attempt ${i + 1}/${retries}):`, error);
        throw error;
      }
      const waitTime = Math.pow(2, i) * 2000;
      console.warn(`Retry ${i + 1}/${retries} for GraphQL after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  console.warn('Failed to fetch GraphQL API after max retries, returning null for fallback.');
  return null as any as T;
}
