import { fetchREST } from '@/lib/rest';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Brand Logos - High Quality PNG Download | Bootflare',
  description: 'Download high-quality transparent PNG brand logos for your creative projects. Extensive collection of professional logos for developers and designers.',
  openGraph: {
    title: 'Free Brand Logos - High Quality PNG Download | Bootflare',
    description: 'Download high-quality transparent PNG brand logos for your creative projects.',
    type: 'website',
  }
};

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
    'wp:term'?: {
      name: string;
      slug: string;
    }[][];
  };
}

export default async function LogoArchive() {
  let logos: Logo[] = [];
  try {
    logos = await fetchREST('logo?per_page=100&_embed');
  } catch (error) {
    console.error('Error fetching logos:', error);
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Free Brand <span className="text-gradient">Logos</span></h1>
          <p className="text-lg text-slate-500 font-light leading-relaxed">
            Unlock professional brand identities with our extensive collection of high-resolution logos. Perfect for creators, developers, and designers.
          </p>
        </div>

        {/* Filter Bar (UI Placeholder) */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search logos..."
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all text-slate-700 shadow-sm"
            />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 rounded-2xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          {logos.map((logo) => {
            const featuredImage = logo._embedded?.['wp:featuredmedia']?.[0]?.source_url;
            const categories = logo._embedded?.['wp:term']?.[0] || [];

            return (
              <div key={logo.id} className="group relative">
                <Link
                  href={`/logo/${logo.slug}`}
                  className="card-premium !p-0 aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden bg-white hover:!border-primary/20"
                >
                  <div className="flex-1 w-full flex items-center justify-center p-8">
                    <img
                      src={featuredImage || "https://via.placeholder.com/300"}
                      alt={logo.title.rendered}
                      className="max-w-[80%] max-h-[80%] object-contain filter group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>

                  <div className="w-full py-5 px-4 bg-white border-t border-slate-100 transition-colors">
                    <h3 className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors text-center">
                      {logo.title.rendered}
                    </h3>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>

        {logos.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 text-xl font-light">No logos found. Try adjusting your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
