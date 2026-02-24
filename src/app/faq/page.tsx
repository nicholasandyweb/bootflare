import { fetchGraphQL } from '@/lib/graphql';
import { stripScripts } from '@/lib/sanitize';
import { ChevronRight, MessageCircle, Sparkles, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import { fetchRankMathSEO, mapRankMathToMetadata } from '@/lib/seo';
import { Metadata } from 'next';
import Accordion from '@/components/ui/Accordion';
import { parseFAQs, extractFAQIntro } from '@/lib/faq';

export async function generateMetadata(): Promise<Metadata> {
    const seo = await fetchRankMathSEO('https://bootflare.com/faq/');
    if (seo) return mapRankMathToMetadata(seo);
    return { title: 'FAQ | Bootflare' };
}

const GET_FAQ_PAGE = `
  query GetFAQPage {
    page(id: "/faq/", idType: URI) {
      title
      content
    }
  }
`;

interface WPPage {
    title: string;
    content: string;
}

const FALLBACK_FAQS = [
    { q: "What is Bootflare?", a: "Bootflare is a cutting-edge digital agency helping businesses build a dominant online presence through elite web design, technical SEO, and data-driven marketing." },
    { q: "Can I download logos for free?", a: "Yes! Our entire brand logo library is available for free download in high-resolution formats for all your creative and commercial projects." },
    { q: "Do you offer custom web design?", a: "Absolutely. We specialize in bespoke, customer-focused web experiences designed to maximize conversion rates and return on investment." },
    { q: "How can I contact support?", a: "Our team is ready to help. You can reach us via our contact page, email, or connect with us on our professional social channels." }
];

export default async function FAQPage() {
    let page: WPPage | null = null;
    try {
        const data: { page: WPPage } = await fetchGraphQL(GET_FAQ_PAGE);
        page = data.page;
    } catch (error) {
        console.error('Error fetching FAQ page:', error);
    }

    const intro = page?.content ? extractFAQIntro(page.content) : '';
    const faqs = page?.content ? parseFAQs(page.content) : [];
    const displayFaqs = faqs.length > 0 ? faqs : FALLBACK_FAQS;

    return (
        <div className="bg-white min-h-screen pt-32 pb-32" suppressHydrationWarning>
            <div className="container max-w-4xl px-6" suppressHydrationWarning>
                {/* Header */}
                <header className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-8 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Support Center
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-8 font-ubuntu leading-tight">
                        {page?.title ?? 'Frequently Asked'} <span className="text-gradient">Questions</span>
                    </h1>
                    {intro ? (
                        <div
                            className="text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed faq-intro
                            [&_p]:mb-4 [&_a]:text-primary hover:[&_a]:underline"
                            dangerouslySetInnerHTML={{ __html: stripScripts(intro) }}
                            suppressHydrationWarning
                        />
                    ) : (
                        <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto leading-relaxed">
                            Find answers to common questions about our services, brand assets, and how we help businesses grow.
                        </p>
                    )}
                </header>

                <div className="grid gap-16" suppressHydrationWarning>
                    {/* Main FAQ Accordion */}
                    <section>
                        <div className="flex items-center gap-4 mb-10">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900">General Information</h2>
                                <p className="text-slate-500">Quick answers to common inquiries</p>
                            </div>
                        </div>

                        <Accordion items={displayFaqs} />
                    </section>
                </div>

                {/* Support CTA */}
                <div className="mt-32 p-10 md:p-20 bg-slate-900 rounded-[3rem] text-white text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[100px] -z-0 -mr-32 -mt-32 transition-all duration-700 group-hover:scale-150" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-[100px] -z-0 -ml-32 -mb-32 transition-all duration-700 group-hover:scale-150" />

                    <div className="relative z-10">
                        <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm border border-white/10 group-hover:bg-primary transition-colors">
                            <MessageCircle className="w-10 h-10" />
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black mb-6 font-ubuntu">Still have questions?</h2>
                        <p className="text-slate-400 text-xl mb-12 max-w-xl mx-auto font-light leading-relaxed">
                            Our team is here to help with any custom requests or technical support.
                        </p>
                        <Link href="/contact" className="btn-premium !bg-white !text-primary !hover:bg-slate-50">
                            Connect with Support <ChevronRight className="w-5 h-5 ml-1" />
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
