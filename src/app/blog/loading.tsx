import { Calendar, ChevronRight } from 'lucide-react';

export default function BlogLoading() {
    return (
        <div className="bg-slate-50 min-h-screen pt-32 pb-20">
            <div className="container">
                {/* Header Skeleton */}
                <div className="text-center max-w-2xl mx-auto mb-16 animate-pulse">
                    <div className="h-14 bg-slate-200 rounded-2xl w-3/4 mx-auto mb-6" />
                    <div className="space-y-3">
                        <div className="h-5 bg-slate-200 rounded w-full" />
                        <div className="h-5 bg-slate-200 rounded w-4/5 mx-auto" />
                    </div>
                </div>

                {/* Featured Post Skeleton */}
                <div className="mb-16 animate-pulse">
                    <div className="grid lg:grid-cols-2 gap-10 items-center bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-100 p-6 md:p-10">
                        <div className="block relative aspect-video rounded-[2rem] bg-slate-100" />
                        <div>
                            <div className="flex gap-2 mb-6">
                                <div className="h-6 w-20 bg-primary/10 rounded-full" />
                                <div className="h-6 w-24 bg-primary/10 rounded-full" />
                            </div>
                            <div className="space-y-4 mb-6">
                                <div className="h-10 bg-slate-200 rounded-xl w-full" />
                                <div className="h-10 bg-slate-200 rounded-xl w-3/4" />
                            </div>
                            <div className="space-y-3 mb-8">
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-2/3" />
                            </div>
                            <div className="h-12 w-40 bg-slate-200 rounded-xl" />
                        </div>
                    </div>
                </div>

                {/* Grid Section Skeleton */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                    {[...Array(6)].map((_, i) => (
                        <article key={i} className="card-premium !p-0 flex flex-col group h-full">
                            <div className="relative h-64 overflow-hidden rounded-t-[2rem] bg-slate-100" />
                            <div className="p-8 flex flex-col flex-1">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-3 w-16 bg-primary/20 rounded" />
                                    <span className="text-slate-200">•</span>
                                    <div className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3 text-slate-200" />
                                        <div className="h-3 w-20 bg-slate-200 rounded" />
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="h-6 bg-slate-200 rounded w-full" />
                                    <div className="h-6 bg-slate-200 rounded w-4/5" />
                                </div>

                                <div className="space-y-2 mb-8 flex-1">
                                    <div className="h-3 bg-slate-100 rounded w-full" />
                                    <div className="h-3 bg-slate-100 rounded w-5/6" />
                                </div>

                                <div className="flex items-center gap-2 text-primary/40 font-bold text-sm">
                                    <div className="h-4 w-24 bg-slate-200 rounded" />
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
}
