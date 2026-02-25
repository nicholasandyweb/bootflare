export default function Loading() {
    return (
        <div className="bg-slate-50 min-h-screen">
            {/* Hero Skeleton */}
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16 animate-pulse">
                <div className="container max-w-4xl mx-auto text-center">
                    <div className="h-14 bg-slate-200 rounded-2xl w-3/4 mx-auto mb-6" />
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <div className="h-4 w-12 bg-slate-200 rounded" />
                        <div className="h-4 w-4 bg-slate-200 rounded-full" />
                        <div className="h-4 w-32 bg-slate-200 rounded" />
                    </div>
                    <div className="h-6 bg-slate-200 rounded-xl w-full max-w-2xl mx-auto mb-10" />
                    <div className="max-w-xl mx-auto">
                        <div className="h-16 bg-white border border-slate-200 rounded-[2rem] shadow-sm" />
                    </div>
                </div>
            </div>

            {/* Grid Skeleton */}
            <div className="container px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 animate-pulse">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] border border-slate-100 p-4 shadow-sm">
                            <div className="aspect-square bg-slate-50 rounded-[1.5rem] mb-4" />
                            <div className="h-5 bg-slate-100 rounded-lg w-3/4 mx-auto" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
