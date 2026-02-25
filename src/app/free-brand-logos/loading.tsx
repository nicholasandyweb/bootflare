import { Sparkles, LayoutGrid, Clock } from 'lucide-react';
import CategoryList from '@/components/CategoryList';

export default function FreeBrandLogosLoading() {
    return (
        <div className="bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center animate-pulse">
                    <div className="h-12 md:h-14 bg-slate-200/60 rounded-2xl w-3/4 mx-auto mb-6" />

                    <div className="flex items-center justify-center gap-1.5 mb-8">
                        <div className="h-4 w-12 bg-slate-200/60 rounded" />
                        <span className="text-slate-200/60 text-xs mt-0.5">»</span>
                        <div className="h-4 w-32 bg-slate-200/60 rounded" />
                    </div>

                    <div className="h-6 bg-slate-200/60 rounded-xl w-full max-w-2xl mx-auto mb-10" />

                    <div className="max-w-xl mx-auto">
                        <div className="relative w-full">
                            <div className="w-full h-16 bg-white border border-slate-200 rounded-[2rem] shadow-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="container px-6 py-16">
                <section className="mb-32">
                    {/* Logo Grid Skeleton */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6 mb-16 animate-pulse">
                        {[...Array(24)].map((_, i) => (
                            <div key={i} className="card-premium !p-0 aspect-square flex flex-col items-center justify-center gap-2 overflow-hidden bg-white/50 border-slate-100">
                                <div className="flex-1 min-h-0 w-full flex items-center justify-center p-6">
                                    <div className="w-24 h-24 bg-slate-100 rounded-full" />
                                </div>
                                <div className="w-full py-5 px-4 bg-white/50 border-t border-slate-100">
                                    <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Pagination Skeleton */}
                    <div className="flex items-center justify-center gap-4 mt-16 mb-24 animate-pulse">
                        <div className="flex items-center gap-3">
                            <div className="w-[42px] h-[42px] rounded-[10px] bg-slate-200" />
                            <div className="w-[42px] h-[42px] rounded-[10px] bg-slate-200" />
                            <div className="w-[42px] h-[42px] rounded-[10px] bg-slate-200" />
                            <div className="h-4 w-6 bg-slate-200 rounded mx-1" />
                            <div className="w-[42px] h-[42px] rounded-[10px] bg-slate-200" />
                        </div>
                    </div>

                    {/* Categories UI loads instantly as client component, so we just drop it in */}
                    <CategoryList />
                </section>
            </div>
        </div>
    );
}
