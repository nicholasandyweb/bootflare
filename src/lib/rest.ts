import { unstable_cache } from 'next/cache';

const WP_URL = 'https://bootflare.com';

// Development-only in-memory cache to prevent "minutes of loading" during local testing
const devCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
// 10s timeout — the router caches REST responses (1hr), so most requests are instant cache hits.
const FETCH_TIMEOUT = 10000;

async function _doFetchREST(url: string, retries: number): Promise<any> {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                },
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (res.status === 504 || res.status === 524) {
                throw new Error(`Gateway timeout (504/524) at ${url}`);
            }

            if (res.status === 429 || res.status === 503 || res.status === 502) {
                const waitTime = Math.min(Math.pow(2, i) * 1000, 5000);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!res.ok) {
                if (i === retries - 1) return null;
                continue;
            }

            const text = await res.text();
            const start = Math.min(text.indexOf('['), text.indexOf('{'));
            const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));

            if (start === -1 || end === -1 || end < start) {
                if (i === retries - 1) return null;
                continue;
            }

            const jsonText = text.substring(start, end + 1);
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                if (i === retries - 1) return null;
                continue;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (i === retries - 1) return null;
            const waitTime = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    return null;
}

const _cachedFetchREST = unstable_cache(
    (url: string, retries: number) => _doFetchREST(url, retries),
    ['rest-fetch'],
    { revalidate: 3600, tags: ['rest'] }
);

export async function fetchREST(endpoint: string, retries = 1, namespace = 'wp/v2') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const embedParam = endpoint.includes('_embed') ? '' : `${separator}_embed`;
    const url = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}${embedParam}`;

    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
        const result = await _doFetchREST(url, retries);
        if (result) devCache.set(url, { data: result, timestamp: Date.now() });
        return result;
    }

    return await _cachedFetchREST(url, retries);
}

async function _doFetchRESTWithMeta(url: string, retries: number): Promise<any> {
    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json',
                },
                cache: 'no-store',
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!res.ok) {
                if (i === retries - 1) return null;
                continue;
            }

            const totalPagesStr = res.headers.get('X-WP-TotalPages');
            const totalItemsStr = res.headers.get('X-WP-Total');
            const totalPages = totalPagesStr ? parseInt(totalPagesStr, 10) : 1;
            const totalItems = totalItemsStr ? parseInt(totalItemsStr, 10) : 0;

            const text = await res.text();
            const start = Math.min(text.indexOf('['), text.indexOf('{'));
            const end = Math.max(text.lastIndexOf(']'), text.lastIndexOf('}'));

            if (start === -1 || end === -1 || end < start) {
                if (i === retries - 1) return null;
                continue;
            }

            const jsonText = text.substring(start, end + 1);
            try {
                const data = JSON.parse(jsonText);
                return { data, totalPages, totalItems };
            } catch (e) {
                if (i === retries - 1) return null;
                continue;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (i === retries - 1) return null;
            const waitTime = Math.pow(2, i) * 1000;
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    return null;
}

const _cachedFetchRESTWithMeta = unstable_cache(
    (url: string, retries: number) => _doFetchRESTWithMeta(url, retries),
    ['rest-fetch-meta'],
    { revalidate: 3600, tags: ['rest'] }
);

export async function fetchRESTWithMeta(endpoint: string, retries = 1, namespace = 'wp/v2') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const embedParam = endpoint.includes('_embed') ? '' : `${separator}_embed`;
    const url = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}${embedParam}`;

    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
        const result = await _doFetchRESTWithMeta(url, retries);
        if (result) devCache.set(url, { data: result, timestamp: Date.now() });
        return result;
    }

    return await _cachedFetchRESTWithMeta(url, retries);
}

/**
 * REST helper to get a single post by slug
 */
export async function getRESTPostBySlug(slug: string) {
    const res = await fetchREST(`posts?slug=${slug}&_embed`);
    if (res && Array.isArray(res) && res.length > 0) {
        return res[0];
    }
    return null;
}

/**
 * REST helper to get comments for a specific post
 */
export async function getRESTComments(postId: number) {
    return await fetchREST(`comments?post=${postId}&per_page=100&_embed`);
}
