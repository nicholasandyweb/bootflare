import { Headphones, Play } from 'lucide-react';
import DmcaCard from '@/components/DmcaCard';
import Link from 'next/link';

export default function RoyaltyFreeMusicLoading() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Section Skeleton */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center animate-pulse">
                    <div className="h-12 md:h-14 bg-slate-200/60 rounded-2xl w-3/4 mx-auto mb-6" />

                    <div className="flex items-center justify-center gap-1.5 mb-8">
                        <div className="h-4 w-12 bg-slate-200/60 rounded" />
                        <span className="text-slate-200/60 text-xs mt-0.5">»</span>
                        <div className="h-4 w-32 bg-slate-200/60 rounded" />
                    </div>

                    <div className="h-6 bg-slate-200/60 rounded-xl w-full max-w-2xl mx-auto" />
                </div>
            </div>

            <div className="container px-6 py-16">
                {/* Music Gallery Skeleton */}
                <section className="mb-32 mt-12">
                    <div className="text-center mb-16 animate-pulse">
                        <div className="h-9 w-64 bg-slate-200 rounded-xl mx-auto" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-pulse">
                        {[...Array(12)].map((_, i) => (
                            <div key={i} className="bg-white rounded-[2.5rem] border border-pink-50 p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                                <div className="relative aspect-square rounded-[2rem] overflow-hidden bg-slate-100 mb-6" />
                                <div className="px-2 pb-2">
                                    <div className="h-5 w-3/4 bg-slate-200 rounded-lg mb-4" />
                                    <div className="flex items-center justify-between text-xs font-semibold text-[#8b5cf6]/40">
                                        <span className="flex items-center gap-1.5 uppercase tracking-widest">
                                            <Headphones className="w-3 h-3" />
                                            Hi-Fi Audio
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Categories / Archive links Skeleton (Loads instantly as static UI) */}
                <div className="mt-32">
                    <div className="text-center mb-12 animate-pulse">
                        <div className="h-9 w-56 bg-slate-200 rounded-xl mx-auto" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="block bg-[#FBF3FF]/50 border border-pink-100/50 rounded-3xl p-10 text-center animate-pulse">
                            <div className="h-8 w-48 bg-slate-200 rounded-xl mx-auto mb-4" />
                            <div className="h-4 w-64 bg-slate-200 rounded mx-auto" />
                        </div>
                        <div className="block bg-white/50 border border-slate-100/50 rounded-3xl p-10 text-center animate-pulse">
                            <div className="h-8 w-56 bg-slate-200 rounded-xl mx-auto mb-4" />
                            <div className="h-4 w-72 bg-slate-200 rounded mx-auto" />
                        </div>
                    </div>
                </div>

                {/* Global Footer Components */}
                <div className="mt-32">
                    <DmcaCard />
                </div>
            </div>
        </div>
    );
}
