export const revalidate = 86400; // 24 hours
import { fetchREST } from '@/lib/rest';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import WPPageContent from '@/components/WPPageContent';
import Link from 'next/link';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchRankMathSEO('https://bootflare.com/privacy-policy/');
    if (seo) return mapRankMathToMetadata(seo);
  } catch (e) {
    console.error('Metadata fetch failed for privacy-policy:', e);
  }
  return { title: 'Privacy Policy | Bootflare' };
}

interface RESTPage { title: { rendered: string }; content: { rendered: string }; }

export default async function PrivacyPolicyPage() {
  let page: RESTPage | null = null;
  try {
    const data = await fetchREST('pages?slug=privacy-policy&_fields=title,content');
    if (data && Array.isArray(data) && data.length > 0) {
      page = data[0];
    }
  } catch (e) {
    console.error('Error fetching Privacy Policy:', e);
  }

  if (!page) {
    return (
      <div className="container py-32 text-center min-h-screen">
        <h1 className="text-3xl font-bold mb-4 text-slate-800">Privacy Policy Temporarily Unavailable</h1>
        <p className="text-slate-600 mb-8 max-w-lg mx-auto">
          We are currently updating our policy content. Please check back shortly.
        </p>
        <Link href="/" className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-full hover:bg-primary-dark transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return <WPPageContent title={page.title.rendered} content={page.content.rendered} badge="Legal" />;
}
