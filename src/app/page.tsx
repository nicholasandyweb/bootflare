export const revalidate = 3600; // 1 hour
import { fetchREST } from '@/lib/rest';
import HomeClient from '@/components/HomeClient';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const seo = await fetchRankMathSEO('https://bootflare.com/');
  if (seo) return mapRankMathToMetadata(seo);
  return {};
}


export default async function Home() {
  let logoImages: string[] = [];
  let musicImages: string[] = [];

  try {
    const [logos, music] = await Promise.all([
      fetchREST('logo?per_page=3&_fields=id,_links&_embed=wp:featuredmedia'),
      fetchREST('sr_playlist?per_page=3&_fields=id,_links&_embed=wp:featuredmedia')
    ]);

    logoImages = logos.map((item: { _embedded?: { 'wp:featuredmedia'?: { source_url: string }[] } }) =>
      item._embedded?.['wp:featuredmedia']?.[0]?.source_url
    ).filter((url: string | undefined): url is string => !!url);

    musicImages = music.map((item: { _embedded?: { 'wp:featuredmedia'?: { source_url: string }[] } }) =>
      item._embedded?.['wp:featuredmedia']?.[0]?.source_url
    ).filter((url: string | undefined): url is string => !!url);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }



  return <HomeClient logos={logoImages} music={musicImages} />;
}
