/** Logo categories page skeleton */
export default function LogoCategoriesLoading() {
    return (
        <div className="animate-pulse bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <div className="h-10 bg-slate-200 rounded-2xl w-2/5 mx-auto mb-6" />
                    <div className="h-5 bg-slate-100 rounded w-3/5 mx-auto mb-2" />
                    <div className="h-5 bg-slate-100 rounded w-2/5 mx-auto mb-10" />
                    <div className="max-w-xl mx-auto h-14 bg-white border border-pink-100 rounded-2xl shadow-sm" />
                </div>
            </div>

            {/* Category grid */}
            <div className="container py-16 px-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                    {[...Array(20)].map((_, i) => (
                        <div key={i} className="bg-white rounded-2xl border border-pink-100 px-6 py-5 text-center shadow-sm">
                            <div className="h-5 bg-slate-200 rounded-lg w-3/5 mx-auto mb-3" />
                            <div className="h-4 w-16 bg-slate-100 rounded mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
