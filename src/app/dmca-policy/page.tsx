export const revalidate = 3600;
import { fetchGraphQL } from '@/lib/graphql';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import WPPageContent from '@/components/WPPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRankMathSEO('https://bootflare.com/dmca-policy/');
  if (seo) return mapRankMathToMetadata(seo);
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
    return <WPPageContent title="DMCA Policy" content="<p>Content unavailable. Please try again later.</p>" badge="Legal" />;
  }

  return <WPPageContent title={page.title} content={page.content} badge="Legal" />;
}
