"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isDownloadsOpen, setIsDownloadsOpen] = useState(false);
    const [isBlogOpen, setIsBlogOpen] = useState(false);

    return (
        <header className="fixed top-0 left-0 w-full z-50 bg-white py-4 border-b border-slate-100">
            <div className="container flex justify-between items-center">
                <Link href="/" className="flex items-center gap-2">
                    <Image
                        src="https://bootflare.com/wp-content/uploads/2023/03/Bootflare-Logo-e1679434514501-300x110.png"
                        alt="Bootflare Logo"
                        width={140}
                        height={50}
                        priority
                        className="w-auto h-8 md:h-10"
                    />
                </Link>

                <nav className="hidden lg:flex gap-8 items-center">
                    <Link href="/" className="font-bold text-primary">Home</Link>
                    <Link href="/about-us" className="font-semibold text-slate-600 hover:text-primary transition-colors">About</Link>
                    <div className="group relative">
                        <button className="flex items-center gap-1 font-semibold text-slate-600 hover:text-primary transition-colors py-2">
                            Downloads <ChevronDown className="w-4 h-4" />
                        </button>
                        <div className="absolute hidden group-hover:block top-full left-0 bg-white shadow-2xl rounded-2xl p-3 min-w-[220px] border border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <Link
                                href="/free-brand-logos"
                                className="block px-4 py-2.5 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors font-medium text-slate-700 border-b border-pink-100"
                            >
                                Free Brand Logos
                            </Link>
                            <Link
                                href="/royalty-free-music"
                                className="block px-4 py-2.5 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors font-medium text-slate-700"
                            >
                                Royalty Free Music
                            </Link>
                        </div>
                    </div>

                    <div className="group relative">
                        <Link href="/blog" className="flex items-center gap-1 font-semibold text-slate-600 hover:text-primary transition-colors py-2">
                            Blog <ChevronDown className="w-4 h-4" />
                        </Link>
                        <div className="absolute hidden group-hover:block top-full left-0 bg-white shadow-2xl rounded-2xl p-3 min-w-[180px] border border-slate-100 animate-in fade-in slide-in-from-top-2">
                            <Link
                                href="/category/general"
                                className="block px-4 py-2.5 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors font-medium text-slate-700 border-b border-pink-100"
                            >
                                General
                            </Link>
                            <Link
                                href="/category/tech"
                                className="block px-4 py-2.5 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors font-medium text-slate-700 border-b border-pink-100"
                            >
                                Tech
                            </Link>
                            <Link
                                href="/category/tips"
                                className="block px-4 py-2.5 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors font-medium text-slate-700 border-b border-pink-100"
                            >
                                Tips
                            </Link>
                            <Link
                                href="/category/web-design"
                                className="block px-4 py-2.5 hover:bg-slate-50 hover:text-primary rounded-xl transition-colors font-medium text-slate-700"
                            >
                                Web Design
                            </Link>
                        </div>
                    </div>

                    <Link href="/faq" className="font-semibold text-slate-600 hover:text-primary transition-colors">FAQ</Link>
                </nav>

                <button
                    className="lg:hidden p-2 text-slate-600 hover:text-primary transition-colors"
                    onClick={() => {
                        const next = !isMenuOpen;
                        setIsMenuOpen(next);
                        if (!next) {
                            setIsDownloadsOpen(false);
                            setIsBlogOpen(false);
                        }
                    }}
                >
                    {isMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <>
                    {/* Clickable overlay to close menu when tapping outside */}
                    <div
                        className="fixed inset-0 z-40 lg:hidden"
                        onClick={() => {
                            setIsMenuOpen(false);
                            setIsDownloadsOpen(false);
                            setIsBlogOpen(false);
                        }}
                    />
                    <div
                        className="lg:hidden absolute top-full left-0 w-full bg-white border-b border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top duration-300 z-50"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <Link
                            href="/"
                            className="font-bold text-primary text-lg border-b border-pink-100 pb-3"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <button
                            type="button"
                            className="flex items-center justify-between text-left font-semibold text-slate-700 text-lg border-b border-pink-100 pb-3"
                            onClick={() => setIsDownloadsOpen((prev) => !prev)}
                        >
                            <span>Downloads</span>
                            <ChevronDown
                                className={`w-5 h-5 transition-transform ${isDownloadsOpen ? 'rotate-180 text-primary' : ''}`}
                            />
                        </button>
                        {isDownloadsOpen && (
                            <div className="ml-3 flex flex-col gap-2 mt-2">
                                <Link
                                    href="/free-brand-logos"
                                    className="font-semibold text-slate-700 text-base border-b border-pink-100 pb-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Free Brand Logos
                                </Link>
                                <Link
                                    href="/royalty-free-music"
                                    className="font-semibold text-slate-700 text-base pb-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Royalty Free Music
                                </Link>
                            </div>
                        )}
                        <button
                            type="button"
                            className="flex items-center justify-between text-left font-semibold text-slate-700 text-lg border-b border-pink-100 pb-3 mt-2"
                            onClick={() => setIsBlogOpen((prev) => !prev)}
                        >
                            <span>Blog</span>
                            <ChevronDown
                                className={`w-5 h-5 transition-transform ${isBlogOpen ? 'rotate-180 text-primary' : ''}`}
                            />
                        </button>
                        {isBlogOpen && (
                            <div className="ml-3 flex flex-col gap-2 mt-2">
                                <Link
                                    href="/category/general"
                                    className="font-semibold text-slate-700 text-base border-b border-pink-100 pb-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    General
                                </Link>
                                <Link
                                    href="/category/tech"
                                    className="font-semibold text-slate-700 text-base border-b border-pink-100 pb-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Tech
                                </Link>
                                <Link
                                    href="/category/tips"
                                    className="font-semibold text-slate-700 text-base border-b border-pink-100 pb-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Tips
                                </Link>
                                <Link
                                    href="/category/web-design"
                                    className="font-semibold text-slate-700 text-base pb-2"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Web Design
                                </Link>
                            </div>
                        )}
                        <Link
                            href="/faq"
                            className="font-semibold text-slate-700 text-lg pb-3"
                            onClick={() => setIsMenuOpen(false)}
                        >
                            FAQ
                        </Link>
                    </div>
                </>
            )}
        </header>
    );
};

export default Header;
