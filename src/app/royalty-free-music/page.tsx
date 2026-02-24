import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Play, Music2, Headphones, Sparkles } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Royalty Free Music - Studio Quality Audio for Creators | Bootflare',
  description: 'Elevate your creative projects with studio-quality royalty free music. High-fidelity tracks for podcasts, videos, and presentations.',
  openGraph: {
    title: 'Royalty Free Music - Studio Quality Audio for Creators | Bootflare',
    description: 'Elevate your creative projects with studio-quality royalty free music.',
    type: 'website',
  }
};

interface Album {
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

export default async function MusicPage() {
  let albums: Album[] = [];
  try {
    albums = await fetchREST('sr_playlist?per_page=50&_embed');
  } catch (error) {
    console.error('Error fetching music:', error);
  }

  return (
    <div className="bg-slate-950 min-h-screen pt-32 pb-32 text-slate-200 overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-primary/10 rounded-full blur-[150px] -z-0" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/10 rounded-full blur-[150px] -z-0" />

      <div className="container relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-800 text-primary font-bold text-xs mb-6 uppercase tracking-widest">
            <Sparkles className="w-3 h-3" /> Digital Audio
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-8">Royalty Free <span className="text-gradient">Music</span></h1>
          <p className="text-lg text-slate-400 font-light leading-relaxed">
            Elevate your creative projects with studio-quality audio. High-fidelity tracks for creators who demand excellence.
          </p>
        </div>

        {/* Music Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
          {albums.map((album) => {
            const featuredImage = album._embedded?.['wp:featuredmedia']?.[0]?.source_url;

            return (
              <div key={album.id} className="group flex flex-col gap-4">
                <Link
                  href={`/royalty-free-music/${album.slug}`}
                  className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl group"
                >
                  <img
                    src={featuredImage || "https://via.placeholder.com/400"}
                    alt={album.title.rendered}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 brightness-90 group-hover:brightness-100"
                  />

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-white text-slate-950 flex items-center justify-center scale-75 group-hover:scale-100 transition-transform duration-500 shadow-2xl shadow-white/20">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  </div>
                </Link>

                <div className="px-2">
                  <h3 className="text-lg font-bold text-white line-clamp-1 group-hover:text-primary transition-colors">
                    {album.title.rendered}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Headphones className="w-3 h-3 text-slate-500" />
                    <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">High Fidelity</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {albums.length === 0 && (
          <div className="text-center py-32 bg-slate-900/50 rounded-[3rem] border border-slate-800">
            <Music2 className="w-16 h-16 text-slate-700 mx-auto mb-6" />
            <p className="text-slate-500 text-xl font-light">No music found. Check back soon for new releases.</p>
          </div>
        )}
      </div>
    </div>
  );
}
