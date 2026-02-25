export const revalidate = 3600;
import { fetchREST, fetchRESTWithMeta } from '@/lib/rest';
import Link from 'next/link';
import { Search, Filter } from 'lucide-react';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import LogoSearch from '@/components/LogoSearch';
import LogoCard from '@/components/LogoCard';
import CategoryList from '@/components/CategoryList';
import Pagination from '@/components/Pagination';


export async function generateMetadata({ searchParams }: { searchParams: Promise<{ s?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const searchTerm = params.s || '';

  if (searchTerm) {
    return { title: `Search Results for "${searchTerm}" | Bootflare` };
  }

  const seo = await fetchRankMathSEO('https://bootflare.com/logos/');
  if (seo) return mapRankMathToMetadata(seo);
  return { title: 'Free Brand Logos | Bootflare' };
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
      alt_text?: string;
    }[];
    'wp:term'?: {
      name: string;
      slug: string;
    }[][];
  };
}

export default async function LogoArchive({ searchParams }: { searchParams: Promise<{ s?: string, page?: string }> }) {
  const params = await searchParams;
  const searchTerm = params.s || '';
  const page = parseInt(params.page || '1', 10);

  let logos: Logo[] = [];
  let totalPages = 1;
  try {
    const endpoint = searchTerm
      ? `logo?search=${encodeURIComponent(searchTerm)}&per_page=24&page=${page}&_embed`
      : `logo?per_page=24&page=${page}&_embed`;
    const res = await fetchRESTWithMeta(endpoint);
    // Deduplicate by ID
    logos = Array.from(new Map(res.data.map((item: any) => [item.id, item])).values()) as Logo[];
    totalPages = res.totalPages;
  } catch (error) {
    console.error('Error fetching logos:', error);
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-32 pb-20">
      <div className="container">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          {searchTerm ? (
            <>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
                Search Results for &quot;<span className="text-gradient">{searchTerm}</span>&quot;
              </h1>
              <p className="text-lg text-slate-500 font-light">
                Showing logos matching your search query.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">Free Brand <span className="text-gradient">Logos</span></h1>
              <p className="text-lg text-slate-500 font-light leading-relaxed">
                Unlock professional brand identities with our extensive collection of high-resolution logos. Perfect for creators, developers, and designers.
              </p>
            </>
          )}
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <LogoSearch initialQuery={searchTerm} />
        </div>


        {/* Logos Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8">
          {logos.map((logo) => (
            <LogoCard key={logo.id} logo={logo} />
          ))}
        </div>

        {logos.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={searchTerm ? `/logos?s=${encodeURIComponent(searchTerm)}` : '/logos'}
          />
        )}

        {logos.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
            <p className="text-slate-400 text-xl font-light">No logos found. Try adjusting your search.</p>
          </div>
        )}

        <CategoryList />
      </div>
    </div>
  );
}
