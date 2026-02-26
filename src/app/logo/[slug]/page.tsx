export const revalidate = 3600;
import { cache } from 'react';
import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Download, ChevronLeft, Flag } from 'lucide-react';
import { stripScripts } from '@/lib/sanitize';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import LogoSearch from '@/components/LogoSearch';
import LogoCard from '@/components/LogoCard';
import CategoryList from '@/components/CategoryList';
import { Metadata } from 'next';
import { fetchGraphQL } from '@/lib/graphql';

// Rendered on-demand via Cloudflare's edge network on every request.
export const dynamicParams = true;
export const dynamic = 'force-dynamic';

const GET_LOGO_BY_SLUG = `
  query GetLogoBySlug($slug: ID!) {
    logo(id: $slug, idType: SLUG) {
      id
      databaseId
      title
      content
      slug
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      logoCategories {
        nodes {
          id
          name
          slug
        }
      }
    }
  }
`;

interface LogoNode {
    id: string;
    databaseId: number;
    title: string;
    content: string;
    slug: string;
    excerpt?: string;
    featuredImage?: {
        node: {
            sourceUrl: string;
            altText?: string;
        }
    };
    logoCategories?: {
        nodes: {
            id: string;
            name: string;
            slug: string;
        }[];
    };
}

const getLogoBySlug = cache(async (slug: string) => {
    try {
        const data: { logo?: LogoNode } | null = await fetchGraphQL(GET_LOGO_BY_SLUG, { slug });
        if (data && data.logo) {
            return data.logo;
        }
        throw new Error("GraphQL returned empty data.");
    } catch (e) {
        console.error('Error fetching logo via GraphQL:', e);
        // Fallback to REST only if GraphQL fails
        const logos = await fetchREST(`logo?slug=${slug}&_embed&_fields=id,title,content,slug,excerpt,_links,_embedded`);
        if (!logos || logos.length === 0) return null;

        const l = logos[0];
        return {
            id: l.id.toString(),
            databaseId: l.id,
            title: l.title.rendered,
            content: l.content.rendered,
            slug: l.slug,
            excerpt: l.excerpt?.rendered,
            featuredImage: l._embedded?.['wp:featuredmedia']?.[0] ? {
                node: {
                    sourceUrl: l._embedded['wp:featuredmedia'][0].source_url,
                    altText: l._embedded['wp:featuredmedia'][0].alt_text
                }
            } : undefined,
            logoCategories: {
                nodes: (l._embedded?.['wp:term']?.[0] || []).map((t: any) => ({
                    id: t.id.toString(),
                    name: t.name,
                    slug: t.slug
                }))
            }
        } as LogoNode;
    }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const [rankMathSeo, logo] = await Promise.all([
            fetchRankMathSEO(`https://bootflare.com/logo/${slug}/`),
            getLogoBySlug(slug),
        ]);

        if (rankMathSeo) return mapRankMathToMetadata(rankMathSeo);
        if (logo) return {
            title: `${logo.title} - Download Free Transparent PNG Logo`,
            description: logo.excerpt?.replace(/<[^>]*>/g, '').trim() || `Download the ${logo.title} logo in high quality transparent PNG format.`,
        };
    } catch (error) {
        console.error('Error generating metadata for logo:', error);
    }
    return { title: 'Download Logo | Bootflare' };
}

async function getRelatedLogos(logo: LogoNode) {
    try {
        // Step 1: Try fetching from Contextual Related Posts (CRP) plugin using the internal databaseId
        const crpResults: { id?: number; ID?: number }[] = await fetchREST(`posts/${logo.databaseId}`, 3, 'contextual-related-posts/v1');

        if (crpResults && crpResults.length > 0) {
            const relatedIds = Array.from(new Set(
                crpResults.map(item => item.id || item.ID).filter(id => id && id !== logo.databaseId)
            ));

            if (relatedIds.length > 0) {
                const crpLogos = await fetchREST(`logo?include=${relatedIds.join(',')}&_embed&per_page=4&_fields=id,title,slug,_links,_embedded`);
                if (crpLogos && crpLogos.length > 0) {
                    return crpLogos.map((l: any) => ({
                        id: l.id,
                        title: { rendered: l.title.rendered },
                        slug: l.slug,
                        _embedded: l._embedded
                    }));
                }
            }
        }

        // Step 2: Fallback to category-based latest if CRP is empty
        const catSlugs = logo.logoCategories?.nodes.map(n => n.slug) || [];
        const categoryFilter = catSlugs.length > 0 ? `&logo-category=${catSlugs[0]}` : '';
        const related = await fetchREST(`logo?per_page=4&exclude=${logo.databaseId}${categoryFilter}&_embed&_fields=id,title,slug,_links,_embedded`);

        return related.map((l: any) => ({
            id: l.id,
            title: { rendered: l.title.rendered },
            slug: l.slug,
            _embedded: l._embedded
        }));
    } catch (error) {
        console.error('Error fetching related logos:', error);
        return [];
    }
}

export default async function SingleLogo({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Step 1: Fetch core logo data (GraphQL - Fast)
    const logo = await getLogoBySlug(slug);

    if (!logo) {
        return (
            <div className="container py-32 text-center">
                <h1 className="text-2xl mb-4 text-slate-800">Logo not found</h1>
                <Link href="/logos" className="text-primary hover:underline flex items-center justify-center gap-2">
                    <ChevronLeft className="w-4 h-4" /> Back to Logos
                </Link>
            </div>
        );
    }

    // Step 2: Fetch related logos (REST) while processing the page content
    // We don't await this immediately to allow other processing if needed
    const relatedLogosPromise = getRelatedLogos(logo);

    const featuredImage = logo.featuredImage?.node.sourceUrl;
    const finalCategories = logo.logoCategories?.nodes || [];

    const sanitizedContent = logo.content ? stripScripts(logo.content) : '';
    const relatedLogos = await relatedLogosPromise;

    return (
        <div suppressHydrationWarning className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-5xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800 leading-tight">
                        Download this {logo.title} Logo in high quality Transparent PNG Format
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
                        <span className="text-slate-700 truncate max-w-[200px] sm:max-w-none">{logo.title}</span>
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
                                alt={logo.featuredImage?.node?.altText || `${logo.title} Logo Transparent PNG`}
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
                                {logo.title} Logo Meaning and Description.
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
                                    By downloading this {logo.title} Logo, you accept our <Link href="/terms-of-use" className="text-[#8b5cf6] hover:underline font-bold">terms of use</Link>
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
                            {relatedLogos.map((item: any) => (
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
