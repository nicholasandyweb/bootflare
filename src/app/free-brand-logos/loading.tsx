import CategoryListSkeleton from '@/components/CategoryListSkeleton';

/** Free brand logos page skeleton */
export default function FreeBrandLogosLoading() {
    return (
        <div className="animate-pulse bg-slate-50 min-h-screen">
            <div className="bg-[#FBF3FF] py-16 px-6 pt-32 pb-16">
                <div className="container max-w-4xl mx-auto text-center">
                    <div className="h-10 bg-slate-200 rounded-2xl w-2/5 mx-auto mb-6" />
                    <div className="h-5 bg-slate-100 rounded w-4/5 mx-auto mb-2" />
                    <div className="h-5 bg-slate-100 rounded w-3/5 mx-auto mb-10" />
                    <div className="max-w-xl mx-auto h-14 bg-white border border-pink-100 rounded-2xl shadow-sm" />
                </div>
            </div>
            <div className="container px-6 py-16">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    {[...Array(24)].map((_, i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 pb-5 shadow-sm border border-slate-100/50 aspect-square flex flex-col justify-between">
                            <div className="flex-1 w-full bg-slate-100 rounded-xl mb-4" />
                            <div className="h-4 w-3/4 bg-slate-100 rounded mx-auto" />
                        </div>
                    ))}
                </div>
                <CategoryListSkeleton />
            </div>
        </div>
    );
}
