import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await fetchRankMathSEO('https://bootflare.com/contact/');
    if (seo) return mapRankMathToMetadata(seo);
    return { title: 'Contact Us | Bootflare' };
}

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
