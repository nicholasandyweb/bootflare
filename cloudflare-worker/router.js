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
        ) || pathname.startsWith('/wp-');

        if (isWordPressPath) {
            // ── WordPress: pass through to shared hosting origin ──
            const wpHeaders = new Headers(request.headers);
            wpHeaders.set('Host', 'bootflare.com');
            wpHeaders.set('X-Forwarded-Host', 'bootflare.com');
            wpHeaders.set('X-Forwarded-Proto', 'https');
            wpHeaders.set('X-Forwarded-For', request.headers.get('CF-Connecting-IP') || '');

            // --- API Caching (GraphQL & REST) ---
            const isApi = pathname === '/graphql' || pathname.startsWith('/wp-json');
            const cache = caches.default;
            let cacheKey = request;

            if (isApi && ['GET', 'POST'].includes(request.method)) {
                try {
                    if (request.method === 'POST') {
                        // For POST (GraphQL), we must hash the body to create a unique cache key
                        const body = await request.clone().text();
                        const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(body));
                        const hashArray = Array.from(new Uint8Array(hashBuffer));
                        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

                        const cacheUrl = new URL(request.url);
                        cacheUrl.searchParams.set('__gql_hash', hashHex);
                        cacheKey = new Request(cacheUrl.toString(), {
                            method: 'GET', // Use GET for the cache key
                            headers: request.headers
                        });
                    }

                    const cachedResponse = await cache.match(cacheKey);
                    if (cachedResponse) {
                        const response = new Response(cachedResponse.body, cachedResponse);
                        response.headers.set('X-API-Cache', 'HIT');
                        return response;
                    }
                } catch (e) {
                    console.error('API Cache Error:', e);
                }
            }

            const response = await fetch(request.url, {
                method: request.method,
                headers: wpHeaders,
                body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
                redirect: 'manual',
                cf: {
                    resolveOverride: 'origin-wp.bootflare.com'
                }
            });

            // Cache successful API responses that return actual JSON (not HTML bot challenges)
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            if (isApi && response.ok && isJson && ['GET', 'POST'].includes(request.method)) {
                const responseToCache = new Response(response.clone().body, response);
                responseToCache.headers.set('Cache-Control', 'public, s-maxage=3600');
                ctx.waitUntil(cache.put(cacheKey, responseToCache));

                const newResponse = new Response(response.body, response);
                newResponse.headers.set('X-API-Cache', 'MISS');
                return newResponse;
            }

            return response;
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
        // We no longer normalize RSC to __data.json because prefetch and nav use different streams.

        let cacheKey;
        try {
            cacheKey = new Request(cacheUrl.toString(), {
                method: request.method,
                headers: request.headers
            });
        } catch (e) {
            console.error(`ERROR: Failed to construct cacheKey. cacheUrl: "${cacheUrl.toString()}"`);
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
            // We use standard s-maxage for edge caching, but we don't
            // override Vary or Force immutable here anymore to avoid 
            // breaking Next.js hydration and streaming.
            const responseToCache = new Response(response.body, response);
            responseToCache.headers.set('Cache-Control', 'public, s-maxage=3600');

            ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));

            response = new Response(responseToCache.body, responseToCache);
            response.headers.set('X-Worker-Cache', 'MISS');
        }

        return response;
    },
};
