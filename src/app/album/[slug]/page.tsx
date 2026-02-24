import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { ChevronLeft, Play, Music, Headphones, Share2, Sparkles, Clock, Calendar, Download } from 'lucide-react';
import { stripScripts, decodeEntities } from '@/lib/sanitize';
import MusicPlayer from '@/components/MusicPlayer';
import Pagination from '@/components/Pagination';
import FileInfoCard from '@/components/FileInfoCard';

export const runtime = 'edge';
export const dynamicParams = true;

interface Track {
    id: number;
    mp3: string;
    track_title: string;
    track_artist: string;
    length: string;
    poster: string;
}

interface PlaylistData {
    tracks: Track[];
}

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
    description?: string;
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
    return [];
}

export default async function SingleMusic({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams: Promise<{ page?: string }> }) {
    const { slug } = await params;
    const { page } = await searchParams;
    const currentPage = parseInt(page || '1', 10);
    const perPage = 10;

    let album: Album | null = null;
    let allTracks: Track[] = [];

    try {
        const albums = await fetchREST(`sr_playlist?slug=${slug}&_embed`);
        if (albums.length > 0) {
            const fetchedAlbum = albums[0];
            album = fetchedAlbum;
            const trackData = await fetchREST(`https://bootflare.com/?load=playlist.json&albums=${fetchedAlbum.id}`);
            allTracks = trackData.tracks || [];
        }
    } catch (error) {
        console.error('Error fetching music album:', error);
    }

    if (!album) {
        return (
            <div className="bg-slate-50 min-h-screen pt-32 text-center text-slate-500">
                <Music className="w-16 h-16 mx-auto mb-6 text-slate-200" />
                <h1 className="text-2xl mb-4 text-slate-800 font-bold">Album not found</h1>
                <Link href="/royalty-free-music" className="text-primary font-bold flex items-center justify-center gap-2 hover:underline">
                    <ChevronLeft className="w-4 h-4" /> Back to Library
                </Link>
            </div>
        );
    }

    const totalPages = Math.ceil(allTracks.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const paginatedTracks = allTracks.slice(startIndex, startIndex + perPage);

    const featuredImage = album._embedded?.['wp:featuredmedia']?.[0]?.source_url;
    const categories = album._embedded?.['wp:term']?.[0] || [];

    // Clean up content: extract only the description text, ignore the plugin HTML structures
    const rawContent = album.content.rendered.split('<div')[0].replace(/<[^>]*>/g, '').trim();
    const contentText = decodeEntities(rawContent);

    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-6xl mx-auto">
                    <Link href="/royalty-free-music" className="text-slate-500 hover:text-primary mb-8 inline-flex items-center gap-2 transition-all font-bold group">
                        <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Music Library
                    </Link>

                    <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start text-center lg:text-left mt-8">
                        {/* Album Artwork */}
                        <div className="w-full max-w-[400px] shrink-0">
                            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(252,231,243,0.8)] border-8 border-white group">
                                <img
                                    src={featuredImage || "https://via.placeholder.com/600"}
                                    alt={album.title.rendered}
                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-transparent to-transparent opacity-60" />
                            </div>
                        </div>

                        {/* Meta & Actions */}
                        <div className="flex-1">
                            <div className="flex flex-wrap justify-center lg:justify-start gap-2 mb-6 uppercase tracking-widest font-bold text-[10px] text-primary">
                                {categories.map((cat) => (
                                    <span key={cat.slug} className="bg-white px-4 py-1.5 rounded-full border border-pink-100 shadow-sm">
                                        {cat.name}
                                    </span>
                                ))}
                            </div>

                            <h1 className="text-4xl md:text-6xl font-black mb-6 text-slate-800 leading-tight">
                                {album.title.rendered}
                            </h1>

                            <p className="text-slate-600 text-lg mb-10 leading-relaxed font-light max-w-2xl mx-auto lg:mx-0">
                                {contentText || 'Download studio-quality royalty free tracks for your creative projects.'}
                            </p>

                            <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 mb-12 text-slate-400 font-bold text-xs uppercase tracking-widest">
                                <div className="flex items-center gap-2">
                                    <Headphones className="w-4 h-4 text-primary" />
                                    <span>Mastered Tech</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{allTracks.length} Premium Tracks</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    <span>{new Date(album.date).getFullYear()} Release</span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <button className="px-8 py-4 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary-dark transition-all shadow-xl shadow-primary/20 hover:-translate-y-1 active:scale-95">
                                    <Sparkles className="w-5 h-5" /> Download Full Album
                                </button>
                                <button className="px-8 py-4 bg-white border border-pink-100 text-slate-700 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-md">
                                    <Share2 className="w-5 h-5" /> Share Gallery
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content & Player */}
            <div className="container max-w-6xl mx-auto px-6 py-20">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Tracklist Column */}
                    <div className="lg:col-span-2">
                        <div className="mb-10 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-primary rounded-full" />
                                Album Playlist
                            </h2>
                            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">{allTracks.length} MP3 Files</span>
                        </div>

                        <MusicPlayer tracks={paginatedTracks} allTracks={allTracks} albumTitle={album.title.rendered} />

                        {totalPages > 1 && (
                            <div className="mt-12">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    baseUrl={`/album/${slug}`}
                                />
                            </div>
                        )}
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-12">
                        {/* License Card */}
                        <div className="bg-white border border-pink-100 rounded-[2.5rem] p-8 shadow-sm">
                            <h3 className="text-lg font-bold text-slate-800 mb-6 font-primary">Asset License</h3>
                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>Royalty Free Usage</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>Commercial Rights Included</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>No Attribution Required</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span>Broadcast Quality Audio</span>
                                </li>
                            </ul>
                        </div>

                        <FileInfoCard initialTrack={paginatedTracks[0]} />
                    </div>
                </div>

                {/* DMCA Compliance */}
                <div className="mt-32">
                    <div className="mt-16 bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-600 text-[15px] leading-relaxed mx-auto w-full">
                        <span className="font-bold text-slate-800">Bootflare is DMCA compliant.</span> If your copyrighted work has been posted on bootflare.com, please <Link href="/dmca-policy" className="text-[#8b5cf6] hover:underline font-medium">request takedown</Link> or contact us via{' '}
                        <br className="hidden md:inline" />
                        <a href="mailto:dmca@bootflare.com" className="text-[#8b5cf6] hover:underline font-medium">dmca@bootflare.com</a> for immediate removal.
                    </div>
                </div>
            </div>
        </div>
    );
}
