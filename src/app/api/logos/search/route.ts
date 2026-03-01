import { fetchREST } from '@/lib/rest';
import { NextResponse } from 'next/server';
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json([]);
  }

  try {
    // Search can be expensive on shared hosting; keep it fast.
    const logos = await fetchREST(
      `logo?search=${encodeURIComponent(query)}&per_page=50&_embed&_fields=id,title,slug,_links,_embedded`,
      1
    );

    // If WP is overloaded and returns HTML/503, fetchREST returns null.
    // Return empty results instead of timing out the entire request.
    if (!Array.isArray(logos) || logos.length === 0) {
      return NextResponse.json([]);
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
    console.error('Search API failure:', error);
    // Never hold the request open for retries; empty results are acceptable for search.
    return NextResponse.json([]);
  }
}
