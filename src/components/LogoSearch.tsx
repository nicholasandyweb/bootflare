'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Logo {
    id: number;
    title: {
        rendered: string;
    };
    slug: string;
    _embedded?: {
        'wp:featuredmedia'?: {
            source_url: string;
            alt_text?: string;
        }[];
    };
}

interface LogoSearchProps {
    initialLogos?: Logo[];
    placeholder?: string;
    initialQuery?: string;
}

const defaultLogos: Logo[] = [];

export default function LogoSearch({ initialLogos = defaultLogos, placeholder = "Search Logo here...", initialQuery = "" }: LogoSearchProps) {
    const [query, setQuery] = useState(initialQuery);
    const [results, setResults] = useState<Logo[]>(initialLogos);
    const [isLoading, setIsLoading] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            // Check if the click occurred on the browser scrollbar
            const clickedOnScrollbar =
                event.clientX >= document.documentElement.clientWidth ||
                event.clientY >= document.documentElement.clientHeight;

            if (clickedOnScrollbar) {
                return; // Do nothing if it's a scrollbar click
            }

            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const abortController = new AbortController();

        const searchLogos = async () => {
            if (query.trim().length === 0) {
                setResults(initialLogos);
                setIsLoading(false);
                setIsDropdownOpen(false);
                return;
            }

            setIsLoading(true);
            try {
                const response = await fetch(`/api/logos/search?q=${encodeURIComponent(query)}`, {
                    signal: abortController.signal
                });
                if (response.ok) {
                    const data = await response.json();
                    setResults(data);

                    // Only open if the user is still interacting with the search component
                    if (dropdownRef.current && dropdownRef.current.contains(document.activeElement)) {
                        setIsDropdownOpen(true);
                    }
                }
            } catch (error: unknown) {
                if (error instanceof Error && error.name !== 'AbortError') {
                    console.error('Search error:', error);
                }
            } finally {
                if (!abortController.signal.aborted) {
                    setIsLoading(false);
                }
            }
        };

        const timeoutId = setTimeout(searchLogos, 300);
        return () => {
            clearTimeout(timeoutId);
            abortController.abort();
        };
    }, [query, initialLogos]);

    return (
        <div className="relative w-full max-w-2xl mx-auto" ref={dropdownRef}>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                    ) : (
                        <Search className="w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => query.trim().length > 0 && setIsDropdownOpen(true)}
                    onClick={() => query.trim().length > 0 && setIsDropdownOpen(true)}
                    placeholder={placeholder}
                    className="w-full pl-14 pr-6 py-4 bg-white border border-slate-200 rounded-[2rem] focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-lg text-slate-700 shadow-xl"
                />
            </div>

            {isDropdownOpen && results.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="p-4 max-h-[400px] overflow-y-auto">
                        <div className="grid grid-cols-2 gap-4">
                            {results.slice(0, 10).map((logo) => {
                                const featuredImage = logo._embedded?.['wp:featuredmedia']?.[0]?.source_url;
                                return (
                                    <Link
                                        key={logo.id}
                                        href={`/logo/${logo.slug}`}
                                        className="flex items-center gap-4 p-4 rounded-3xl hover:bg-slate-50 transition-colors group"
                                        onClick={() => setIsDropdownOpen(false)}
                                    >
                                        <div className="w-16 h-16 bg-white border border-slate-100 rounded-2xl flex items-center justify-center p-2 shrink-0">
                                            <img
                                                src={featuredImage || "https://via.placeholder.com/100"}
                                                alt={logo.title.rendered}
                                                className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform"
                                            />
                                        </div>
                                        <span className="font-bold text-slate-700 group-hover:text-primary transition-colors line-clamp-1">
                                            {logo.title.rendered}
                                        </span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                    <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
                        <Link
                            href={`/logos?s=${encodeURIComponent(query)}`}
                            className="text-sm font-bold text-primary hover:underline"
                            onClick={() => setIsDropdownOpen(false)}
                        >
                            View all results
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
