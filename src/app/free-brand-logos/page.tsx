import { fetchREST, fetchRESTWithMeta } from '@/lib/rest';
import { fetchGraphQL } from '@/lib/graphql';
import Link from 'next/link';
import { Sparkles, LayoutGrid, Clock, ArrowRight } from 'lucide-react';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import LogoSearch from '@/components/LogoSearch';
import LogoCard from '@/components/LogoCard';
import CategoryList from '@/components/CategoryList';
import Pagination from '@/components/Pagination';
import { Metadata } from 'next';
import { decodeEntities } from '@/lib/sanitize';



export async function generateMetadata(): Promise<Metadata> {
    const seo = await fetchRankMathSEO('https://bootflare.com/free-brand-logos/');
    if (seo) return mapRankMathToMetadata(seo);
    return { title: 'Free Brand Logos | Bootflare' };
}

const GET_FREE_LOGOS_PAGE = `
  query GetFreeLogosPage {
    page(id: "/free-brand-logos/", idType: URI) {
      title
      excerpt
    }
  }
`;


interface Logo {
    id: number;
    title: {
        rendered: string;
    };
    slug: string;
    _embedded?: {
        'wp:featuredmedia'?: {
            source_url: string;
            alt_text?: string;
        }[];
    };
}

interface WPPage { title: string; excerpt?: string; }

export default async function FreeBrandLogosPage({ searchParams }: { searchParams?: Promise<{ page?: string }> }) {
    const sParams = searchParams ? await searchParams : {};
    const page = parseInt(sParams.page || '1', 10);

    let latestLogos: Logo[] = [];
    let wpPage: WPPage | null = null;
    let totalPages = 1;
    let seoData: any = null;

    try {
        const [logosRes, pageData, seo] = await Promise.all([
            fetchRESTWithMeta(`logo?per_page=24&page=${page}&_embed`),
            fetchGraphQL<{ page: WPPage }>(GET_FREE_LOGOS_PAGE),
            fetchRankMathSEO('https://bootflare.com/free-brand-logos/')
        ]);
        latestLogos = logosRes.data;
        totalPages = logosRes.totalPages;
        wpPage = pageData.page;
        seoData = seo;
    } catch (error) {
        console.error('Error fetching free brand logos data:', error);
    }

    const description = seoData?.description
        ? decodeEntities(seoData.description)
        : wpPage?.excerpt
            ? decodeEntities(wpPage.excerpt.replace(/<[^>]*>/g, '').trim())
            : 'Your professional source for world-class brand identities. High-resolution PNG and SVG formats, curated for elite creators.';

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800">
                        {wpPage?.title ? <span dangerouslySetInnerHTML={{ __html: wpPage.title }} /> : <>Free Brand Logos</>}
                    </h1>

                    <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700">Free Brand Logos</span>
                    </div>

                    <p
                        className="text-slate-600 text-[16px] mb-10 leading-relaxed font-light"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    <div className="max-w-xl mx-auto">
                        <LogoSearch />
                    </div>
                </div>
            </div>

            <div className="container px-6 py-16">
                {/* Latest Logos Section */}
                <section className="mb-32">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
                        {latestLogos.map((logo) => (
                            <LogoCard key={logo.id} logo={logo} />
                        ))}
                    </div>

                    {latestLogos.length > 0 && totalPages > 1 && (
                        <div className="mb-16">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                baseUrl="/free-brand-logos"
                            />
                        </div>
                    )}

                    {/* Categories Section */}
                    <CategoryList />

                    {latestLogos.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-6 animate-pulse" />
                            <p className="text-slate-400 text-xl font-light">Loading our premium directory...</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
