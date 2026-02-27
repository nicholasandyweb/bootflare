'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function CategoryError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Category Page Error:', error);
    }, [error]);

    return (
        <div className="min-h-[70vh] flex flex-col items-center justify-center px-6 py-20 bg-slate-50">
            <div className="bg-white p-8 md:p-12 rounded-[3rem] shadow-xl border border-slate-100 max-w-2xl w-full text-center">
                <div className="w-20 h-20 bg-pink-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <svg className="w-10 h-10 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-slate-800 mb-4">Something went wrong</h1>
                <p className="text-slate-600 mb-10 leading-relaxed">
                    We encountered an error while loading this category. This usually happens when our backend is taking too long to respond.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="px-8 py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform"
                    >
                        Try Again
                    </button>
                    <Link
                        href="/logos"
                        className="px-8 py-4 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        Back to Logos
                    </Link>
                </div>
            </div>
        </div>
    );
}
