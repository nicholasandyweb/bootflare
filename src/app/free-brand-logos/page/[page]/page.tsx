export const revalidate = 3600;
import LogosTemplate from '@/components/LogosTemplate';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const seo = await fetchRankMathSEO('https://bootflare.com/free-brand-logos/');
        if (seo) return mapRankMathToMetadata(seo);
    } catch (e) {
        console.error('Metadata fetch failed for free-brand-logos/page/[page]:', e);
    }
    return { title: 'Free Brand Logos | Bootflare' };
}

export async function generateStaticParams() {
    try {
        const response = await fetch('https://bootflare.com/wp-json/wp/v2/logo?per_page=12&_fields=id', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            }
        });
        const totalPagesStr = response.headers.get('x-wp-totalpages');
        const totalPages = totalPagesStr ? parseInt(totalPagesStr, 10) : 1;

        if (totalPages <= 1) return [];

        return Array.from({ length: totalPages - 1 }, (_, i) => ({
            page: (i + 2).toString(),
        }));
    } catch (e) {
        console.error('Failed to generate static params for /free-brand-logos:', e);
        return [];
    }
}



export default async function FreeLogosPaginated({ params }: { params: Promise<{ page: string }> }) {
    const { page: pageStr } = await params;
    const page = parseInt(pageStr, 10);

    return (
        <LogosTemplate
            page={page}
            route="/free-brand-logos"
            queryId="/free-brand-logos/"
            seoUrl="https://bootflare.com/free-brand-logos/"
        />
    );
}
