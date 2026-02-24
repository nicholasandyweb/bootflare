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
 *   1. Go to Workers & Pages → Create → Worker
 *   2. Paste this script
 *   3. Set environment variable: PAGES_URL = https://bootflare.pages.dev
 *      (or whatever your Cloudflare Pages deployment URL is)
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
            // The A record for bootflare.com still points to shared hosting,
            // so Cloudflare will forward this directly to your origin server.
            return fetch(request);
        }

        // ── Next.js: forward to Cloudflare Pages ──────────────────────────
        // PAGES_URL is set in the Worker's environment variables,
        // e.g. https://bootflare.pages.dev
        const pagesBase = env.PAGES_URL;
        const targetUrl = new URL(pathname + url.search, pagesBase);

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

        return fetch(newRequest);
    },
};
