export const revalidate = 3600;
import { fetchREST, fetchRESTWithMeta } from '@/lib/rest';
import Link from 'next/link';
import LogoCard from '@/components/LogoCard';
import Pagination from '@/components/Pagination';
import LogoSearch from '@/components/LogoSearch';
import CategoryList from '@/components/CategoryList';



import { fetchGraphQL } from '@/lib/graphql';
import { Suspense } from 'react';
import CategoryListSkeleton from '@/components/CategoryListSkeleton';
import { Metadata } from 'next';

const GET_CATEGORY_DATA = `
  query GetLogoCategoryWithLogos($slug: ID!, $offset: Int, $size: Int) {
    logoCategory(id: $slug, idType: SLUG) {
      databaseId
      name
      description
    }
    logos(where: { 
      offsetPagination: { offset: $offset, size: $size },
      taxQuery: {
        taxArray: [
          {
            taxonomy: LOGOCATEGORY,
            field: SLUG,
            terms: [$slug]
          }
        ]
      }
    }) {
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
`;

interface CategoryData {
    logoCategory: {
        databaseId: number;
        name: string;
        description?: string;
    } | null;
    logos: {
        nodes: any[];
        pageInfo: { offsetPagination: { total: number } };
    };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const displayName = slug.charAt(0).toUpperCase() + slug.slice(1);
    return {
        title: `${displayName} Logos | Download Free ${displayName} Brand Logos | Bootflare`,
        description: `Download high-quality free brand logos for ${displayName}. Browse our extensive collection of ${displayName} logos in various formats.`
    };
}

export default async function LogoCategory({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = 1;
    const perPage = 16;

    let logos: any[] = [];
    let categoryName = slug;
    let categoryDescription = '';
    let totalPages = 1;

    try {
        const offset = (page - 1) * perPage;
        const data = await fetchGraphQL<CategoryData>(GET_CATEGORY_DATA, { slug, offset, size: perPage });

        if (data && data.logoCategory && data.logos) {
            const cat = data.logoCategory;
            const logoData = data.logos;
            categoryName = cat.name;
            categoryDescription = cat.description || '';
            logos = logoData.nodes.map(node => ({
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
            totalPages = Math.ceil(logoData.pageInfo.offsetPagination.total / perPage);
        } else {
            throw new Error('GraphQL returned no data for category or logos');
        }
    } catch (error) {
        console.warn('GraphQL failed for LogoCategory, falling back to REST:', error);
        try {
            const categories = await fetchREST(`logos?slug=${slug}&_fields=id,name,description`);
            if (categories.length > 0) {
                const catId = categories[0].id;
                categoryName = categories[0].name;
                categoryDescription = categories[0].description || '';
                const res = await fetchRESTWithMeta(`logo?logos=${catId}&per_page=${perPage}&page=${page}&_embed&_fields=id,title,slug,_links,_embedded`);
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
                        {categoryName} Logos
                    </h1>

                    <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <Link href="/logo-categories" className="text-[#8b5cf6] hover:underline font-medium">Logo Categories</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700">{categoryName}</span>
                    </div>

                    {categoryDescription && (
                        <p
                            className="text-slate-600 text-[16px] mb-10 leading-relaxed font-light"
                            dangerouslySetInnerHTML={{ __html: categoryDescription }}
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
                        baseUrl={`/logos/${slug}`}
                        usePathBased={true}
                    />
                )}

                {logos.length === 0 && (
                    <div className="py-20 text-center text-gray-500">
                        No logos found in this category.
                    </div>
                )}

                <Suspense fallback={<CategoryListSkeleton />}>
                    <CategoryList />
                </Suspense>
            </div>
        </div>
    );
}
