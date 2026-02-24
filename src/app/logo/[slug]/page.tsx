import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Download, ChevronLeft, Flag, ExternalLink } from 'lucide-react';
import { stripScripts } from '@/lib/sanitize';
import { mapWPToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

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
        }[];
        'wp:term'?: {
            id: number;
            name: string;
            slug: string;
        }[][];
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const logos = await fetchREST(`logo?slug=${slug}&_embed`);
        if (logos.length > 0) {
            return mapWPToMetadata(logos[0], 'Free Brand Logos - Bootflare');
        }
    } catch (error) {
        console.error('Error generating metadata for logo:', error);
    }
    return { title: 'Logo Not Found | Bootflare' };
}

export async function generateStaticParams() {
    try {
        const logos: Logo[] = await fetchREST('logo?per_page=100');
        return logos.map((logo) => ({
            slug: logo.slug,
        }));
    } catch (error) {
        console.error('Error generating static params for logos:', error);
        return [];
    }
}

async function getRelatedLogos(logo: Logo) {
    try {
        // Step 1: Try fetching from Contextual Related Posts (CRP) plugin
        const crpResults: any[] = await fetchREST(`posts/${logo.id}`, 3, 'contextual-related-posts/v1');

        if (crpResults && crpResults.length > 0) {
            const relatedIds = crpResults.map(item => item.id || item.ID).filter(Boolean);
            if (relatedIds.length > 0) {
                // Fetch full logo objects with embedding for the IDs returned by CRP
                const crpLogos = await fetchREST(`logo?include=${relatedIds.join(',')}&_embed`);
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
        let related = await fetchREST(`logo?search=${encodeURIComponent(searchContext)}&per_page=8&exclude=${logo.id}&_embed`);

        // Fallback to same-category latest
        if (!related || related.length < 4) {
            const categoryFilter = categoryIds.length > 0 ? `&logos=${categoryIds.join(',')}` : '';
            const fallback = await fetchREST(`logo?per_page=8&exclude=${logo.id}${categoryFilter}&_embed`);
            related = fallback;
        }

        return related as Logo[];
    } catch (error) {
        console.error('Error fetching related logos:', error);
        return [];
    }
}

export default async function SingleLogo({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let logo: Logo | null = null;

    try {
        const logos = await fetchREST(`logo?slug=${slug}&_embed`);
        if (logos.length > 0) {
            logo = logos[0];
        }
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
    const categories = logo._embedded?.['wp:term']?.[0] || [];
    const sanitizedContent = stripScripts(logo.content.rendered);
    const relatedLogos = await getRelatedLogos(logo);

    return (
        <div suppressHydrationWarning>
            {/* Breadcrumbs */}
            <div className="bg-gray-50 border-b border-gray-100 py-4">
                <div className="container px-6 flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <span>/</span>
                    <Link href="/logos" className="hover:text-primary">Logos</Link>
                    {categories.length > 0 && (
                        <>
                            <span>/</span>
                            <Link href={`/logos/category/${categories[0].slug}`} className="hover:text-primary">
                                {categories[0].name}
                            </Link>
                        </>
                    )}
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate">{logo.title.rendered}</span>
                </div>
            </div>

            <div className="container py-16 px-6 max-w-5xl mx-auto">
                {/* Main Content */}
                <div className="flex flex-col gap-12 text-center">
                    <h1 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                        Download this {logo.title.rendered} Logo in high quality Transparent PNG Format
                    </h1>

                    <div className="flex justify-center gap-2">
                        {categories.map((cat) => (
                            <Link
                                key={cat.slug}
                                href={`/logos/category/${cat.slug}`}
                                className="text-xs bg-primary/10 text-primary px-4 py-1.5 rounded-full font-semibold hover:bg-primary/20 transition-colors"
                            >
                                {cat.name}
                            </Link>
                        ))}
                    </div>

                    {/* Logo Preview Section */}
                    <div className="bg-white border border-gray-100 rounded-[2.5rem] p-8 md:p-20 shadow-2xl flex items-center justify-center min-h-[400px]">
                        <img
                            src={featuredImage || "https://via.placeholder.com/800"}
                            alt={logo.title.rendered}
                            className="max-w-full max-h-[500px] object-contain"
                        />
                    </div>

                    <div className="text-left max-w-4xl mx-auto w-full">
                        <h2 className="text-2xl font-bold mb-6">{logo.title.rendered} Logo Meaning and Description.</h2>
                        <div
                            className="prose prose-slate prose-lg text-gray-600 leading-relaxed font-light mb-12 max-w-none [&_p]:mb-8 article-content"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            suppressHydrationWarning
                        />

                        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 border border-gray-100 flex flex-col gap-6">
                            <div className="space-y-4">
                                <p className="text-gray-600 text-lg">
                                    By downloading this {logo.title.rendered} Logo, you accept our <Link href="/terms-of-use" className="text-primary hover:underline font-medium">terms of use</Link>
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <a
                                        href={`/api/download?url=${encodeURIComponent(featuredImage || "")}&filename=${logo.slug}.png`}
                                        className="flex-1 bg-primary text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 text-lg"
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
                        <div className="flex justify-between items-end mb-12">
                            <h2 className="text-3xl font-bold text-gray-900">You may also like</h2>
                            <Link href="/logos" className="text-primary font-semibold flex items-center gap-1 hover:underline">
                                View more <ExternalLink className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
                            {relatedLogos.map((item) => (
                                <div key={item.id} className="group relative">
                                    <Link
                                        href={`/logo/${item.slug}`}
                                        className="card-premium !p-0 aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden bg-white hover:!border-primary/20"
                                    >
                                        <div className="flex-1 w-full flex items-center justify-center p-6">
                                            <img
                                                src={item._embedded?.['wp:featuredmedia']?.[0]?.source_url || "https://via.placeholder.com/200"}
                                                alt={item.title.rendered}
                                                className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-110 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="w-full py-5 px-4 bg-white border-t border-slate-100 transition-colors">
                                            <h3 className="text-xs font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors text-center">
                                                {item.title.rendered}
                                            </h3>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
