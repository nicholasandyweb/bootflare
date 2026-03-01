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
    'phantomjs', 'cfscrape', 'petalbot', 'bytespider', 'claudebot',
    'gptbot', 'chatgpt-user', 'ccbot', 'anthropic-ai', 'facebookexternal',
    'bingpreview', 'yandexbot', 'baiduspider', 'sogou', 'exabot',
    'seznambot', 'dataforseo', 'rogerbot', 'applebot',
    'commoncrawl', 'archive.org_bot', 'ia_archiver',
    'centurybot', 'webdatastats', 'proximic', 'adsbot',
];

// Paths that are commonly probed by bots (return 403 immediately)
const HONEYPOT_PATHS = [
    '/wp-login.php', '/wp-signup.php', '/xmlrpc.php',
    '/.env', '/.git', '/config.php', '/admin.php',
    '/phpmyadmin', '/pma', '/mysql', '/debug',
    '/.well-known/security.txt', '/backup', '/db',
    '/wp-config', '/readme.html', '/license.txt',
];

// ── Concurrency limiter (per-isolate, not global, but still helps) ──────
let inFlightToNextJs = 0;
const MAX_CONCURRENT_NEXTJS = 50; // Max in-flight requests to Next.js per isolate

// ── Stats (per-isolate, resets on cold start) ───────────────────────────
const stats = { apiCacheHit: 0, apiCacheMiss: 0, pageCacheHit: 0, pageCacheMiss: 0, botBlocked: 0, totalRequests: 0 };

const ROUTER_VERSION = '2026-03-01-origin-direct-cachekeys';

function clampSnippet(text, max = 300) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
}

/**
 * Returns true if the request looks like a bad bot.
 */
function isSuspiciousRequest(request) {
    const ua = (request.headers.get('User-Agent') || '').toLowerCase();

    // NOTE: Requests originating from other Workers (service bindings / SSR subrequests)
    // may legitimately have no User-Agent. Don't block solely on that.
    if (!ua) return false;

    // Known bad bots
    if (BAD_BOT_PATTERNS.some(p => ua.includes(p))) return true;

    return false;
}

/**
 * Wraps a promise with a timeout. Rejects if the promise doesn't
 * resolve within `ms` milliseconds.
 */
function withTimeout(promise, ms) {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('TIMEOUT')), ms);
        promise.then(
            (val) => { clearTimeout(timer); resolve(val); },
            (err) => { clearTimeout(timer); reject(err); }
        );
    });
}

/** Minimal HTML error page served when Next.js is overloaded or timing out */
const OVERLOADED_HTML = `<!DOCTYPE html><html><head><meta charset="utf-8">
<title>bootflare.com</title>
<meta http-equiv="refresh" content="5">
<style>body{font-family:system-ui;display:flex;justify-content:center;align-items:center;height:100vh;margin:0;background:#f8f9fa}
.c{text-align:center;max-width:420px}.s{animation:spin 1s linear infinite;width:32px;height:32px;border:3px solid #e2e8f0;border-top-color:#3b82f6;border-radius:50%;margin:0 auto 16px}
@keyframes spin{to{transform:rotate(360deg)}}</style></head>
<body><div class="c"><div class="s"></div><h2>Loading&hellip;</h2><p>The page is warming up. It will auto-retry in a few seconds.</p></div></body></html>`;

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;

        // ── Debug endpoint — visit bootflare.com/__debug to diagnose ─
        if (pathname === '/__debug') {
            return new Response(JSON.stringify({
                router: 'active',
                version: ROUTER_VERSION,
                hasServiceBinding: !!env.NEXTJS_WORKER,
                hasOriginUrl: !!env.ORIGIN_URL,
                host: request.headers.get('Host'),
                pathname,
                url: request.url,
                inFlight: inFlightToNextJs,
                stats,
                cf: {
                    colo: request.cf?.colo,
                    asn: request.cf?.asn,
                    country: request.cf?.country,
                }
            }, null, 2), {
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // ── Health probe: hits WP + Next.js and reports latency/status ─
        if (pathname === '/__health') {
            const started = Date.now();
            const results = {
                router: 'active',
                version: ROUTER_VERSION,
                now: new Date().toISOString(),
                cf: {
                    colo: request.cf?.colo,
                    asn: request.cf?.asn,
                    country: request.cf?.country,
                },
                nextjs: null,
                wpJson: null,
                wpGraphql: null,
                msTotal: 0,
            };

            // Next.js probe (service binding)
            try {
                const nextjsWorker = env.NEXTJS_WORKER;
                if (!nextjsWorker) throw new Error('missing NEXTJS_WORKER binding');
                const t0 = Date.now();
                const probeReq = new Request('https://bootflare.com/?__router_probe=1', {
                    method: 'GET',
                    headers: { 'User-Agent': 'bootflare-router-healthcheck' },
                });
                const res = await withTimeout(nextjsWorker.fetch(probeReq), 12000);
                results.nextjs = { status: res.status, ms: Date.now() - t0 };
            } catch (e) {
                results.nextjs = { error: e?.message || String(e) };
            }

            // WP JSON probe (direct origin)
            try {
                const t0 = Date.now();
                const res = await withTimeout(fetch('https://origin-wp.bootflare.com/wp-json/', {
                    headers: { 'User-Agent': 'bootflare-router-healthcheck' },
                }), 12000);
                const ct = res.headers.get('content-type') || '';
                const body = await res.text();
                results.wpJson = { status: res.status, ms: Date.now() - t0, contentType: ct, snippet: clampSnippet(body) };
            } catch (e) {
                results.wpJson = { error: e?.message || String(e) };
            }

            // WP GraphQL probe (direct origin)
            try {
                const t0 = Date.now();
                const res = await withTimeout(fetch('https://origin-wp.bootflare.com/graphql', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'User-Agent': 'bootflare-router-healthcheck',
                    },
                    body: JSON.stringify({ query: 'query{__typename}' }),
                }), 12000);
                const ct = res.headers.get('content-type') || '';
                const body = await res.text();
                results.wpGraphql = { status: res.status, ms: Date.now() - t0, contentType: ct, snippet: clampSnippet(body) };
            } catch (e) {
                results.wpGraphql = { error: e?.message || String(e) };
            }

            results.msTotal = Date.now() - started;
            return new Response(JSON.stringify(results, null, 2), {
                headers: { 'Content-Type': 'application/json' },
            });
        }

        stats.totalRequests++;

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
            stats.botBlocked++;
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
                        // Cache key must NOT include original request headers (Cookie, UA, etc.)
                        // otherwise every visitor gets a unique cache key and the cache never hits
                        cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
                    } else {
                        // GET requests: use URL only, strip varying headers
                        cacheKey = new Request(request.url, { method: 'GET' });
                    }

                    const cachedResponse = await cache.match(cacheKey);
                    if (cachedResponse) {
                        const response = new Response(cachedResponse.body, cachedResponse);
                        response.headers.set('X-API-Cache', 'HIT');
                        stats.apiCacheHit++;
                        return response;
                    }

                    // Count a miss when we attempted cache lookup
                    stats.apiCacheMiss++;
                } catch (e) {
                    console.error('API Cache Error:', e);
                }
            }

            // IMPORTANT: Fetch origin-wp directly to avoid any possibility of worker-route recursion
            // when this router is bound to bootflare.com/*.
            const originUrl = new URL(request.url);
            originUrl.hostname = 'origin-wp.bootflare.com';

            const response = await fetch(originUrl.toString(), {
                method: request.method,
                headers: wpHeaders,
                body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
                redirect: 'manual',
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
                stats.apiCacheMiss++;
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

        // ── Concurrency gate — shed load before overwhelming Next.js / WP ──
        if (inFlightToNextJs >= MAX_CONCURRENT_NEXTJS) {
            // Too many in-flight SSR requests; return a friendly auto-retry page
            return new Response(OVERLOADED_HTML, {
                status: 503,
                headers: {
                    'Content-Type': 'text/html;charset=UTF-8',
                    'Retry-After': '5',
                    'Cache-Control': 'no-store',
                },
            });
        }

        // --- Cache Logic ---
        const cache = caches.default;
        const isCacheableMethod = ['GET', 'HEAD'].includes(request.method);

        let cacheUrl = new URL(request.url);
        let cacheKey;
        try {
            // Cache key must NOT include original request headers (Cookie, UA, etc.)
            // otherwise every visitor gets a unique cache key and the cache never hits
            cacheKey = new Request(cacheUrl.toString(), { method: 'GET' });
        } catch (e) {
            console.error(`ERROR: Failed to construct cacheKey. cacheUrl: "${cacheUrl.toString()}"`);
            cacheKey = new Request(request.url, { method: 'GET' });
        }

        const useCache = isCacheableMethod && !url.searchParams.has('nocache');

        if (useCache) {
            const cachedResponse = await cache.match(cacheKey);
            if (cachedResponse) {
                const response = new Response(cachedResponse.body, cachedResponse);
                response.headers.set('X-Worker-Cache', 'HIT');
                stats.pageCacheHit++;
                return response;
            }

            stats.pageCacheMiss++;
        }

        // Service Binding call with timeout — don't let the request hang forever
        inFlightToNextJs++;
        let response;
        try {
            response = await withTimeout(nextjsWorker.fetch(request), 15000); // 15s max
        } catch (err) {
            inFlightToNextJs--;
            console.error('Next.js Worker timeout or error:', err.message);
            return new Response(OVERLOADED_HTML, {
                status: 503,
                headers: {
                    'Content-Type': 'text/html;charset=UTF-8',
                    'Retry-After': '5',
                    'Cache-Control': 'no-store',
                },
            });
        }
        inFlightToNextJs--;

        // Store in cache if status is OK and it's a cacheable method
        if (useCache && response.ok) {
            const responseToCache = new Response(response.body, response);
            responseToCache.headers.set('Cache-Control', 'public, s-maxage=3600');

            ctx.waitUntil(cache.put(cacheKey, responseToCache.clone()));

            response = new Response(responseToCache.body, responseToCache);
            response.headers.set('X-Worker-Cache', 'MISS');
            stats.pageCacheMiss++;
        }

        return response;
    },
};
