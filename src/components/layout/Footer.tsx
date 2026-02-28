import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-gradient-to-t from-[#FBF3FF] to-white text-slate-600 py-20 mt-32 border-t border-pink-50">
            <div className="container">
                <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-12 lg:gap-16">
                    {/* Brand Section */}
                    <div className="col-span-2 lg:col-span-1 flex flex-col gap-6">
                        <Link href="/">
                            <img
                                src="https://bootflare.com/wp-content/uploads/2023/03/Bootflare-Logo-e1679434514501-300x110.png"
                                alt="Bootflare"
                                className="h-10 w-auto"
                            />
                        </Link>
                        <p className="text-slate-800 text-sm leading-relaxed max-w-xs font-medium">
                            Powering digital footprints for businesses and organizations with customer-focused design and innovative marketing solutions.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Facebook className="w-5 h-5" />} href="#" />
                            <SocialIcon icon={<Twitter className="w-5 h-5" />} href="#" />
                            <SocialIcon icon={<Instagram className="w-5 h-5" />} href="#" />
                            <SocialIcon icon={<Linkedin className="w-5 h-5" />} href="#" />
                        </div>
                    </div>

                    {/* Legal Links */}
                    <div className="col-span-1">
                        <h3 className="text-slate-900 font-bold text-lg mb-8">Links</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/contact">Contact</FooterLink>
                            <FooterLink href="/privacy-policy">Privacy</FooterLink>
                            <FooterLink href="/terms-of-use">Terms</FooterLink>
                            <FooterLink href="/dmca-policy">DMCA</FooterLink>
                        </ul>
                    </div>

                    {/* Quick Links */}
                    <div className="col-span-1">
                        <h3 className="text-slate-900 font-bold text-lg mb-8">Discover</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/royalty-free-music">Royalty Free Music</FooterLink>
                            <FooterLink href="/logos">Brand Logos</FooterLink>
                            <FooterLink href="/about-us">Agency</FooterLink>
                            <FooterLink href="/blog">Blog</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div className="col-span-2 lg:col-span-1">
                        <h3 className="text-slate-900 font-bold text-lg mb-8">Newsletter</h3>
                        <p className="text-slate-800 text-sm mb-6">Receive the latest tips and digital asset updates directly in your inbox.</p>
                        <form className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-white border border-pink-200 rounded-2xl py-3.5 px-5 text-sm text-slate-800 shadow-[0_4px_20px_-4px_rgba(252,231,243,0.5)] focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            />
                            <button className="absolute right-2 top-2 p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-pink-200 mt-20 pt-8 flex flex-row justify-between items-center gap-4 text-[13px] font-medium text-slate-800">
                    <p><Link href="/" className="text-[#8b5cf6] hover:underline font-bold">Bootflare</Link> © {new Date().getFullYear()}</p>
                    <p className="flex items-center gap-2"><span className="text-secondary animate-pulse">❤️</span> From Africa</p>
                </div>
            </div>
        </footer>
    );
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-slate-800 hover:text-primary transition-colors duration-200 flex items-center gap-2 group font-medium">
                {children}
            </Link>
        </li>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a href={href} className="w-10 h-10 rounded-xl bg-white border border-pink-100 shadow-[0_4px_20px_-4px_rgba(252,231,243,0.5)] flex items-center justify-center text-slate-800 hover:bg-primary hover:text-white hover:-translate-y-1 hover:border-primary/30 transition-all duration-300">
            {icon}
        </a>
    );
}

export default Footer;
