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
 *   everything else    → Next.js Worker (via Service Binding)
 *
 * Setup in Cloudflare Dashboard:
 *   1. Go to Workers & Pages → Create → Worker (this acts as your "Front Door")
 *   2. Paste this script
 *   3. Add a Service Binding: NEXTJS_WORKER → bootflare (your Next.js worker)
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

// ── Bot / abuse detection ────────────────────────────────────────────────
// Known bad bot User-Agent substrings (case-insensitive match)
const BAD_BOT_PATTERNS = [
    'ahrefsbot', 'semrushbot', 'dotbot', 'mj12bot', 'blexbot',
    'seekport', 'megaindex', 'ltx71', 'go-http-client', 'python-requests',
    'scrapy', 'httpclient', 'zgrab', 'masscan', 'sqlmap', 'nikto',
    'nmap', 'dirbuster', 'gobuster', 'nuclei', 'curl/', 'wget/',
    'libwww', 'lwp-trivial', 'java/', 'okhttp', 'headlesschrome',
    'phantomjs', 'cfscrape', 'petalbot',
];

// Paths that are commonly probed by bots (return 403 immediately)
const HONEYPOT_PATHS = [
    '/wp-login.php', '/wp-signup.php', '/xmlrpc.php',
    '/.env', '/.git', '/config.php', '/admin.php',
    '/phpmyadmin', '/pma', '/mysql', '/debug',
];

/**
 * Returns true if the request looks like a bad bot.
 */
function isSuspiciousRequest(request) {
    const ua = (request.headers.get('User-Agent') || '').toLowerCase();

    // No User-Agent at all — almost always a bot/scanner
    if (!ua) return true;

    // Known bad bots
    if (BAD_BOT_PATTERNS.some(p => ua.includes(p))) return true;

    return false;
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;

        // ── Block honeypot paths immediately ─────────────────────────
        if (HONEYPOT_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
            // Allow wp-login/wp-signup only if referer is from bootflare (real admin)
            const referer = request.headers.get('Referer') || '';
            if (!referer.includes('bootflare.com')) {
                return new Response('Forbidden', { status: 403 });
            }
        }

        // ── Block obvious bad bots ───────────────────────────────────
        if (isSuspiciousRequest(request)) {
            // Return a minimal 403 — costs essentially zero CPU
            return new Response('Forbidden', { status: 403 });
        }

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

        // ── Next.js: forward to Origin Worker via Service Binding ────
        const nextjsWorker = env.NEXTJS_WORKER;

        if (!nextjsWorker) {
            console.error('ERROR: NEXTJS_WORKER service binding is missing.');
            return new Response('Worker Configuration Error: NEXTJS_WORKER binding is missing.', { status: 500 });
        }

        // --- Cache Logic ---
        const cache = caches.default;
        const isCacheableMethod = ['GET', 'HEAD'].includes(request.method);

        let cacheUrl = new URL(request.url);
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
                const response = new Response(cachedResponse.body, cachedResponse);
                response.headers.set('X-Worker-Cache', 'HIT');
                return response;
            }
        }

        // Service Binding call: direct worker-to-worker, no HTTP round-trip
        let response = await nextjsWorker.fetch(request);

        // Store in cache if status is OK and it's a cacheable method
        if (useCache && response.ok) {
            const responseToCache = new Response(response.body, response);
            responseToCache.headers.set('Cache-Control', 'public, s-maxage=3600');

            ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));

            response = new Response(responseToCache.body, responseToCache);
            response.headers.set('X-Worker-Cache', 'MISS');
        }

        return response;
    },
};
