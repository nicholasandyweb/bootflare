export const revalidate = 3600; // 1 hour
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


import { fetchGraphQL } from '@/lib/graphql';

const GET_HOME_DATA = `
  query GetHomeData {
    logos(first: 20) {
      nodes {
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
    music: srPlaylists(first: 10) {
      nodes {
        featuredImage {
          node {
            sourceUrl
          }
        }
      }
    }
  }
`;

interface HomeData {
  logos: { nodes: { featuredImage?: { node: { sourceUrl: string } } }[] };
  music: { nodes: { featuredImage?: { node: { sourceUrl: string } } }[] };
}

export default async function Home() {
  let logoImages: string[] = [];
  let musicImages: string[] = [];

  try {
    const data = await fetchGraphQL<HomeData>(GET_HOME_DATA);

    if (data) {
      if (data.logos?.nodes) {
        logoImages = data.logos.nodes
          .map(node => node.featuredImage?.node?.sourceUrl)
          .filter((url): url is string => !!url);
      }

      if (data.music?.nodes) {
        musicImages = data.music.nodes
          .map(node => node.featuredImage?.node?.sourceUrl)
          .filter((url): url is string => !!url);
      }
    }
  } catch (error) {
    console.error('Error fetching homepage data:', error);
  }



  return <HomeClient logos={logoImages} music={musicImages} />;
}
