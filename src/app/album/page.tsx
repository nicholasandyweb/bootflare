export const dynamic = 'force-dynamic';
import { fetchREST, fetchRESTWithMeta } from '@/lib/rest';
import { fetchGraphQL } from '@/lib/graphql';
import Link from 'next/link';
import { Play, Music2, Headphones, Sparkles } from 'lucide-react';
import DmcaCard from '@/components/DmcaCard';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import Pagination from '@/components/Pagination';
import { decodeEntities } from '@/lib/sanitize';
import LogoSearch from '@/components/LogoSearch';


export async function generateMetadata(): Promise<Metadata> {
    const seo = await fetchRankMathSEO('https://bootflare.com/album/');
    if (seo) return mapRankMathToMetadata(seo);
    return { title: 'Royalty Free Music Album | Bootflare' };
}

interface Album {
    id: number;
    title: { rendered: string };
    slug: string;
    excerpt: { rendered: string };
    _embedded?: {
        'wp:featuredmedia'?: { source_url: string }[];
    };
}

const GET_PAGE_DATA = `
  query GetMusicPage {
    page(id: "/album/", idType: URI) {
        title
        excerpt
    }
  }
`;

interface WPData {
    page: { title: string; excerpt?: string };
}

export default async function AlbumArchive({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
    const sp = await searchParams;
    const page = parseInt(sp.page || '1', 10);

    let albums: Album[] = [];
    let wpData: WPData | null = null;
    let seoData: any = null;
    let totalPages = 1;

    try {
        const [res, data, seo] = await Promise.all([
            fetchRESTWithMeta(`album?per_page=12&page=${page}&_embed`),
            fetchGraphQL<WPData>(GET_PAGE_DATA),
            fetchRankMathSEO('https://bootflare.com/album/')
        ]);
        albums = res.data;
        totalPages = res.totalPages;
        wpData = data;
        seoData = seo;
    } catch (error) {
        console.error('Error fetching albums:', error);
    }

    const description = seoData?.description
        ? decodeEntities(seoData.description)
        : wpData?.page?.excerpt
            ? decodeEntities(wpData.page.excerpt.replace(/<[^>]*>/g, '').trim())
            : 'Explore our high-quality royalty-free music library. Premium audio assets for your creative projects.';

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800">
                        {wpData?.page?.title ? <span dangerouslySetInnerHTML={{ __html: wpData.page.title }} /> : <>High-Quality Music Albums</>}
                    </h1>

                    <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700">Royalty Free Music</span>
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
                {/* Music Gallery */}
                <section className="mb-32 mt-12">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-slate-800">Explore Audio Library</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {albums.map((album) => {
                            const featuredImage = album._embedded?.['wp:featuredmedia']?.[0]?.source_url;

                            return (
                                <div key={album.id} className="group bg-white rounded-[2.5rem] border border-pink-50 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:-translate-y-1 transition-all">
                                    <Link
                                        href={`/album/${album.slug}`}
                                        className="relative aspect-square rounded-[2rem] overflow-hidden block mb-6"
                                    >
                                        <img
                                            src={featuredImage || "https://via.placeholder.com/400"}
                                            alt={album.title.rendered}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg">
                                                <Play className="w-6 h-6 fill-current ml-1" />
                                            </div>
                                        </div>
                                    </Link>

                                    <div className="px-2 pb-2">
                                        <h3 className="text-lg font-bold text-slate-800 mb-2 leading-tight">
                                            {album.title.rendered}
                                        </h3>
                                        <div className="flex items-center justify-between text-xs font-semibold text-[#8b5cf6]">
                                            <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                                <Headphones className="w-3 h-3" />
                                                Hi-Fi Audio
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {totalPages > 1 && (
                        <div className="mt-16">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                baseUrl="/album"
                            />
                        </div>
                    )}
                </section>

                {/* Categories / Archive links */}
                <div className="mt-32">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-slate-800">Browse by Assets</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Link href="/logo-categories" className="block bg-[#FBF3FF] border border-pink-100 rounded-3xl p-10 text-center hover:shadow-lg transition-all group">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Logo Categories</h3>
                            <p className="text-slate-600 font-light">Explore 1000+ premium brand identities</p>
                        </Link>
                        <Link href="/logo-collections" className="block bg-white border border-slate-100 rounded-3xl p-10 text-center hover:shadow-lg transition-all group">
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Logo Collections</h3>
                            <p className="text-slate-600 font-light">Curated groups of industry-specific logos</p>
                        </Link>
                    </div>
                </div>

                {/* Global Footer Components */}
                <div className="mt-32">
                    <DmcaCard />
                </div>
            </div>
        </div>
    );
}
