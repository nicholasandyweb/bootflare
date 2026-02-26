export const revalidate = 86400; // 24 hours
import { fetchGraphQL } from '@/lib/graphql';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import WPPageContent from '@/components/WPPageContent';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRankMathSEO('https://bootflare.com/terms-of-use/');
  if (seo) return mapRankMathToMetadata(seo);
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
    const data: { page: WPPage } = await fetchGraphQL(QUERY);
    page = data.page;
  } catch (e) {
    console.error('Error fetching Terms of Use:', e);
  }

  if (!page) {
    throw new Error('Terms of Use page content not found');
  }

  return <WPPageContent title={page.title} content={page.content} badge="Legal" />;
}
