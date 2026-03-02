const WP_URL = 'https://bootflare.com';

// Cloudflare Workers fetch option — bypasses the router worker DNS record so that
// Next.js SSR REST fetches go directly to the WP origin without looping through
// the router. The `cf` key is a CF Workers-only init property; ignored in Node.js dev.
const WP_CF_OPTIONS = { resolveOverride: 'origin-wp.bootflare.com' };

// Development-only in-memory cache to prevent "minutes of loading" during local testing
const devCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
// 8s timeout — gives WP shared hosting enough time for heavier queries.
// With retries=1: worst case per call = 8s; deepest sequential chain (2 calls) = 16s,
// still safely under the 30s router/worker limit.
const FETCH_TIMEOUT = 8000;

function findJsonBounds(text: string): { start: number; end: number } | null {
    if (!text) return null;

    const firstBracket = text.indexOf('[');
    const firstBrace = text.indexOf('{');

    let start = -1;
    if (firstBracket !== -1 && firstBrace !== -1) start = Math.min(firstBracket, firstBrace);
    else start = firstBracket !== -1 ? firstBracket : firstBrace;

    if (start === -1) return null;

    const lastBracket = text.lastIndexOf(']');
    const lastBrace = text.lastIndexOf('}');

    let end = -1;
    if (lastBracket !== -1 && lastBrace !== -1) end = Math.max(lastBracket, lastBrace);
    else end = lastBracket !== -1 ? lastBracket : lastBrace;

    if (end === -1 || end < start) return null;
    return { start, end };
}

function looksLikeBotOrHtml(text: string): boolean {
    if (!text) return false;
    const t = text.toLowerCase();
    return (
        t.includes('<!doctype html') ||
        t.includes('<html') ||
        t.includes('imunify360') ||
        t.includes('bot-protection') ||
        t.includes('challenge validation')
    );
}

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
                signal: controller.signal,
                // @ts-expect-error cf is a Cloudflare Workers-only fetch option; ignored in Node.js dev
                cf: WP_CF_OPTIONS,
            });
            clearTimeout(timeoutId);

            if (res.status === 504 || res.status === 524) {
                throw new Error(`Gateway timeout (504/524) at ${url}`);
            }

            if (res.status === 429 || res.status === 503 || res.status === 502) {
                if (i === retries - 1) return null;
                continue;
            }

            if (!res.ok) {
                if (i === retries - 1) return null;
                continue;
            }

            const text = await res.text();

            if (looksLikeBotOrHtml(text)) {
                if (i === retries - 1) return null;
                continue;
            }

            const bounds = findJsonBounds(text);
            if (!bounds) {
                if (i === retries - 1) return null;
                continue;
            }

            const jsonText = text.substring(bounds.start, bounds.end + 1);
            try {
                return JSON.parse(jsonText);
            } catch (e) {
                if (i === retries - 1) return null;
                continue;
            }
        } catch (error) {
            clearTimeout(timeoutId);
            if (i === retries - 1) return null;
        }
    }
    return null;
}

export async function fetchREST(endpoint: string, retries = 1, namespace = 'wp/v2') {
    // Callers must opt in to _embed explicitly — auto-adding it forces WP to run
    // expensive joined queries (author, media, terms) on every request, which
    // overwhelms shared hosting and causes 503s.
    const url = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}`;

    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
        const result = await _doFetchREST(url, retries);
        if (result) devCache.set(url, { data: result, timestamp: Date.now() });
        return result;
    }

    // Production: use the router worker's 120s edge cache for WP REST responses.
    // The router blocks caching of empty/error responses, so stale data from
    // a previously healthy WP request is served when WP is slow or 503ing.
    return await _doFetchREST(url, retries);
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
                signal: controller.signal,
                // @ts-expect-error cf is a Cloudflare Workers-only fetch option; ignored in Node.js dev
                cf: WP_CF_OPTIONS,
            });
            clearTimeout(timeoutId);

            if (res.status === 504 || res.status === 524) {
                throw new Error(`Gateway timeout (504/524) at ${url}`);
            }

            if (res.status === 429 || res.status === 503 || res.status === 502) {
                if (i === retries - 1) return null;
                continue;
            }

            if (!res.ok) {
                if (i === retries - 1) return null;
                continue;
            }

            const totalPagesStr = res.headers.get('X-WP-TotalPages');
            const totalItemsStr = res.headers.get('X-WP-Total');
            const totalPages = totalPagesStr ? parseInt(totalPagesStr, 10) : 1;
            const totalItems = totalItemsStr ? parseInt(totalItemsStr, 10) : 0;

            const text = await res.text();

            if (looksLikeBotOrHtml(text)) {
                if (i === retries - 1) return null;
                continue;
            }

            const bounds = findJsonBounds(text);
            if (!bounds) {
                if (i === retries - 1) return null;
                continue;
            }

            const jsonText = text.substring(bounds.start, bounds.end + 1);
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
        }
    }
    return null;
}

export async function fetchRESTWithMeta(endpoint: string, retries = 1, namespace = 'wp/v2') {
    // No auto-_embed — callers opt in explicitly.
    const url = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}`;

    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) return cached.data;
        const result = await _doFetchRESTWithMeta(url, retries);
        if (result) devCache.set(url, { data: result, timestamp: Date.now() });
        return result;
    }

    // Production: use the router worker's 120s edge cache.
    return await _doFetchRESTWithMeta(url, retries);
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
