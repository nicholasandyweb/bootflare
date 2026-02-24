import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Search, Sparkles, LayoutGrid, Clock, ArrowRight } from 'lucide-react';

interface LogoCategory {
    id: number;
    name: string;
    slug: string;
    count: number;
}

interface Logo {
    id: number;
    title: {
        rendered: string;
    };
    slug: string;
    _embedded?: {
        'wp:featuredmedia'?: {
            source_url: string;
        }[];
    };
}

export default async function FreeBrandLogosPage() {
    let categories: LogoCategory[] = [];
    let latestLogos: Logo[] = [];

    try {
        const [cats, logos] = await Promise.all([
            fetchREST('logos?per_page=100&hide_empty=true'),
            fetchREST('logo?per_page=12&_embed')
        ]);
        categories = cats;
        latestLogos = logos;
    } catch (error) {
        console.error('Error fetching free brand logos data:', error);
    }

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container">
                {/* Hero Header */}
                <div className="max-w-4xl mx-auto text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Global Identities
                    </div>
                    <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-tight font-ubuntu">
                        Free Brand <span className="text-gradient">Logos</span>
                    </h1>
                    <p className="text-xl text-slate-500 font-light leading-relaxed mb-12 max-w-2xl mx-auto">
                        Your professional source for world-class brand identities. High-resolution PNG and SVG formats, curated for elite creators.
                    </p>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto group">
                        <input
                            type="text"
                            placeholder="Search brands (e.g. Amazon, Google, Nike...)"
                            className="w-full pl-14 pr-6 py-5 rounded-[2rem] bg-white border border-slate-200 shadow-2xl shadow-slate-200 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all text-lg font-medium"
                        />
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 w-6 h-6 group-focus-within:text-primary transition-colors" />
                    </div>
                </div>

                {/* Categories Section */}
                <section className="mb-32">
                    <div className="flex items-center justify-between mb-12 border-b border-slate-200 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <LayoutGrid className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Browse by Industry</h2>
                        </div>
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">{categories.length} Specializations</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/logos/category/${cat.slug}`}
                                className="card-premium !p-8 group hover:!border-primary/30 text-center"
                            >
                                <h3 className="font-bold text-slate-800 group-hover:text-primary transition-colors mb-2 text-lg">{cat.name}</h3>
                                <div className="inline-block px-3 py-1 bg-slate-50 rounded-full text-[10px] font-bold text-slate-400 uppercase tracking-wider group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                    {cat.count} Variants
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Latest Logos Section */}
                <section>
                    <div className="flex items-center justify-between mb-12 border-b border-slate-200 pb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                <Clock className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-900">Recently Defined</h2>
                        </div>
                        <Link href="/logos" className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-all">
                            Explore Full Archive <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6 md:gap-8">
                        {latestLogos.map((logo) => {
                            const featuredImage = logo._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                            return (
                                <div key={logo.id} className="group relative">
                                    <Link
                                        href={`/logo/${logo.slug}`}
                                        className="card-premium !p-0 aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden bg-white hover:!border-primary/20"
                                    >
                                        <div className="flex-1 w-full flex items-center justify-center p-6">
                                            <img
                                                src={featuredImage || "https://via.placeholder.com/300"}
                                                alt={logo.title.rendered}
                                                className="max-w-[80%] max-h-[80%] object-contain filter group-hover:scale-110 transition-transform duration-700"
                                            />
                                        </div>
                                        <div className="w-full py-5 px-4 bg-white border-t border-slate-100 transition-colors">
                                            <h3 className="text-[10px] font-bold text-center text-slate-500 line-clamp-1 group-hover:text-primary transition-colors uppercase tracking-widest">
                                                {logo.title.rendered}
                                            </h3>
                                        </div>
                                    </Link>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {categories.length === 0 && latestLogos.length === 0 && (
                    <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                        <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-6 animate-pulse" />
                        <p className="text-slate-400 text-xl font-light">Loading our premium directory...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
