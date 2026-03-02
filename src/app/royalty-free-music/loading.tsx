/** Royalty-free music page skeleton */
export default function MusicLoading() {
    return (
        <div className="animate-pulse bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <div className="h-10 bg-slate-200 rounded-2xl w-2/5 mx-auto mb-6" />
                    <div className="h-5 bg-slate-100 rounded w-3/5 mx-auto mb-2" />
                    <div className="h-5 bg-slate-100 rounded w-2/5 mx-auto" />
                </div>
            </div>

            {/* Album grid */}
            <div className="container py-16 px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                            <div className="w-full aspect-square bg-slate-200" />
                            <div className="p-6 space-y-3">
                                <div className="h-6 bg-slate-200 rounded-lg w-4/5" />
                                <div className="h-4 bg-slate-100 rounded w-full" />
                                <div className="h-4 bg-slate-100 rounded w-5/6" />
                                <div className="flex gap-2 mt-4">
                                    <div className="h-9 w-24 bg-purple-100 rounded-xl" />
                                    <div className="h-9 w-20 bg-slate-100 rounded-xl" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
