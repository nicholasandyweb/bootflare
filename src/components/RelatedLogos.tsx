import { fetchREST } from '@/lib/rest';
import LogoCard from './LogoCard';

interface Logo {
    id: number;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    slug: string;
    excerpt?: {
        rendered: string;
    };
    _embedded?: {
        'wp:featuredmedia'?: {
            source_url: string;
            alt_text?: string;
        }[];
        'wp:term'?: {
            id: number;
            name: string;
            slug: string;
            taxonomy?: string;
            link?: string;
        }[][];
    };
}

async function getRelatedLogos(logo: Logo) {
    try {
        // Step 1: Try fetching from Contextual Related Posts (CRP) plugin
        const crpResults: { id?: number; ID?: number }[] = await fetchREST(`posts/${logo.id}`, 3, 'contextual-related-posts/v1');

        if (crpResults && crpResults.length > 0) {
            // Deduplicate IDs and exclude the current logo
            const relatedIds = Array.from(new Set(
                crpResults.map(item => item.id || item.ID).filter(id => id && id !== logo.id)
            ));

            if (relatedIds.length > 0) {
                // Fetch full logo objects with embedding for the IDs returned by CRP
                const crpLogos = await fetchREST(`logo?include=${relatedIds.join(',')}&_embed&per_page=4&_fields=id,title,slug,_links,_embedded`);
                if (crpLogos && crpLogos.length > 0) {
                    return crpLogos as Logo[];
                }
            }
        }

        // Step 2: Fallback to existing logic if CRP is empty or fails
        const allTerms = logo._embedded?.['wp:term']?.flat() || [];
        const categoryIds = allTerms.map(term => term.id);
        const searchContext = logo.title.rendered.replace(/Logo/gi, '').trim();

        // Search globally for the context
        let related = await fetchREST(`logo?search=${encodeURIComponent(searchContext)}&per_page=4&exclude=${logo.id}&_embed&_fields=id,title,slug,_links,_embedded`);

        // Fallback to same-category latest
        if (!related || related.length < 4) {
            const categoryFilter = categoryIds.length > 0 ? `&logos=${categoryIds.join(',')}` : '';
            const fallback = await fetchREST(`logo?per_page=4&exclude=${logo.id}${categoryFilter}&_embed&_fields=id,title,slug,_links,_embedded`);
            related = fallback;
        }

        // Final safety check: filter out duplicates in the returned array
        const finalRelated = Array.from(new Map(related.map((item: any) => [item.id, item])).values());
        return (finalRelated as Logo[]).slice(0, 4);
    } catch (error) {
        console.error('Error fetching related logos:', error);
        return [];
    }
}

export default async function RelatedLogos({ logo }: { logo: Logo }) {
    const relatedLogos = await getRelatedLogos(logo);

    if (relatedLogos.length === 0) return null;

    return (
        <div className="mt-32">
            <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900">You may also like</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                {relatedLogos.map((item) => (
                    <LogoCard key={item.id} logo={item} />
                ))}
            </div>
        </div>
    );
}
