export const revalidate = 3600;
export const dynamic = 'force-dynamic';
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

export const dynamicParams = true;
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
