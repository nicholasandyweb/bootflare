export const revalidate = 3600; // 1 hour
import { fetchREST, fetchRESTWithMeta } from '@/lib/rest';
import Link from 'next/link';
import LogoCard from '@/components/LogoCard';
import Pagination from '@/components/Pagination';
import LogoSearch from '@/components/LogoSearch';

export const dynamicParams = true;
export const dynamic = 'force-dynamic';

import { fetchGraphQL } from '@/lib/graphql';

const GET_COLLECTION_DATA = `
  query GetLogoCollectionWithLogos($slug: ID!, $offset: Int, $size: Int) {
    logoCollection(id: $slug, idType: SLUG) {
      databaseId
      name
      description
      logos(where: { offsetPagination: { offset: $offset, size: $size } }) {
        pageInfo {
          offsetPagination {
            total
          }
        }
        nodes {
          databaseId
          title
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  }
`;

interface CollectionData {
    logoCollection: {
        databaseId: number;
        name: string;
        description?: string;
        logos: {
            nodes: any[];
            pageInfo: { offsetPagination: { total: number } };
        };
    } | null;
}

export default async function LogoCollectionPaginated({ params }: { params: Promise<{ slug: string, pageSlug: string }> }) {
    const { slug, pageSlug } = await params;
    const page = parseInt(pageSlug || '1', 10);
    const perPage = 12;

    let logos: any[] = [];
    let collectionName = slug;
    let collectionDescription = '';
    let totalPages = 1;

    try {
        const offset = (page - 1) * perPage;
        const data: { logoCollection?: CollectionData['logoCollection'] } | null = await fetchGraphQL(GET_COLLECTION_DATA, { slug, offset, size: perPage });

        if (data && data.logoCollection) {
            const col = data.logoCollection;
            collectionName = col.name;
            collectionDescription = col.description || '';
            logos = col.logos.nodes.map(node => ({
                id: node.databaseId,
                title: { rendered: node.title },
                slug: node.slug,
                _embedded: {
                    'wp:featuredmedia': node.featuredImage ? [{
                        source_url: node.featuredImage.node.sourceUrl,
                        alt_text: node.featuredImage.node.altText
                    }] : []
                }
            }));
            totalPages = Math.ceil(col.logos.pageInfo.offsetPagination.total / perPage);
        }
    } catch (error) {
        console.warn('GraphQL failed for LogoCollectionPaginated, falling back to REST:', error);
        try {
            const collections = await fetchREST(`logo-collection?slug=${slug}&_fields=id,name,description`);
            if (collections.length > 0) {
                const colId = collections[0].id;
                collectionName = collections[0].name;
                collectionDescription = collections[0].description || '';
                const res = await fetchRESTWithMeta(`logo?logo-collection=${colId}&per_page=${perPage}&page=${page}&_embed&_fields=id,title,slug,_links,_embedded`);
                logos = res.data;
                totalPages = res.totalPages;
            }
        } catch (e) {
            console.error('Final REST fallback failed:', e);
        }
    }

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800">
                        {collectionName} Logos
                    </h1>

                    <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <Link href="/logo-collections" className="text-[#8b5cf6] hover:underline font-medium">Logo Collections</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700">{collectionName}</span>
                    </div>

                    {collectionDescription && (
                        <p
                            className="text-slate-600 text-[16px] mb-10 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{ __html: collectionDescription }}
                        />
                    )}

                    <div className="max-w-xl mx-auto">
                        <LogoSearch />
                    </div>
                </div>
            </div>

            <div className="container py-16 px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-6">
                    {logos.map((logo) => (
                        <LogoCard key={logo.id} logo={logo} />
                    ))}
                </div>

                {logos.length > 0 && totalPages > 1 && (
                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        baseUrl={`/logo-collections/${slug}`}
                        usePathBased={true}
                    />
                )}

                {logos.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        No logos found in this collection.
                    </div>
                )}
            </div>
        </div>
    );
}
