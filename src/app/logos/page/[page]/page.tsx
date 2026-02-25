export const revalidate = 3600;
import LogosTemplate from '@/components/LogosTemplate';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRankMathSEO('https://bootflare.com/logos/');
  if (seo) return mapRankMathToMetadata(seo);
  return { title: 'Free Brand Logos | Bootflare' };
}

export default async function LogosPaginated({ params }: { params: Promise<{ page: string }> }) {
  const { page: pageStr } = await params;
  const page = parseInt(pageStr, 10);

  return (
    <LogosTemplate
      page={page}
      route="/logos"
      queryId="/logos/"
      seoUrl="https://bootflare.com/logo/"
    />
  );
}
