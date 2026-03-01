export const revalidate = 86400; // 24 hours
import { fetchREST } from '@/lib/rest';
import { stripScripts, stripUnwantedTerms } from '@/lib/sanitize';
import { Sparkles, CheckCircle2, Award, Users, Globe } from 'lucide-react';
import Link from 'next/link';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const seo = await fetchRankMathSEO('https://bootflare.com/about-us/');
        if (seo) return mapRankMathToMetadata(seo);
    } catch (e) {
        console.error('Metadata fetch failed for about-us:', e);
    }
    return { title: 'About Us | Bootflare' };
}


interface RESTPage {
    title: { rendered: string };
    content: { rendered: string };
    featured_media?: number;
    _embedded?: {
        'wp:featuredmedia'?: { source_url: string }[];
    };
}

export default async function AboutPage() {
    let page: RESTPage | null = null;
    try {
        const data = await fetchREST('pages?slug=about-us&_embed&_fields=title,content,_links,_embedded');
        if (data && Array.isArray(data) && data.length > 0) {
            page = data[0];
        }
    } catch (error) {
        console.error('Error fetching about page:', error);
    }

    if (!page || !page.title?.rendered || !page.content?.rendered) {
        return (
            <div className="bg-slate-50 min-h-screen pt-32 pb-20">
                <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">About Us Content Missing</h2>
                    <p className="text-slate-500 text-lg font-light mb-8 max-w-md mx-auto">
                        This page is currently being updated. Please check back later.
                    </p>
                    <Link href="/" className="btn-premium">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const sanitizedContent = stripUnwantedTerms(stripScripts(page.content.rendered));

    return (
        <div className="bg-white min-h-screen pb-32" suppressHydrationWarning>
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 overflow-hidden bg-slate-50">
                <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -z-0" />
                <div className="container relative z-10 px-6">
                    <div className="text-center max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8 uppercase tracking-widest">
                            <Sparkles className="w-3 h-3" /> Our Mission
                        </div>
                        <h1 className="text-4xl md:text-7xl font-black text-slate-900 mb-8 leading-tight font-ubuntu">
                            {page.title.rendered}
                        </h1>
                        <p className="text-xl text-slate-500 font-light leading-relaxed italic border-l-4 border-primary pl-8 text-left max-w-2xl mx-auto">
                            "Empowering businesses to adapt and flourish in the digital era through creative excellence and technical innovation."
                        </p>
                    </div>
                </div>
            </section>

            <div className="container px-6 -mt-10 relative z-20">
                {page._embedded?.['wp:featuredmedia']?.[0]?.source_url && (
                    <div className="rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white ring-1 ring-slate-100 mb-20 aspect-video md:aspect-[21/9]">
                        <img src={page._embedded['wp:featuredmedia'][0].source_url} alt={page.title.rendered} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-16 items-start">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div
                            className="prose prose-slate prose-2xl max-w-none text-slate-700 leading-relaxed font-light article-content about-content
                                [&_p]:mb-10 [&_p:last-child]:mb-0
                                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul]:space-y-3
                                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8 [&_ol]:space-y-3
                                [&_li]:mb-2
                                [&_h2]:text-3xl [&_h2]:font-bold [&_h2]:mt-16 [&_h2]:mb-8 [&_h2]:text-slate-900
                                [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:mt-12 [&_h3]:mb-6 [&_h3]:text-slate-900"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            suppressHydrationWarning
                        />
                    </div>

                    {/* Sidebar Stats/Trust */}
                    <div className="space-y-8 sticky top-32">
                        <div className="card-premium !bg-primary text-white !p-10">
                            <h3 className="text-2xl font-bold mb-6">Why Bootflare?</h3>
                            <ul className="space-y-4 text-primary-hover/90">
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span className="font-medium">Data-Driven Strategy</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span className="font-medium">User-Centric Design</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span className="font-medium">Performance Optimized</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                                    <span className="font-medium">Scalable Solutions</span>
                                </li>
                            </ul>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-6 bg-slate-50 rounded-[2rem] text-center border border-slate-100">
                                <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                                <p className="text-2xl font-black text-slate-900">2k+</p>
                                <p className="text-xs font-bold text-slate-400 uppercase">Clients</p>
                            </div>
                            <div className="p-6 bg-slate-50 rounded-[2rem] text-center border border-slate-100">
                                <Award className="w-8 h-8 text-primary mx-auto mb-4" />
                                <p className="text-2xl font-black text-slate-900">15+</p>
                                <p className="text-xs font-bold text-slate-400 uppercase">Awards</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
