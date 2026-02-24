import { HelpCircle, ChevronRight, MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface FAQ {
    q: string;
    a: string;
}

export default function FAQPage() {
    const faqs: FAQ[] = [
        { q: "What is Bootflare?", a: "Bootflare is a cutting-edge digital agency helping businesses build a dominant online presence through elite web design, technical SEO, and data-driven marketing." },
        { q: "Can I download logos for free?", a: "Yes! Our entire brand logo library is available for free download in high-resolution formats for all your creative and commercial projects." },
        { q: "Do you offer custom web design?", a: "Absolutely. We specialize in bespoke, customer-focused web experiences designed to maximize conversion rates and return on investment." },
        { q: "How can I contact support?", a: "Our team is ready to help. You can reach us via our contact page, email, or connect with us on our professional social channels." }
    ];

    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-32">
            <div className="container max-w-4xl">
                {/* Header */}
                <div className="text-center mb-20">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-bold text-xs mb-6 uppercase tracking-widest">
                        <Sparkles className="w-3 h-3" /> Support Center
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-8 font-ubuntu">Frequently Asked <span className="text-gradient">Questions</span></h1>
                    <p className="text-lg text-slate-500 font-light max-w-2xl mx-auto">
                        Everything you need to know about our services and digital assets. Can't find what you're looking for? Reach out to us.
                    </p>
                </div>

                {/* FAQ List */}
                <div className="space-y-6">
                    {faqs.map((faq, i) => (
                        <div key={i} className="card-premium !p-8 md:!p-10 group bg-white border-transparent hover:border-primary/20">
                            <div className="flex gap-6 items-start">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-300 shrink-0 shadow-sm">
                                    <HelpCircle className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 group-hover:text-primary transition-colors">
                                        {faq.q}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed font-light text-lg">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Support CTA */}
                <div className="mt-20 p-10 md:p-16 bg-gradient-to-br from-primary to-primary-dark rounded-[3rem] text-white text-center shadow-2xl shadow-primary/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-10">
                        <MessageCircle className="w-40 h-40" />
                    </div>
                    <h2 className="text-3xl font-bold mb-6 relative z-10">Still have questions?</h2>
                    <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
                        We're here to help you scale your digital footprint. Contact our expert team today for a free consultation.
                    </p>
                    <Link href="/contact" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-primary rounded-2xl font-bold hover:bg-slate-50 transition-colors shadow-lg relative z-10">
                        Get in Touch <ChevronRight className="w-5 h-5" />
                    </Link>
                </div>
            </div>
        </div>
    );
}
