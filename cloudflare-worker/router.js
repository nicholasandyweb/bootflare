/**
 * Cloudflare Worker — bootflare.com Traffic Router
 *
 * Routes:
 *   /wp-admin/*        → WordPress (shared hosting origin)
 *   /wp-content/*      → WordPress (shared hosting origin)
 *   /wp-includes/*     → WordPress (shared hosting origin)
 *   /wp-json/*         → WordPress (shared hosting origin)
 *   /wp-login.php      → WordPress (shared hosting origin)
 *   /wp-signup.php     → WordPress (shared hosting origin)
 *   /xmlrpc.php        → WordPress (shared hosting origin)
 *   everything else    → Next.js (Cloudflare Pages)
 *
 * Setup in Cloudflare Dashboard:
 *   1. Go to Workers & Pages → Create → Worker (this acts as your "Front Door")
 *   2. Paste this script
 *   3. Set environment variable: ORIGIN_URL = https://bootflare.crimson-mud-7db5.workers.dev
 *      (This is the URL of your Next.js app deployed via OpenNext)
 *   4. Add Worker Route: bootflare.com/* → this worker
 */

// WordPress-specific path prefixes — these go to shared hosting origin
const WP_PATHS = [
    '/wp-admin',
    '/wp-content',
    '/wp-includes',
    '/wp-json',
    '/wp-login.php',
    '/wp-signup.php',
    '/wp-cron.php',
    '/xmlrpc.php',
    '/graphql',          // WPGraphQL endpoint — Next.js fetches this server-side
    '/sitemap.xml',      // WordPress SEO sitemap
    '/sitemap_index.xml',
    '/robots.txt',
];

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;

        // Check if this is a WordPress path
        const isWordPressPath = WP_PATHS.some(
            (prefix) => pathname === prefix || pathname.startsWith(prefix + '/')
        );

        if (isWordPressPath) {
            // ── WordPress: pass through to shared hosting origin ──
            // Using resolveOverride to bypass Cloudflare and route to our grey-cloud
            // fallback DNS record. This breaks the infinite routing loop caused
            // by the Worker calling fetch('https://bootflare.com/...')
            // By resolving to the origin-wp hostname, Cloudflare connects to the
            // shared host IP, but importantly keeps the TLS SNI and Host header 
            // exactly as `bootflare.com`, satisfying the strict LiteSpeed server.
            const newRequest = new Request(request.url, request);
            return fetch(newRequest, {
                cf: {
                    resolveOverride: 'origin-wp.bootflare.com'
                }
            });
        }

        // ── Next.js: forward to Origin Worker ──────────────────────────
        const originBase = env.ORIGIN_URL;

        if (!originBase) {
            console.error('ERROR: ORIGIN_URL environment variable is missing.');
            return new Response('Worker Configuration Error: ORIGIN_URL is missing.', { status: 500 });
        }

        let targetUrl;
        try {
            targetUrl = new URL(pathname + url.search, originBase);
        } catch (e) {
            console.error(`ERROR: Failed to construct targetUrl. pathname: "${pathname}", originBase: "${originBase}"`);
            return new Response(`Worker Configuration Error: Invalid ORIGIN_URL ("${originBase}")`, { status: 500 });
        }

        // --- Cache Logic ---
        const cache = caches.default;
        // Only cache GET and HEAD requests
        const isCacheableMethod = ['GET', 'HEAD'].includes(request.method);

        // Normalize Request for better cache hits (RSC vs Prefetch)
        const isRSC = request.headers.has('RSC') || request.headers.has('Next-Router-Prefetch') || request.headers.has('Next-Router-State-Tree');

        // Create a stable cache key
        let cacheUrl = new URL(request.url);
        // If it's a data request, append a suffix to the path in the cache key
        // to keep it separate from the HTML version but shared between prefetch/nav.
        if (isRSC) {
            // Ensure we don't end up with triple slashes
            const baseDataPath = cacheUrl.pathname.endsWith('/') ? cacheUrl.pathname.slice(0, -1) : cacheUrl.pathname;
            cacheUrl.pathname = baseDataPath + '/__data.json';
        }

        let cacheKey;
        try {
            cacheKey = new Request(cacheUrl.toString(), {
                method: request.method,
                // We strip the intent-specific headers for the cache key so prefetch hits nav
                headers: (() => {
                    const h = new Headers(request.headers);
                    h.delete('Next-Router-Prefetch');
                    h.delete('Purpose');
                    return h;
                })()
            });
        } catch (e) {
            console.error(`ERROR: Failed to construct cacheKey. cacheUrl: "${cacheUrl.toString()}"`);
            // Fallback to original request as cache key if normalization fails
            cacheKey = request;
        }

        const useCache = isCacheableMethod && !url.searchParams.has('nocache');

        if (useCache) {
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                // Return cached response but add a header to indicate it's from the worker cache
                const response = new Response(cachedResponse.body, cachedResponse);
                response.headers.set('X-Worker-Cache', 'HIT');
                return response;
            }
        }

        const newRequest = new Request(targetUrl.toString(), {
            method: request.method,
            headers: (() => {
                const h = new Headers(request.headers);
                // Tell Cloudflare Pages which domain is serving this
                h.set('Host', 'bootflare.com');
                // Pass the real visitor IP along
                h.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');
                h.set('X-Forwarded-Host', 'bootflare.com');
                return h;
            })(),
            body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
            redirect: 'manual',
        });

        let response = await fetch(newRequest);

        // Store in cache if status is OK and it's a cacheable method
        if (useCache && response.ok) {
            // We need to clone the response to put it in cache and return it
            const responseToCache = new Response(response.body, response);
            // Ensure Cache-Control is set so it actually stays in cache
            // s-maxage=3600 (1 hour) on the edge, max-age=3600 (1 hour) in browser
            responseToCache.headers.set('Cache-Control', 'public, s-maxage=3600, max-age=3600');
            // Strip Vary header if it contains RSC/Prefetch to ensure our normalized key works
            const vary = responseToCache.headers.get('Vary') || '';
            if (vary.toLowerCase().includes('rsc') || vary.toLowerCase().includes('prefetch')) {
                // We trust our cacheKey normalization, so we can relax the Vary header
                responseToCache.headers.set('Vary', vary.split(',').map(s => s.trim()).filter(s =>
                    !['rsc', 'next-router-prefetch', 'next-router-state-tree', 'purpose'].includes(s.toLowerCase())
                ).join(', '));
            }

            // event.waitUntil ensures the worker doesn't terminate before the cache is updated
            ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));

            // Re-create the response to return (since the body might be locked/consumed)
            response = new Response(responseToCache.body, responseToCache);
            response.headers.set('X-Worker-Cache', 'MISS');
        }

        return response;
    },
};
