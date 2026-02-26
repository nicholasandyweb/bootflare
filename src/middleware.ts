import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Prevent workers.dev subdomain from being indexed by search engines
    const host = request.headers.get('host') || '';
    if (host.includes('workers.dev')) {
        response.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }

    // Enable browser caching for Next.js navigation data (RSC)
    // This makes page transitions instant after prefetch
    const isRSC = request.headers.has('RSC') ||
        request.headers.has('Next-Router-Prefetch') ||
        request.headers.has('Next-Router-State-Tree');

    if (isRSC) {
        // We set immutable to tell the browser this data is safe for 1 hour.
        response.headers.set('Cache-Control', 'public, max-age=3600, immutable');

        // CRITICAL: We standardize the 'Vary' header.
        // By default, Next.js varies on 'RSC' and 'Next-Router-Prefetch'.
        // If the browser prefetches with a set of headers and then navigates with 
        // a slightly different set (e.g. 'Purpose: prefetch' vs none), it might 
        // miss the cache. Force-setting it to just 'Accept' solves this.
        response.headers.set('Vary', 'Accept');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
