/** Blog post (article) page skeleton */
export default function BlogPostLoading() {
    return (
        <div className="animate-pulse bg-slate-50 min-h-screen">
            {/* Breadcrumb */}
            <div className="bg-gray-50 border-b border-gray-100 py-4">
                <div className="container px-6 flex items-center gap-2">
                    <div className="h-4 w-10 bg-slate-200 rounded" />
                    <div className="h-4 w-2 bg-slate-100 rounded" />
                    <div className="h-4 w-14 bg-slate-200 rounded" />
                    <div className="h-4 w-2 bg-slate-100 rounded" />
                    <div className="h-4 w-40 bg-slate-200 rounded" />
                </div>
            </div>

            <div className="container py-16 px-6 max-w-4xl mx-auto">
                {/* Category + meta */}
                <div className="flex gap-3 items-center mb-6">
                    <div className="h-6 w-20 bg-purple-100 rounded-full" />
                    <div className="h-4 w-28 bg-slate-100 rounded" />
                </div>

                {/* Title */}
                <div className="space-y-4 mb-10">
                    <div className="h-10 bg-slate-200 rounded-2xl w-full" />
                    <div className="h-10 bg-slate-200 rounded-2xl w-4/5" />
                    <div className="h-10 bg-slate-100 rounded-2xl w-3/5" />
                </div>

                {/* Featured image */}
                <div className="w-full h-72 md:h-96 bg-slate-200 rounded-3xl mb-12" />

                {/* Content lines */}
                <div className="space-y-3">
                    {[100, 100, 95, 100, 88, 100, 100, 92, 100, 75].map((w, i) => (
                        <div key={i} className={`h-4 bg-slate-100 rounded w-[${w}%]`} style={{ width: `${w}%` }} />
                    ))}
                </div>

                {/* Comment section skeleton */}
                <div className="mt-20 space-y-4">
                    <div className="h-8 w-36 bg-slate-200 rounded-xl mb-8" />
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200" />
                                <div>
                                    <div className="h-4 w-28 bg-slate-200 rounded mb-1" />
                                    <div className="h-3 w-20 bg-slate-100 rounded" />
                                </div>
                            </div>
                            <div className="h-4 bg-slate-100 rounded w-full" />
                            <div className="h-4 bg-slate-100 rounded w-4/5" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
