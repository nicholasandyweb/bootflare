import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, ArrowRight } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-slate-900 text-slate-300 py-20 mt-32">
            <div className="container">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-16">
                    {/* Brand Section */}
                    <div className="flex flex-col gap-6">
                        <Link href="/">
                            <img
                                src="https://bootflare.com/wp-content/uploads/2023/03/Bootflare-Logo-e1679434514501-300x110.png"
                                alt="Bootflare"
                                className="h-10 w-auto brightness-0 invert"
                            />
                        </Link>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                            Powering digital footprints for businesses and organizations with customer-focused design and innovative marketing solutions.
                        </p>
                        <div className="flex gap-4">
                            <SocialIcon icon={<Facebook className="w-5 h-5" />} href="#" />
                            <SocialIcon icon={<Twitter className="w-5 h-5" />} href="#" />
                            <SocialIcon icon={<Instagram className="w-5 h-5" />} href="#" />
                            <SocialIcon icon={<Linkedin className="w-5 h-5" />} href="#" />
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-8">Discover</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/logos">Brand Identities</FooterLink>
                            <FooterLink href="/royalty-free-music">Royalty Free Music</FooterLink>
                            <FooterLink href="/blog">Our Blog</FooterLink>
                            <FooterLink href="/about-us">About Bootflare</FooterLink>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-8">Company</h3>
                        <ul className="space-y-4">
                            <FooterLink href="/contact">Contact Us</FooterLink>
                            <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
                            <FooterLink href="/terms-of-use">Terms of Use</FooterLink>
                            <FooterLink href="/dmca-policy">DMCA Policy</FooterLink>
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="text-white font-bold text-lg mb-8">Newsletter</h3>
                        <p className="text-slate-400 text-sm mb-6">Receive the latest tips and digital asset updates directly in your inbox.</p>
                        <form className="relative group">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-3.5 px-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                            <button className="absolute right-2 top-2 p-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </form>
                    </div>
                </div>

                <div className="border-t border-slate-800 mt-20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-medium text-slate-500 uppercase tracking-widest">
                    <p>© {new Date().getFullYear()} Bootflare. All rights reserved.</p>
                    <p className="flex items-center gap-2">Built with <span className="text-secondary animate-pulse">❤️</span> for the Digital World</p>
                </div>
            </div>
        </footer>
    );
};

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
    return (
        <li>
            <Link href={href} className="text-slate-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group">
                <span className="w-1 h-1 rounded-full bg-primary/0 group-hover:bg-primary transition-all duration-200"></span>
                {children}
            </Link>
        </li>
    );
}

function SocialIcon({ icon, href }: { icon: React.ReactNode; href: string }) {
    return (
        <a href={href} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-slate-400 hover:bg-primary hover:text-white hover:-translate-y-1 transition-all duration-300">
            {icon}
        </a>
    );
}

export default Footer;
