export const revalidate = 86400; // 24 hours
import { fetchGraphQL } from '@/lib/graphql';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import WPPageContent from '@/components/WPPageContent';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchRankMathSEO('https://bootflare.com/terms-of-use/');
    if (seo) return mapRankMathToMetadata(seo);
  } catch (e) {
    console.error('Metadata fetch failed for terms-of-use:', e);
  }
  return { title: 'Terms of Use | Bootflare' };
}

const QUERY = `
  query {
    page(id: "/terms-of-use/", idType: URI) {
      title
      content
    }
  }
`;

interface WPPage { title: string; content: string; }

export default async function TermsOfUsePage() {
  let page: WPPage | null = null;
  try {
    const data: { page?: WPPage } | null = await fetchGraphQL(QUERY);
    if (data && data.page) {
      page = data.page;
    }
  } catch (e) {
    console.error('Error fetching Terms of Use:', e);
  }

  if (!page) {
    return (
      <div className="container py-32 text-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-slate-800">Terms of Use Temporarily Unavailable</h1>
        <p className="text-slate-600 mb-8 max-w-lg mx-auto">
          We are currently updating our terms. Please check back shortly.
        </p>
        <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return <WPPageContent title={page.title} content={page.content} badge="Legal" />;
}
