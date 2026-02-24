export const revalidate = 3600;
import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { decodeEntities } from '@/lib/sanitize';
import DmcaCard from '@/components/DmcaCard';
import LogoSearch from '@/components/LogoSearch';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await fetchRankMathSEO('https://bootflare.com/logo-collections/');
    if (seo) return mapRankMathToMetadata(seo);
    return { title: 'Logo Collections | Bootflare' };
}

interface LogoCollection {
    id: number;
    name: string;
    slug: string;
    count: number;
}

export default async function LogoCollectionsArchive() {
    let collections: LogoCollection[] = [];
    let seoData: any = null;
    let taxonomyMeta: any = null;

    try {
        const results = await Promise.allSettled([
            fetchREST('logo-collection?per_page=100&hide_empty=true'),
            fetchRankMathSEO('https://bootflare.com/logo-collections/'),
            fetchREST('taxonomies/logo-collection')
        ]);

        if (results[0].status === 'fulfilled') {
            collections = (results[0].value as LogoCollection[]) || [];
        }
        if (results[1].status === 'fulfilled') {
            seoData = results[1].value;
        }
        if (results[2].status === 'fulfilled') {
            taxonomyMeta = results[2].value;
        }
    } catch (error) {
        console.error('Unexpected error in LogoCollectionsArchive:', error);
    }

    const description = taxonomyMeta?.description
        ? decodeEntities(taxonomyMeta.description)
        : seoData?.description
            ? decodeEntities(seoData.description)
            : 'Explore our curated groups of brand identities. Find industry-specific collections tailored for your creative needs.';

    const pageTitle = taxonomyMeta?.name || 'Logo Collections';

    // Ensure we only show collections that actually contain logos
    const activeCollections = (collections || []).filter(col => col.count > 0);

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800">
                        {pageTitle ? <span dangerouslySetInnerHTML={{ __html: pageTitle }} /> : <>Logo Collections</>}
                    </h1>

                    <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700">Logo Collections</span>
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

            <div className="container px-6 pb-20">
                <section className="mb-32 mt-12">

                    {activeCollections.length > 0 ? (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                            {activeCollections.map((col) => (
                                <Link
                                    key={col.id}
                                    href={`/logo-collections/${col.slug}`}
                                    className="block bg-white border border-pink-100 rounded-2xl px-6 py-5 text-center shadow-[0_4px_20px_-4px_rgba(252,231,243,0.5)] hover:border-primary/30 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                                >
                                    <h2 className="font-bold text-slate-900 text-[15px] mb-1.5 leading-tight">{col.name}</h2>
                                    <div className="font-semibold text-[#8b5cf6] text-[14px]">
                                        {col.count} Logos
                                    </div>
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-slate-500 py-10">
                            No collections found.
                        </div>
                    )}
                </section>

                <DmcaCard />
            </div>
        </div>
    );
}
