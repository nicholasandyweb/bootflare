export const dynamic = 'force-dynamic';
import { fetchRESTWithMeta } from '@/lib/rest';
import Link from 'next/link';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import LogoSearch from '@/components/LogoSearch';
import LogoCard from '@/components/LogoCard';
import CategoryList from '@/components/CategoryList';
import Pagination from '@/components/Pagination';
import LogosTemplate from '@/components/LogosTemplate';

interface Logo {
  id: number;
  title: { rendered: string };
  slug: string;
  _embedded?: {
    'wp:featuredmedia'?: { source_url: string; alt_text?: string }[];
    'wp:term'?: { name: string; slug: string }[][];
  };
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ s?: string }> }): Promise<Metadata> {
  const params = await searchParams;
  const searchTerm = params.s || '';

  if (searchTerm) {
    return { title: `Search Results for "${searchTerm}" | Bootflare` };
  }

  const seo = await fetchRankMathSEO('https://bootflare.com/logo/');
  if (seo) return mapRankMathToMetadata(seo);
  return { title: 'Free Brand Logos | Bootflare' };
}

export default async function LogoArchive({ searchParams }: { searchParams: Promise<{ s?: string; page?: string }> }) {
  const params = await searchParams;
  const searchTerm = params.s || '';
  const page = parseInt(params.page || '1', 10);

  // No search: use shared LogosTemplate (path-based pagination)
  if (!searchTerm) {
    return (
      <LogosTemplate
        page={1}
        route="/logos"
        queryId="/logos/"
        seoUrl="https://bootflare.com/logo/"
        perPage={24}
      />
    );
  }

  // Search results view
  let logos: Logo[] = [];
  let totalPages = 1;

  try {
    const res = await fetchRESTWithMeta(
      `logo?search=${encodeURIComponent(searchTerm)}&per_page=24&page=${page}&_embed`
    );
    logos = Array.from(new Map(res.data.map((item: any) => [item.id, item])).values()) as Logo[];
    totalPages = res.totalPages;
  } catch (error) {
    console.error('Error fetching logos:', error);
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
        <div className="container max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800">
            Search Results for &quot;<span className="text-[#8b5cf6]">{searchTerm}</span>&quot;
          </h1>
          <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
            <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
            <span className="text-slate-400 text-xs mt-0.5">»</span>
            <Link href="/logos" className="text-[#8b5cf6] hover:underline font-medium">Logos</Link>
            <span className="text-slate-400 text-xs mt-0.5">»</span>
            <span className="text-slate-700">Search</span>
          </div>
          <p className="text-slate-600 text-[16px] mb-10 leading-relaxed font-light">
            Showing logos matching your search query.
          </p>
          <div className="max-w-xl mx-auto">
            <LogoSearch initialQuery={searchTerm} />
          </div>
        </div>
      </div>

      <div className="container px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6 md:gap-8">
          {logos.map((logo) => (
            <LogoCard key={logo.id} logo={logo} />
          ))}
        </div>

        {logos.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            baseUrl={`/logos?s=${encodeURIComponent(searchTerm)}`}
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
