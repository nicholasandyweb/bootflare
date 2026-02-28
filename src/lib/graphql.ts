import { GraphQLClient } from 'graphql-request';
import { unstable_cache } from 'next/cache';

const WP_GRAPHQL_URL = 'https://bootflare.com/graphql';
const endpoint = process.env.WORDPRESS_GRAPHQL_ENDPOINT || WP_GRAPHQL_URL;
const devCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  },
});

async function _doFetch(query: string, variablesJson: string, retries: number): Promise<unknown> {
  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        body: JSON.stringify({ query, variables: variablesJson ? JSON.parse(variablesJson) : undefined }),
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
        if (i === retries - 1) return null;
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
          return null;
        }

        if (i === retries - 1) return null;
        continue;
      }

      if (json.errors) {
        console.warn('GraphQL Errors:', JSON.stringify(json.errors, null, 2));
        return null;
      }
      if (!json.data) {
        // Handle cases where Imunify returns JSON with a message instead of actual GraphQL data
        if (json.message && json.message.includes('Imunify360')) {
          console.warn('Imunify360 bot-protection JSON detected, returning null.');
          return null;
        }
        console.warn('GraphQL Response missing "data" field:', JSON.stringify(json, null, 2));
        return null;
      }

      return json.data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (i === retries - 1) {
        console.error(`Error fetching from GraphQL API (Attempt ${i + 1}/${retries}):`, error);
        return null;
      }
      const waitTime = Math.pow(2, i) * 2000;
      console.warn(`Retry ${i + 1}/${retries} for GraphQL after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }

  console.warn('Failed to fetch GraphQL API after max retries, returning null for fallback.');
  return null;
}

// Module-level stable cached function — must NOT be created inside fetchGraphQL,
// otherwise unstable_cache gets a new function reference every call and never hits cache.
// keyParts is a fixed namespace; the actual cache key is derived from the serializable arguments.
const _cachedFetch = unstable_cache(
  _doFetch,
  ['graphql-fetch'],
  { revalidate: 3600, tags: ['graphql'] }
);

export async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>, retries = 2): Promise<T> {
  const variablesJson = variables ? JSON.stringify(variables) : '';
  const cacheKey = query + variablesJson;

  // Dev: use fast in-memory cache to avoid repeated network hits during local development
  if (process.env.NODE_ENV === 'development') {
    const cached = devCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data as T;
    }
    const result = await _doFetch(query, variablesJson, retries);
    devCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result as T;
  }

  // Production: use Next.js Data Cache so page reloads within the revalidation
  // window are served instantly without hitting the WordPress GraphQL endpoint.
  // POST requests are NOT cached by Next.js fetch natively, so we use
  // unstable_cache with a stable module-level reference.
  return _cachedFetch(query, variablesJson, retries) as Promise<T>;
}
