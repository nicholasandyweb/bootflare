import { fetchREST } from '@/lib/rest';
import { fetchGraphQL } from '@/lib/graphql';
import { NextResponse } from 'next/server';

const SEARCH_LOGOS_QUERY = `
  query SearchLogos($search: String, $offset: Int, $size: Int) {
    logos(where: { search: $search, offsetPagination: { offset: $offset, size: $size } }) {
      nodes {
        databaseId
        title
        slug
        featuredImage {
          node {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json([]);
    }

    try {
        let logos: any[] = [];
        const data = await fetchGraphQL<{ logos: { nodes: any[] } }>(SEARCH_LOGOS_QUERY, { search: query, offset: 0, size: 50 });

        if (data.logos) {
            logos = data.logos.nodes.map(node => ({
                id: node.databaseId,
                title: { rendered: node.title },
                slug: node.slug,
                _embedded: {
                    'wp:featuredmedia': node.featuredImage ? [{
                        source_url: node.featuredImage.node.sourceUrl,
                        alt_text: node.featuredImage.node.altText
                    }] : []
                }
            }));
        } else {
            // Fallback to REST if GraphQL returns no data or fails silently
            logos = await fetchREST(`logo?search=${encodeURIComponent(query)}&per_page=50&_embed`);
        }

        // Deduplicate results by ID
        const uniqueLogos = Array.from(new Map(logos.map((item: any) => [item.id, item])).values());

        // Improve relevance: Sort results to prioritize exact matches and "starts with" matches
        const sortedLogos = uniqueLogos.sort((a: any, b: any) => {
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
        console.warn('Search API GraphQL failed, falling back to REST:', error);
        try {
            const logos = await fetchREST(`logo?search=${encodeURIComponent(query)}&per_page=50&_embed`);
            return NextResponse.json(logos.slice(0, 20));
        } catch (e) {
            console.error('Search API final failure:', e);
            return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
        }
    }
}
