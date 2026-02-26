import { fetchRESTWithMeta } from '@/lib/rest';
import { fetchGraphQL } from '@/lib/graphql';
import { fetchRankMathSEO } from '@/lib/seo';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import LogoSearch from '@/components/LogoSearch';
import LogoCard from '@/components/LogoCard';
import CategoryList from '@/components/CategoryList';
import Pagination from '@/components/Pagination';
import { decodeEntities } from '@/lib/sanitize';

interface Logo {
    id: number;
    title: { rendered: string };
    slug: string;
    _embedded?: {
        'wp:featuredmedia'?: { source_url: string; alt_text?: string }[];
    };
}

interface LogosTemplateProps {
    page: number;
    /** e.g. "/logos" or "/free-brand-logos" */
    route: string;
    /** GraphQL page ID, e.g. "/logos/" */
    queryId: string;
    /** Full URL for RankMath SEO, e.g. "https://bootflare.com/logos/" */
    seoUrl: string;
    /** How many logos per page */
    perPage?: number;
}

const GET_LOGOS_QUERY = `
  query GetLogos($offset: Int, $size: Int) {
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
`;

const GET_PAGE_QUERY = (id: string) => `
  query GetPageMeta {
    page(id: "${id}", idType: URI) {
      title
      excerpt
    }
  }
`;

export default async function LogosTemplate({
    page,
    route,
    queryId,
    seoUrl,
    perPage = 12,
}: LogosTemplateProps) {
    let logos: any[] = [];
    let totalPages = 1;
    let wpPage: { title: string; excerpt?: string } | null = null;
    let seoData: any = null;

    const offset = (page - 1) * perPage;

    // HYBRID APPROACH:
    // 1. Use REST for the paginated list (because WPGraphQL lacks offsetPagination plugin)
    // 2. Use GraphQL for metadata (stable and fast)
    const [logosResult, pageResult, seoResult] = await Promise.allSettled([
        fetchRESTWithMeta(`logo?per_page=${perPage}&page=${page}&_embed&_fields=id,title,slug,_links,_embedded`),
        fetchGraphQL<{ page: any }>(GET_PAGE_QUERY(queryId)),
        fetchRankMathSEO(seoUrl),
    ]);

    if (logosResult.status === 'fulfilled' && logosResult.value?.data) {
        logos = Array.isArray(logosResult.value.data) ? logosResult.value.data : [];
        totalPages = logosResult.value.totalPages || 1;
    } else {
        console.error(`REST fetching failed for ${route}:`, logosResult.status === 'rejected' ? logosResult.reason : 'No data');
    }

    wpPage = pageResult.status === 'fulfilled' ? (pageResult.value?.page ?? null) : null;
    seoData = seoResult.status === 'fulfilled' ? seoResult.value : null;

    const description = seoData?.description
        ? decodeEntities(seoData.description)
        : wpPage?.excerpt
            ? decodeEntities(wpPage.excerpt.replace(/<[^>]*>/g, '').trim())
            : 'Your professional source for world-class brand identities. High-resolution PNG and SVG formats, curated for elite creators.';

    // Breadcrumb label: derive from route
    const breadcrumbLabel = wpPage?.title ?? route.replace('/', '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <h1 className="text-4xl md:text-[2.75rem] font-bold mb-6 text-slate-800">
                        {wpPage?.title
                            ? <span dangerouslySetInnerHTML={{ __html: wpPage.title }} />
                            : <>{breadcrumbLabel}</>}
                    </h1>

                    <div className="flex items-center justify-center gap-1.5 text-[15px] mb-8 text-slate-600">
                        <Link href="/" className="text-[#8b5cf6] hover:underline font-medium">Home</Link>
                        <span className="text-slate-400 text-xs mt-0.5">»</span>
                        <span className="text-slate-700">{breadcrumbLabel}</span>
                    </div>

                    <p
                        className="text-slate-600 text-[16px] mb-10 leading-relaxed font-light"
                        dangerouslySetInnerHTML={{ __html: description }}
                    />

                    <div className="max-w-xl mx-auto">
                        <LogoSearch />
                    </div>
                </div>
            </div>

            <div className="container px-6 py-16">
                <section className="mb-32">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-8">
                        {logos.map((logo) => (
                            <LogoCard key={logo.id} logo={logo} />
                        ))}
                    </div>

                    {logos.length > 0 && totalPages > 1 && (
                        <div className="mb-16">
                            <Pagination
                                currentPage={page}
                                totalPages={totalPages}
                                baseUrl={route}
                                usePathBased={true}
                            />
                        </div>
                    )}

                    <CategoryList />

                    {logos.length === 0 && (
                        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200">
                            <Sparkles className="w-12 h-12 text-primary/20 mx-auto mb-6 animate-pulse" />
                            <p className="text-slate-400 text-xl font-light">No logos found for this selection. Try adjusting your filter or search.</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
