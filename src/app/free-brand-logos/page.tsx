export const dynamic = 'force-dynamic';
import LogosTemplate from '@/components/LogosTemplate';
import { Metadata } from 'next';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';

export async function generateMetadata(): Promise<Metadata> {
    try {
        const seo = await fetchRankMathSEO('https://bootflare.com/free-brand-logos/');
        if (seo) return mapRankMathToMetadata(seo);
    } catch (e) {
        console.error('Metadata fetch failed for free-brand-logos:', e);
    }
    return { title: 'Free Brand Logos | Bootflare' };
}

export default function FreeBrandLogosPage() {
    return (
        <LogosTemplate
            page={1}
            route="/free-brand-logos"
            queryId="/free-brand-logos/"
            seoUrl="https://bootflare.com/free-brand-logos/"
        />
    );
}
