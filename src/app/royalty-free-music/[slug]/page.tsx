import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { ChevronLeft, Play, Music, Headphones, Share2, Sparkles, Clock, Calendar } from 'lucide-react';
import { stripScripts } from '@/lib/sanitize';

interface Album {
    id: number;
    title: {
        rendered: string;
    };
    content: {
        rendered: string;
    };
    date: string;
    slug: string;
    _embedded?: {
        'wp:featuredmedia'?: {
            source_url: string;
        }[];
        'wp:term'?: {
            name: string;
            slug: string;
        }[][];
    };
}

export async function generateStaticParams() {
    try {
        const albums: Album[] = await fetchREST('sr_playlist?per_page=100');
        return albums.map((album) => ({
            slug: album.slug,
        }));
    } catch (error) {
        console.error('Error generating static params for music:', error);
        return [];
    }
}

export default async function SingleMusic({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    let album: Album | null = null;

    try {
        const albums = await fetchREST(`sr_playlist?slug=${slug}&_embed`);
        if (albums.length > 0) {
            album = albums[0];
        }
    } catch (error) {
        console.error('Error fetching music album:', error);
    }

    if (!album) {
        return (
            <div className="bg-slate-950 min-h-screen pt-32 text-center text-slate-500">
                <Music className="w-16 h-16 mx-auto mb-6 text-slate-800" />
                <h1 className="text-2xl mb-4 text-white">Album not found</h1>
                <Link href="/royalty-free-music" className="text-primary font-bold flex items-center justify-center gap-2 hover:text-white transition-colors">
                    <ChevronLeft className="w-4 h-4" /> Back to Library
                </Link>
            </div>
        );
    }

    const featuredImage = album._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const categories = album._embedded?.['wp:term']?.[0] || [];
    const sanitizedContent = stripScripts(album.content.rendered);

    return (
        <div className="bg-slate-950 min-h-screen pt-32 pb-32 text-slate-200 relative overflow-hidden" suppressHydrationWarning>
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/20 rounded-full blur-[180px] -z-0" />
            <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-secondary/10 rounded-full blur-[150px] -z-0" />

            <div className="container relative z-10 px-6">
                <Link href="/royalty-free-music" className="text-slate-500 hover:text-primary mb-12 inline-flex items-center gap-2 transition-all font-bold group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Gallery
                </Link>

                <div className="flex flex-col xl:flex-row gap-16 items-center xl:items-start mb-32">
                    {/* Immersive Album Art */}
                    <div className="w-full md:w-[500px] shrink-0">
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border-8 border-slate-900 group">
                            <img
                                src={featuredImage || "https://via.placeholder.com/600"}
                                alt={album.title.rendered}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-60" />

                            {/* Floating UI Elements */}
                            <div className="absolute bottom-10 left-10 p-4 glass rounded-2xl flex items-center gap-4 scale-90 md:scale-100">
                                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="pr-4">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Quality</p>
                                    <p className="font-bold text-white uppercase tracking-tighter">Hi-Res Audio</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Meta & Actions */}
                    <div className="flex-1 text-center xl:text-left">
                        <div className="flex flex-wrap justify-center xl:justify-start gap-3 mb-8">
                            {categories.map((cat) => (
                                <span key={cat.slug} className="text-[10px] bg-slate-900 border border-slate-800 text-primary px-4 py-1.5 rounded-full font-bold uppercase tracking-[0.2em]">
                                    {cat.name}
                                </span>
                            ))}
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-10 leading-[0.9] text-white tracking-tighter">
                            {album.title.rendered}
                        </h1>

                        <div className="flex flex-wrap justify-center xl:justify-start items-center gap-8 mb-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
                            <div className="flex items-center gap-2">
                                <Headphones className="w-4 h-4 text-primary" />
                                <span>Mastered for Creators</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>Multi-Track Album</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(album.date).getFullYear()} Edition</span>
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-5 justify-center xl:justify-start">
                            <button className="px-10 py-5 bg-white text-slate-950 rounded-[1.5rem] font-black flex items-center justify-center gap-3 hover:bg-primary hover:text-white transition-all shadow-2xl shadow-white/5 active:scale-95">
                                <Play className="w-6 h-6 fill-current" /> Download Full Kit
                            </button>
                            <button className="px-10 py-5 bg-slate-900 border border-slate-800 text-white rounded-[1.5rem] font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                                <Share2 className="w-5 h-5" /> Share Media
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content / Player Container */}
                <div className="relative group/player">
                    <div className="absolute inset-0 bg-primary/10 blur-[100px] opacity-0 group-hover/player:opacity-100 transition-opacity duration-1000" />
                    <div className="relative bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] p-8 md:p-16 border border-slate-800/50 shadow-2xl overflow-hidden">
                        <h2 className="text-3xl font-black mb-12 text-white flex items-center gap-4">
                            <div className="w-2 h-8 bg-primary rounded-full" />
                            Content Breakdown
                        </h2>

                        <div
                            className="prose prose-invert prose-2xl max-w-none text-slate-300 music-player-container font-light leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                            suppressHydrationWarning
                        />

                        {/* Interactive Sparkle Elements */}
                        <div className="mt-16 flex flex-wrap gap-10 border-t border-slate-800/50 pt-16">
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">License Type</h4>
                                <p className="text-white font-bold text-lg">Royalty Free Commercial</p>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">Formats Included</h4>
                                <p className="text-white font-bold text-lg">WAV, MP3, STEMS</p>
                            </div>
                            <div className="flex-1 min-w-[200px]">
                                <h4 className="text-xs font-bold text-primary uppercase tracking-widest mb-4">BPM / Key</h4>
                                <p className="text-white font-bold text-lg">Studio Mastered</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
