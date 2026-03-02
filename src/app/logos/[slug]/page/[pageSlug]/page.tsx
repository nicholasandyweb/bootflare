export const dynamic = 'force-dynamic';
import { fetchREST, fetchRESTWithMeta } from '@/lib/rest';
import Link from 'next/link';
import LogoCard from '@/components/LogoCard';
import Pagination from '@/components/Pagination';
import LogoSearch from '@/components/LogoSearch';
import CategoryList from '@/components/CategoryList';





export default async function LogoCategoryPaginated({ params }: { params: Promise<{ slug: string, pageSlug: string }> }) {
    const { slug, pageSlug } = await params;
    const page = parseInt(pageSlug || '1', 10);
    const perPage = 16;

    let logos: any[] = [];
    let categoryName = slug;
    let categoryDescription = '';
    let totalPages = 1;

    try {
        const categories = await fetchREST(`logos?slug=${slug}&_fields=id,name,description`);
        if (categories && Array.isArray(categories) && categories.length > 0) {
            const cat = categories[0];
            categoryName = cat.name;
            categoryDescription = cat.description || '';

            // Two-pass fetch: posts without _embed (fast), then batch media
            const res = await fetchRESTWithMeta(`logo?logos=${cat.id}&per_page=${perPage}&page=${page}&_fields=id,title,slug,featured_media`);
            if (res && res.data) {
                const rawLogos = res.data;
                totalPages = res.totalPages;

                const mediaIds = rawLogos.map((l: any) => l.featured_media).filter(Boolean);
                const mediaList = mediaIds.length
                    ? await fetchREST(`media?include=${mediaIds.join(',')}&_fields=id,source_url,alt_text&per_page=${perPage}`)
                    : [];
                const mediaMap = new Map((mediaList || []).map((m: any) => [m.id, m]));

                logos = rawLogos.map((logo: any) => ({
                    ...logo,
                    _embedded: {
                        'wp:featuredmedia': mediaMap.has(logo.featured_media)
                            ? [mediaMap.get(logo.featured_media)]
                            : []
                    }
                }));
            }
        }
    } catch (error) {
        console.error('Error fetching LogoCategoryPaginated via REST:', error);
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

                <CategoryList />
            </div>
        </div>
    );
}
