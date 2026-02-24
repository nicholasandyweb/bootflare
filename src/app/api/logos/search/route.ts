import { fetchREST } from '@/lib/rest';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        const logos = await fetchREST(`logo?search=${encodeURIComponent(query)}&per_page=50&_embed`);

        // Improve relevance: Sort results to prioritize exact matches and "starts with" matches
        const sortedLogos = [...logos].sort((a, b) => {
            const aTitle = a.title.rendered.toLowerCase();
            const bTitle = b.title.rendered.toLowerCase();
            const q = query.toLowerCase();

            // 1. Exact match
            const aExact = aTitle === q;
            const bExact = bTitle === q;
            if (aExact && !bExact) return -1;
            if (!aExact && bExact) return 1;

            // 2. Starts with query
            const aStarts = aTitle.startsWith(q);
            const bStarts = bTitle.startsWith(q);
            if (aStarts && !bStarts) return -1;
            if (!aStarts && bStarts) return 1;

            return 0; // Maintain original WP order for others
        });

        return NextResponse.json(sortedLogos.slice(0, 20));
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
    }
}
