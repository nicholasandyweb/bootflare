export const dynamic = 'force-dynamic';
export const revalidate = 3600;
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

  // Fallback if data is empty for some reason
  if (logoImages.length === 0) {
    logoImages = [
      "https://bootflare.com/wp-content/uploads/2025/07/Baker-McKenzie-Logo-scaled.png",
      "https://bootflare.com/wp-content/uploads/2023/02/Airtable-Logo.png",
      "https://bootflare.com/wp-content/uploads/2024/09/Amazon-Appstore-Logo.png"
    ];
  }

  if (musicImages.length === 0) {
    musicImages = [
      "https://bootflare.com/wp-content/uploads/2025/08/Dramatic-Music.png",
      "https://bootflare.com/wp-content/uploads/2025/08/Action-Music.png"
    ];
  }

  return <HomeClient logos={logoImages} music={musicImages} />;
}
