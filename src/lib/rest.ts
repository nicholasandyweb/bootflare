const WP_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://bootflare.com';

// Development-only in-memory cache to prevent "minutes of loading" during local testing
const devCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const FETCH_TIMEOUT = 15000; // Reduced to 15s for better responsiveness

export async function fetchREST(endpoint: string, retries = 2, namespace = 'wp/v2') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const embedParam = endpoint.includes('_embed') ? '' : `${separator}_embed`;
    const baseUrl = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}${embedParam}`;
    const url = baseUrl;

    // Check dev cache first
    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }
    }

    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                },
                cache: 'force-cache',
                next: { revalidate: 3600 }, // Cache on edge for 1 hour
                signal: controller.signal
            });
            if (res.status === 504 || res.status === 524) {
                throw new Error(`Gateway timeout (504/524) at ${url}`);
            }

            if (res.status === 429 || res.status === 503 || res.status === 502) {
                // Rate limited or server error, wait and retry
                const waitTime = Math.min(Math.pow(2, i) * 3000, 60000); // Max 60s
                console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms (Status: ${res.status})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!res.ok) {
                console.error(`Link fetch failed: ${url} - ${res.statusText}`);
                if (i === retries - 1) {
                    console.warn(`Failed to fetch from REST API after ${retries} attempts (${url}), returning null for fallback.`);
                    return null; // Graceful fallback instead of throw
                }
                continue;
            }

            const text = await res.text();

            // Find the outermost JSON structure
            const firstBracket = text.indexOf('[');
            const firstBrace = text.indexOf('{');
            let start = -1;
            if (firstBracket !== -1 && firstBrace !== -1) {
                start = Math.min(firstBracket, firstBrace);
            } else {
                start = firstBracket !== -1 ? firstBracket : firstBrace;
            }

            if (start === -1) {
                // Detect Imunify360 or Cloudflare bot challenges which return HTML
                if (text.includes('Imunify360') || text.toLowerCase().includes('bot-protection') || text.includes('Challenge Validation')) {
                    console.warn(`Bot protection detected at ${url}, returning null to allow graceful fallback.`);
                    return null;
                }
                console.error(`No JSON found in response from ${url}`);
                if (i === retries - 1) return null; // Graceful fallback instead of throw
                continue;
            }

            const lastBracket = text.lastIndexOf(']');
            const lastBrace = text.lastIndexOf('}');
            let end = -1;
            if (lastBracket !== -1 && lastBrace !== -1) {
                end = Math.max(lastBracket, lastBrace);
            } else {
                end = lastBracket !== -1 ? lastBracket : lastBrace;
            }

            if (end === -1 || end < start) {
                console.error(`Invalid JSON boundaries in response from ${url}`);
                if (i === retries - 1) {
                    console.warn(`Failed to fetch from REST API after ${retries} attempts (${url}), returning null.`);
                    return null;
                }
                continue;
            }

            const jsonText = text.substring(start, end + 1);
            try {
                const data = JSON.parse(jsonText);
                // Save to dev cache
                if (process.env.NODE_ENV === 'development') {
                    devCache.set(url, { data, timestamp: Date.now() });
                }
                return data;
            } catch (e) {
                console.error(`Status: ${res.status} ${res.statusText}`);
                console.error(`Failed to parse JSON for ${url}. Response starts with: ${text.substring(0, 100)}`);
                if (i === retries - 1) {
                    console.warn(`Failed to parse JSON after ${retries} attempts (${url}), returning null.`);
                    return null;
                }
                continue;
            }
        } catch (error) {
            const isTimeout = error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'));

            if (isTimeout) {
                console.warn(`Fetch timed out after ${FETCH_TIMEOUT / 1000}s for ${url}`);
            }

            if (i === retries - 1) {
                throw error;
            }
            const waitTime = Math.pow(2, i) * 1000;
            console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    console.warn(`Failed to fetch from REST API after ${retries} attempts (${url}), returning null for fallback.`);
    return null;
}

export async function fetchRESTWithMeta(endpoint: string, retries = 2, namespace = 'wp/v2') {
    const separator = endpoint.includes('?') ? '&' : '?';
    const embedParam = endpoint.includes('_embed') ? '' : `${separator}_embed`;
    const baseUrl = endpoint.startsWith('http') ? endpoint : `${WP_URL}/wp-json/${namespace}/${endpoint}${embedParam}`;
    const url = baseUrl;

    // Check dev cache first
    if (process.env.NODE_ENV === 'development') {
        const cached = devCache.get(url);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.data;
        }
    }

    for (let i = 0; i < retries; i++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

        try {
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'application/json'
                },
                cache: 'force-cache',
                next: { revalidate: 3600 }, // Cache on edge for 1 hour
                signal: controller.signal
            });
            if (res.status === 504 || res.status === 524) {
                throw new Error(`Gateway timeout (504/524) at ${url}`);
            }

            if (res.status === 429 || res.status === 503 || res.status === 502) {
                // Rate limited or server error, wait and retry
                const waitTime = Math.min(Math.pow(2, i) * 3000, 60000); // Max 60s
                console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms (Status: ${res.status})`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
                continue;
            }

            if (!res.ok) {
                console.error(`Link fetch failed: ${url} - ${res.statusText}`);
                if (i === retries - 1) {
                    console.warn(`Failed to fetch from REST API after ${retries} attempts (${url}), returning null for fallback.`);
                    return null; // Graceful fallback instead of throw
                }
                continue;
            }

            const totalPagesStr = res.headers.get('X-WP-TotalPages');
            const totalItemsStr = res.headers.get('X-WP-Total');
            const totalPages = totalPagesStr ? parseInt(totalPagesStr as string, 10) : 1;
            const totalItems = totalItemsStr ? parseInt(totalItemsStr as string, 10) : 0;

            const text = await res.text();

            // Find the outermost JSON structure
            const firstBracket = text.indexOf('[');
            const firstBrace = text.indexOf('{');
            let start = -1;
            if (firstBracket !== -1 && firstBrace !== -1) {
                start = Math.min(firstBracket, firstBrace);
            } else {
                start = firstBracket !== -1 ? firstBracket : firstBrace;
            }

            if (start === -1) {
                // Detect Imunify360 or Cloudflare bot challenges which return HTML
                if (text.includes('Imunify360') || text.toLowerCase().includes('bot-protection') || text.includes('Challenge Validation')) {
                    console.warn(`Bot protection detected at ${url}, returning null to allow graceful fallback.`);
                    return null;
                }
                console.error(`No JSON found in response from ${url}`);
                if (i === retries - 1) return null; // Graceful fallback instead of throw
                continue;
            }

            const lastBracket = text.lastIndexOf(']');
            const lastBrace = text.lastIndexOf('}');
            let end = -1;
            if (lastBracket !== -1 && lastBrace !== -1) {
                end = Math.max(lastBracket, lastBrace);
            } else {
                end = lastBracket !== -1 ? lastBracket : lastBrace;
            }

            if (end === -1 || end < start) {
                console.error(`Invalid JSON boundaries in response from ${url}`);
                if (i === retries - 1) {
                    console.warn(`Failed to fetch from REST API after ${retries} attempts (${url}), returning null.`);
                    return null;
                }
                continue;
            }

            const jsonText = text.substring(start, end + 1);
            try {
                const data = JSON.parse(jsonText);
                const result = { data, totalPages, totalItems };
                // Save to dev cache
                if (process.env.NODE_ENV === 'development') {
                    devCache.set(url, { data: result, timestamp: Date.now() });
                }
                return result;
            } catch (e) {
                console.error(`Status: ${res.status} ${res.statusText}`);
                console.error(`Failed to parse JSON for ${url}. Response starts with: ${text.substring(0, 100)}`);
                if (i === retries - 1) {
                    console.warn(`Failed to parse JSON after ${retries} attempts (${url}), returning null.`);
                    return null;
                }
                continue;
            }
        } catch (error) {
            const isTimeout = error instanceof Error && (error.name === 'AbortError' || error.message.includes('aborted'));

            if (isTimeout) {
                console.warn(`Fetch timed out after ${FETCH_TIMEOUT / 1000}s for ${url}`);
            }

            if (i === retries - 1) {
                throw error;
            }
            const waitTime = Math.pow(2, i) * 1000;
            console.warn(`Retry ${i + 1}/${retries} for ${url} after ${waitTime}ms due to network error: ${error instanceof Error ? error.message : String(error)}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
    console.warn(`Failed to fetch from REST API after ${retries} attempts (${url}), returning null for fallback.`);
    return null;
}
