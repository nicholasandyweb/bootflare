export const revalidate = 86400; // 24 hours
import { fetchGraphQL } from '@/lib/graphql';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import WPPageContent from '@/components/WPPageContent';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchRankMathSEO('https://bootflare.com/dmca-policy/');
    if (seo) return mapRankMathToMetadata(seo);
  } catch (e) {
    console.error('Metadata fetch failed for dmca-policy:', e);
  }
  return { title: 'DMCA Policy | Bootflare' };
}

const QUERY = `
  query {
    page(id: "/dmca-policy/", idType: URI) {
      title
      content
    }
  }
`;

interface WPPage { title: string; content: string; }

export default async function DMCAPolicyPage() {
  let page: WPPage | null = null;
  try {
    const data: { page: WPPage } = await fetchGraphQL(QUERY);
    page = data.page;
  } catch (e) {
    console.error('Error fetching DMCA Policy:', e);
  }

  if (!page) {
    return (
      <div className="bg-slate-50 min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="container text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Legal Content Unavailable</h2>
          <p className="text-slate-500 text-lg font-light mb-8 max-w-md mx-auto">
            Our legal documents are temporarily undergoing maintenance. Please try again shortly.
          </p>
          <Link href="/" className="btn-premium">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return <WPPageContent title={page.title} content={page.content} badge="Legal" />;
}
