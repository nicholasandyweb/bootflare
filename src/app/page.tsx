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
    // Two-pass fetch: get IDs first (fast, no _embed joins), then batch-fetch media.
    // _embed on these uncached endpoints takes 20s+ on cold WP — exceeds the 15s timeout.
    const [logosRaw, musicRaw] = await Promise.all([
      fetchREST('logo?per_page=20&_fields=id,featured_media', 2),
      fetchREST('sr_playlist?per_page=10&_fields=id,featured_media', 2),
    ]);

    const logoMediaIds = (logosRaw || []).map((l: any) => l.featured_media).filter(Boolean);
    const musicMediaIds = (musicRaw || []).map((m: any) => m.featured_media).filter(Boolean);
    const allMediaIds = [...logoMediaIds, ...musicMediaIds];

    const mediaList = allMediaIds.length
      ? await fetchREST(`media?include=${allMediaIds.join(',')}&_fields=id,source_url&per_page=30`, 1)
      : [];
    const mediaMap = new Map((mediaList || []).map((m: any) => [m.id, m.source_url as string]));

    logoImages = logoMediaIds.map((id: number) => mediaMap.get(id)).filter((u: string | undefined): u is string => !!u);
    musicImages = musicMediaIds.map((id: number) => mediaMap.get(id)).filter((u: string | undefined): u is string => !!u);
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }

  return <HomeClient logos={logoImages} music={musicImages} />;
}
