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

const ROUTER_VERSION = '2026-03-02-dedup-probe';

// ── WP API cache settings ────────────────────────────────────────────────
// "Fresh" window: serve from cache without revalidating (2 minutes)
const SWR_FRESH_MS = 2 * 60 * 1000;
// "Stale" window: keep cached entry alive even after it's stale (24 hours)
// On WP slowness/503, stale data is FAR better than an empty fallback page.
const SWR_STORE_AGE_S = 24 * 60 * 60;

const DEFAULT_WP_RESOLVE_OVERRIDE = 'origin-wp.bootflare.com';

function clampSnippet(text, max = 300) {
    if (!text) return '';
    return text.length > max ? text.slice(0, max) + '…' : text;
}

function isStaticAssetPath(pathname) {
    if (!pathname) return false;
    if (pathname.startsWith('/_next/')) return true;
    // Common static file extensions (avoid caching HTML documents)
    return /\.(?:js|css|map|png|jpe?g|gif|webp|svg|ico|txt|xml|woff2?|ttf|eot)$/.test(pathname);
}

function getOriginUrlHost(env) {
    if (!env?.ORIGIN_URL) return null;
    try {
        return new URL(env.ORIGIN_URL).host;
    } catch {
        return 'INVALID_ORIGIN_URL';
    }
}

function getWpTargetUrl(requestUrl, env) {
    const originHost = getOriginUrlHost(env);

    // If ORIGIN_URL isn't set (or is invalid), don't rewrite.
    if (!originHost || originHost === 'INVALID_ORIGIN_URL') return requestUrl;

    // IMPORTANT: If ORIGIN_URL points at the resolveOverride hostname, do NOT use it.
    // That forces SNI to origin-wp.bootflare.com and will typically fail TLS/vhost on shared hosting.
    if (originHost === DEFAULT_WP_RESOLVE_OVERRIDE) return requestUrl;

    // ORIGIN_URL should be a full URL like: https://your-hosting-provider.example
    // It must have a valid TLS cert. We still send Host: bootflare.com for vhost routing.
    const origin = new URL(env.ORIGIN_URL);
    const target = new URL(requestUrl);
    target.protocol = origin.protocol;
    target.host = origin.host;
    return target.toString();
}

function getWpCfOptions(env) {
    const originHost = getOriginUrlHost(env);

    // If ORIGIN_URL is provided (and isn't the resolveOverride hostname), do not use resolveOverride.
    // We're already targeting the origin host.
    if (originHost && originHost !== 'INVALID_ORIGIN_URL' && originHost !== DEFAULT_WP_RESOLVE_OVERRIDE) return undefined;
    return { resolveOverride: DEFAULT_WP_RESOLVE_OVERRIDE };
}

/**
 * Background WP API cache refresh (stale-while-revalidate).
 * Fetches the URL fresh from WP and updates the cache if the response is valid JSON.
 * Called via ctx.waitUntil() so it never blocks the response path.
 */
async function refreshWpApiCache(cacheKey, wpTargetUrl, wpHeaders, cfOptions, cache) {
    try {
        const res = await withTimeout(fetch(wpTargetUrl, {
            method: 'GET',
            headers: wpHeaders,
            redirect: 'manual',
            cf: cfOptions,
        }), 12000);

        if (!res.ok) return;
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) return;

        const bodyText = await res.text();
        if (bodyText.length <= 10) return; // don't cache empty [] or {}

        const responseToCache = new Response(bodyText, res);
        responseToCache.headers.set('Cache-Control', `public, s-maxage=${SWR_STORE_AGE_S}`);
        responseToCache.headers.set('X-SWR-Fresh-Until', String(Date.now() + SWR_FRESH_MS));
        await cache.put(cacheKey, responseToCache);
    } catch (_e) {
        // WP is slow/down — silently fail; stale entry continues being served.
    }
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

function serviceUnavailable(reason) {
    const message = reason ? `Service Unavailable (${reason})` : 'Service Unavailable';
    return new Response(message, {
        status: 503,
        headers: {
            'Content-Type': 'text/plain;charset=UTF-8',
            'Retry-After': '5',
            'Cache-Control': 'no-store',
            ...(reason ? { 'X-Router-Error': reason } : {}),
        },
    });
}

export default {
    /**
     * Scheduled handler — pre-warms the WP API cache every 5 minutes.
     * This ensures key endpoints always have a fresh (or at worst stale) cached response,
     * even when WP shared hosting is intermittently slow.
     */
    async scheduled(_event, env, ctx) {
        const cache = caches.default;
        const wpHeaders = {
            'Host': 'bootflare.com',
            'X-Forwarded-Host': 'bootflare.com',
            'X-Forwarded-Proto': 'https',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'application/json',
        };
        const cfOptions = getWpCfOptions(env);

        // Endpoints to pre-warm — these are the ones most likely to cause fallback on slow WP.
        const endpoints = [
            'posts?per_page=8&_embed=wp:featuredmedia,wp:term&_fields=id,title,slug,excerpt,date,_links,_embedded',
            'logo?per_page=24&page=1&_embed&_fields=id,title,slug,_links,_embedded',
        ];

        for (const ep of endpoints) {
            const publicUrl = `https://bootflare.com/wp-json/wp/v2/${ep}`;
            const cacheKey = new Request(publicUrl, { method: 'GET' });
            const targetUrl = getWpTargetUrl(publicUrl, env);

            // Check if entry is already fresh — skip if so
            const existing = await cache.match(cacheKey);
            if (existing) {
                const freshUntil = parseInt(existing.headers.get('X-SWR-Fresh-Until') || '0');
                if (Date.now() < freshUntil) continue; // still fresh, nothing to do
            }

            // Fetch fresh from WP and update cache
            ctx.waitUntil(refreshWpApiCache(cacheKey, targetUrl, wpHeaders, cfOptions, cache));
        }
    },

    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const { pathname } = url;

        // ── Debug endpoint — visit bootflare.com/__debug to diagnose ─
        if (pathname === '/__debug') {
            const originHost = getOriginUrlHost(env);
            return new Response(JSON.stringify({
                router: 'active',
                version: ROUTER_VERSION,
                hasServiceBinding: !!env.NEXTJS_WORKER,
                hasOriginUrl: !!env.ORIGIN_URL,
                originHost,
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
            const cache = caches.default;
            const useHealthCache = request.method === 'GET' && !url.searchParams.has('nocache');
            const healthCacheKey = new Request(url.toString(), { method: 'GET' });

            if (useHealthCache) {
                const cached = await cache.match(healthCacheKey);
                if (cached) {
                    const resp = new Response(cached.body, cached);
                    resp.headers.set('X-Health-Cache', 'HIT');
                    return resp;
                }
            }

            const started = Date.now();
            const originHost = getOriginUrlHost(env);
            const results = {
                router: 'active',
                version: ROUTER_VERSION,
                now: new Date().toISOString(),
                wpMode: (originHost && originHost !== 'INVALID_ORIGIN_URL' && originHost !== DEFAULT_WP_RESOLVE_OVERRIDE) ? 'origin_url' : 'resolve_override',
                originHost,
                cf: {
                    colo: request.cf?.colo,
                    asn: request.cf?.asn,
                    country: request.cf?.country,
                },
                nextjs: null,
                wpJson: null,
                msTotal: 0,
            };

            // Next.js probe (service binding) — hit a lightweight endpoint that
            // does not depend on WP.
            try {
                const nextjsWorker = env.NEXTJS_WORKER;
                if (!nextjsWorker) throw new Error('missing NEXTJS_WORKER binding');
                const t0 = Date.now();
                const probeUrl = new URL(request.url);
                probeUrl.pathname = '/api/ping';
                probeUrl.search = '?__router_probe=1';

                // Forward a realistic header set so Next can derive host/proto/etc.
                const probeHeaders = new Headers(request.headers);
                probeHeaders.set('User-Agent', 'bootflare-router-healthcheck');
                probeHeaders.set('Accept', 'text/plain');
                probeHeaders.delete('Cookie');

                const probeReq = new Request(probeUrl.toString(), {
                    method: 'GET',
                    headers: probeHeaders,
                });
                const res = await withTimeout(nextjsWorker.fetch(probeReq), 8000);

                const ct = res.headers.get('content-type') || '';
                let snippet = '';
                try {
                    snippet = clampSnippet(await res.clone().text());
                } catch {
                    snippet = '';
                }

                results.nextjs = {
                    url: probeUrl.toString(),
                    status: res.status,
                    ms: Date.now() - t0,
                    contentType: ct,
                    snippet,
                };
            } catch (e) {
                results.nextjs = { error: e?.message || String(e) };
            }

            // WP JSON root probe (direct origin) — lightweight, just checks WP is alive
            try {
                const t0 = Date.now();
                const wpJsonUrl = getWpTargetUrl('https://bootflare.com/wp-json/', env);
                const res = await withTimeout(fetch(wpJsonUrl, {
                    headers: { 'User-Agent': 'bootflare-router-healthcheck' },
                    cf: getWpCfOptions(env),
                }), 12000);
                const ct = res.headers.get('content-type') || '';
                const body = await res.text();
                results.wpJson = { url: wpJsonUrl, status: res.status, ms: Date.now() - t0, contentType: ct, snippet: clampSnippet(body) };
            } catch (e) {
                results.wpJson = { error: e?.message || String(e) };
            }

            results.msTotal = Date.now() - started;

            const body = JSON.stringify(results, null, 2);
            const resp = new Response(body, {
                headers: {
                    'Content-Type': 'application/json',
                    'Cache-Control': useHealthCache ? 'public, s-maxage=60' : 'no-store',
                },
            });

            if (useHealthCache) {
                resp.headers.set('X-Health-Cache', 'MISS');
                ctx.waitUntil(cache.put(healthCacheKey, resp.clone()));
            }

            return resp;
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

            // --- API Caching (WP REST) ---
            const isApi = pathname.startsWith('/wp-json');
            const cache = caches.default;
            let cacheKey = request;

            // For WP REST endpoints, honour the requester's Cache-Control so that
            // Next.js SSR subrequests (which send `cache: 'no-store'`) always get
            // a fresh response and never receive a stale/empty cached payload.
            const reqCacheControl = (request.headers.get('Cache-Control') || '').toLowerCase();
            const bypassApiCache = reqCacheControl.includes('no-store') || reqCacheControl.includes('no-cache');

            if (isApi && !bypassApiCache && request.method === 'GET') {
                try {
                    // GET requests: use URL only, strip varying headers
                    cacheKey = new Request(request.url, { method: 'GET' });

                    const cachedResponse = await cache.match(cacheKey);
                    if (cachedResponse) {
                        const freshUntil = parseInt(cachedResponse.headers.get('X-SWR-Fresh-Until') || '0');
                        const isStale = Date.now() > freshUntil;

                        if (!isStale) {
                            // Cache is fresh — serve immediately
                            const response = new Response(cachedResponse.body, cachedResponse);
                            response.headers.set('X-API-Cache', 'HIT');
                            stats.apiCacheHit++;
                            return response;
                        }

                        // Cache is stale — serve old data immediately and revalidate in background.
                        // This means pages NEVER show fallback content just because WP is temporarily slow.
                        if (request.method === 'GET') {
                            const wpTargetUrl = getWpTargetUrl(request.url, env);
                            ctx.waitUntil(refreshWpApiCache(cacheKey, wpTargetUrl, wpHeaders, getWpCfOptions(env), cache));
                        }

                        const staleResponse = new Response(cachedResponse.body, cachedResponse);
                        staleResponse.headers.set('X-API-Cache', 'STALE');
                        stats.apiCacheHit++;
                        return staleResponse;
                    }

                    // Count a miss when we attempted cache lookup
                    stats.apiCacheMiss++;
                } catch (e) {
                    console.error('API Cache Error:', e);
                }
            }

            // IMPORTANT: Keep URL host as bootflare.com so TLS/SNI matches your existing cert,
            // but route DNS to the real origin via resolveOverride.
            const wpTargetUrl = getWpTargetUrl(request.url, env);
            const response = await fetch(wpTargetUrl, {
                method: request.method,
                headers: wpHeaders,
                body: ['GET', 'HEAD'].includes(request.method) ? null : request.body,
                redirect: 'manual',
                cf: getWpCfOptions(env),
            });

            // Cache successful API responses that return actual JSON (not HTML bot challenges)
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');

            if (isApi && !bypassApiCache && response.ok && isJson && request.method === 'GET') {
                try {
                    // Clone body to inspect content — don't cache empty arrays/objects
                    // (WP returns [] under load; caching that poisons the site)
                    const bodyText = await response.clone().text();
                    const isSubstantial = bodyText.length > 10; // more than [] or {}

                    if (isSubstantial) {
                        const responseToCache = new Response(bodyText, response);
                        // Store for 24h so stale data is available during WP slow periods.
                        // X-SWR-Fresh-Until tracks the 2-minute "fresh" window; after that,
                        // stale data is served while the cache is refreshed in the background.
                        responseToCache.headers.set('Cache-Control', `public, s-maxage=${SWR_STORE_AGE_S}`);
                        responseToCache.headers.set('X-SWR-Fresh-Until', String(Date.now() + SWR_FRESH_MS));
                        ctx.waitUntil(cache.put(cacheKey, responseToCache));
                    }

                    const newResponse = new Response(bodyText, response);
                    newResponse.headers.set('X-API-Cache', 'MISS');
                    return newResponse;
                } catch (e) {
                    console.error('API Cache Store Error:', e);
                    // Fall through and return the original response uncached
                }
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
            // Too many in-flight SSR requests
            return serviceUnavailable('nextjs_concurrency');
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

        // Only cache static assets. Caching HTML can "stick" fallback SSR for a long time.
        const useCache = isCacheableMethod && isStaticAssetPath(pathname) && !url.searchParams.has('nocache');

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
            // Cold starts or heavier pages can exceed 15s; allow more headroom.
            response = await withTimeout(nextjsWorker.fetch(request), 30000); // 30s max
        } catch (err) {
            inFlightToNextJs--;
            const msg = err?.message || String(err);
            console.error('Next.js Worker timeout or error:', msg);

            // Distinguish timeout from other failures for easier debugging.
            if (msg === 'TIMEOUT') return serviceUnavailable('nextjs_timeout');

            // Retry once on transient errors.
            try {
                response = await withTimeout(nextjsWorker.fetch(request), 30000);
            } catch (err2) {
                const msg2 = err2?.message || String(err2);
                console.error('Next.js Worker retry failed:', msg2);
                if (msg2 === 'TIMEOUT') return serviceUnavailable('nextjs_timeout');
                return serviceUnavailable('nextjs_error');
            }
        }
        inFlightToNextJs--;

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
