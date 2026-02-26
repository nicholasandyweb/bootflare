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
    const isRSC = request.headers.has('RSC') || request.headers.has('Next-Router-Prefetch');
    if (isRSC) {
        response.headers.set('Cache-Control', 'public, max-age=3600, immutable');
    }

    return response;
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
