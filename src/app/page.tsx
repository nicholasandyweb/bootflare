export const dynamic = 'force-dynamic';
import HomeClient from '@/components/HomeClient';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  try {
    const seo = await fetchRankMathSEO('https://bootflare.com/');
    if (seo) return mapRankMathToMetadata(seo);
  } catch (e) {
    console.error('Metadata fetch failed for page:', e);
  }
  return {};
}


import { fetchREST } from '@/lib/rest';

export default async function Home() {
  let logoImages: string[] = [];
  let musicImages: string[] = [];

  try {
    const [logosData, musicData] = await Promise.all([
      fetchREST('logo?per_page=20&_fields=id,_links,_embedded', 2),
      fetchREST('sr_playlist?per_page=10&_fields=id,_links,_embedded', 2)
    ]);

    if (logosData && Array.isArray(logosData)) {
      logoImages = logosData
        .map((item: any) => item._embedded?.['wp:featuredmedia']?.[0]?.source_url)
        .filter((url): url is string => !!url);
    }

    if (musicData && Array.isArray(musicData)) {
      musicImages = musicData
        .map((item: any) => item._embedded?.['wp:featuredmedia']?.[0]?.source_url)
        .filter((url): url is string => !!url);
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  return <HomeClient logos={logoImages} music={musicImages} />;
}
