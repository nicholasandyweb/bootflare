export const revalidate = 3600;
import { cache } from 'react';
import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Download, ChevronLeft, Flag, ExternalLink } from 'lucide-react';
import { stripScripts } from '@/lib/sanitize';
import { fetchRankMathSEO, mapRankMathToMetadata, mapWPToMetadata } from '@/lib/seo';
import LogoSearch from '@/components/LogoSearch';
import LogoCard from '@/components/LogoCard';
import CategoryList from '@/components/CategoryList';
import { Metadata } from 'next';

// Rendered on-demand via Cloudflare's edge network on every request.
export const dynamicParams = true;

// React cache() deduplicates this call within a single request:
// generateMetadata and the page body both call getLogoBySlug(slug)
// but WordPress is only hit once.
const getLogoBySlug = cache(async (slug: string) => {
    const logos = await fetchREST(`logo?slug=${slug}&_embed&_fields=id,title,content,slug,excerpt,_links,_embedded`);
    return logos.length > 0 ? (logos[0] as Logo) : null;
});

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        // Fetch SEO and logo data in parallel — both are needed and independent.
        // getLogoBySlug uses React cache() so the page body won't re-fetch it.
        const [rankMathSeo, logo] = await Promise.all([
            fetchRankMathSEO(`https://bootflare.com/logo/${slug}/`),
            getLogoBySlug(slug),
        ]);

        if (rankMathSeo) return mapRankMathToMetadata(rankMathSeo);
        if (logo) return mapWPToMetadata(logo, 'Free Brand Logos - Bootflare');
    } catch (error) {
        console.error('Error generating metadata for logo:', error);
    }
    return { title: 'Logo Not Found | Bootflare' };
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

export default async function SingleLogo({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let logo: Logo | null = null;

    try {
        // getLogoBySlug is wrapped in React cache() — if generateMetadata already
        // fetched this slug, this returns the cached result with no extra WP call.
        logo = await getLogoBySlug(slug);
    } catch (error) {
        console.error('Error fetching logo:', error);
    }

    if (!logo) {
        return (
            <div className="container py-32 text-center">
                <h1 className="text-2xl mb-4">Logo not found</h1>
                <Link href="/logos" className="text-primary hover:underline flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back to Logos
                </Link>
            </div>
        );
    }

    const featuredImage = logo._embedded?.['wp:featuredmedia']?.[0]?.source_url;

    // Find custom logo categories (usually in index 1 since index 0 is empty for standard categories)
    const allTerms = logo._embedded?.['wp:term']?.flat() || [];
    const categories = allTerms.filter(term => term.taxonomy === 'logo_category' || term.link?.includes('/logos/category/'));
    // Fallback if taxonomy isn't explicitly defined
    const finalCategories = categories.length > 0 ? categories : (logo._embedded?.['wp:term']?.[1] || []);

    const sanitizedContent = stripScripts(logo.content.rendered);
    const relatedLogos = await getRelatedLogos(logo);

    return (
        <div suppressHydrationWarning className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800 leading-tight">
                        Download this {logo.title.rendered} Logo in high quality Transparent PNG Format
                    </h1>

                    <div className="flex items-center justify-center flex-wrap gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <Link href="/logo-categories" className="text-[#8b5cf6] hover:underline font-medium">Logo Categories</Link>
                        {finalCategories.length > 0 && (
                            <>
                                <span className="text-slate-400 text-xs mt-0.5">»</span>
                                <Link href={`/logos/${finalCategories[0].slug}`} className="text-[#8b5cf6] hover:underline font-medium">
                                    {finalCategories[0].name}
                                </Link>
                            </>
                        )}
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700 truncate max-w-[200px] sm:max-w-none">{logo.title.rendered}</span>
                    </div>



                    <div className="max-w-xl mx-auto">
                        <LogoSearch />
                    </div>
                </div>
            </div>

            <div className="container py-16 px-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-12 text-center">
                    {/* Logo Preview Section */}
                    <div className="flex justify-center">
                        <div className="logobox flex items-center justify-center p-8 md:p-12 mb-8">
                            <img
                                src={featuredImage || "https://via.placeholder.com/800"}
                                alt={logo._embedded?.['wp:featuredmedia']?.[0]?.alt_text || `${logo.title.rendered} Logo Transparent PNG`}
                                className="max-w-full max-h-[300px] object-contain"
                            />
                        </div>
                    </div>

                    <div className="flex justify-center flex-wrap gap-2">
                        {finalCategories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/logos/${cat.slug}`}
                                className="inline-flex items-center gap-1.5 bg-pink-100/60 px-5 py-2 rounded-xl transition-colors hover:bg-pink-100 group"
                            >
                                <span className="font-semibold text-slate-800 text-sm">Category:</span>
                                <span className="font-bold text-primary group-hover:text-primary-dark transition-colors text-sm">{cat.name}</span>
                            </Link>
                        ))}
                    </div>

                    <div className="text-left max-w-4xl mx-auto w-full">
                        <div className="bg-white rounded-3xl p-8 md:p-12 mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
                            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-slate-800">
                                {logo.title.rendered} Logo Meaning and Description.
                            </h2>
                            <div
                                className="prose prose-slate prose-lg text-gray-600 leading-relaxed font-light max-w-none [&_p]:mb-8 article-content"
                                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                                suppressHydrationWarning
                            />
                        </div>

                        <div className="bg-[#FBF3FF] rounded-3xl p-8 md:p-12 border border-pink-100 flex flex-col items-center text-center gap-6">
                            <div className="space-y-4 flex flex-col items-center">
                                <p className="text-slate-700 text-lg font-medium">
                                    By downloading this {logo.title.rendered} Logo, you accept our <Link href="/terms-of-use" className="text-[#8b5cf6] hover:underline font-bold">terms of use</Link>
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4">
                                    <a
                                        href={`/api/download?url=${encodeURIComponent(featuredImage || "")}&filename=${logo.slug}.png`}
                                        className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl text-sm transition-opacity hover:opacity-90"
                                        style={{
                                            backgroundColor: '#383838',
                                            fontWeight: 700,
                                            textTransform: 'uppercase',
                                            color: '#FFFFFF',
                                            fill: '#FFFFFF',
                                            borderStyle: 'solid',
                                            borderWidth: '0px 5px 5px 0px',
                                            borderColor: '#FFB9DA',
                                        }}
                                    >
                                        <Download className="w-6 h-6" /> Download PNG
                                    </a>
                                </div>
                            </div>

                            <div className="flex justify-center">
                                <button className="text-gray-400 hover:text-red-500 flex items-center gap-2 text-sm transition-colors group">
                                    <Flag className="w-4 h-4 group-hover:fill-current" /> Report a problem
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Logos Section */}
                {relatedLogos.length > 0 && (
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
                )}

                {/* Main Category List at the bottom */}
                <CategoryList />
            </div>
        </div>
    );
}
